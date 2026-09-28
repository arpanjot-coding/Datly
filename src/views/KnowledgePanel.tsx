/**
 * KnowledgePanel — panel for browsing and editing knowledge items.
 *
 * Shows two collapsible sections: Rules (flat) and Workflows (flat).
 * Items are tagged for organization; no subdirectory grouping.
 * Supports search, edit, and delete. Rules can be created directly by
 * the user via the "+" affordance; workflows are produced by the
 * agent's distillation flow (see SessionDistill).
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Radio,
    RadioGroup,
    FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';

import { useKnowledgeStore } from '../app/useKnowledgeStore';
import { MarkdownEditor } from '../components/MarkdownEditor';
import {
    deleteKnowledge,
    readDataMemory,
    rewriteDataMemory,
    type KnowledgeCategory,
} from '../api/knowledgeApi';
import type { KnowledgeItem } from '../api/knowledgeApi';
import { borderColor, radius } from '../app/tokens';
import { dfActions, dfSelectors, type DataFormulatorState } from '../app/dfSlice';
import { isLeafDerivedTable, buildLeafEvents } from './workflowContext';
import { SessionDistillDialog, findSessionWorkflow } from './SessionDistill';
import { iconVar, textVar } from '../app/layout';
import { apiRequest } from '../app/apiClient';
import { setTableBindings } from '../app/pipelineApi';
import { CONNECTOR_URLS } from '../app/utils';
import type { ConnectorInstance, DictTable } from '../components/ComponentType';
import { getConnectorIcon, connectorSortOrder } from '../icons';

// Default file name and seed body for a brand-new rule. Rules are plain
// Markdown — the user just edits the body; no front matter is required.
const DEFAULT_RULE_FILENAME = 'agent.md';
const RULE_TEMPLATE = `# Agent rules

Describe the constraints or conventions the agent should follow.
`;

type EditorKind = KnowledgeCategory | 'memory';

type WorkflowRunKind = 'tables' | 'connector';

type WorkflowRunTarget =
    | { kind: 'tables' }
    | { kind: 'connector'; connectorId: string; displayName: string };

const isConnectorRunnable = (connector: ConnectorInstance): boolean =>
    connector.connected || connector.auth_mode === 'none';

// ── Persistent action row (always visible at the top of each section) ────

interface ActionRowProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    hint?: string;
}

const ActionRow: React.FC<ActionRowProps> = ({ icon, label, onClick, disabled, hint }) => (
    <Box
        onClick={disabled ? undefined : onClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        sx={{
            display: 'flex', alignItems: hint ? 'flex-start' : 'center', gap: 0.75,
            mx: 1.5, my: 0.5,
            px: 1, py: 0.5,
            cursor: disabled ? 'default' : 'pointer',
            color: disabled ? 'text.disabled' : '#252525',
            border: '1px solid',
            borderColor: disabled ? '#e5e5e1' : '#d4d4d0',
            borderRadius: 1,
            bgcolor: disabled ? '#f7f7f5' : '#f1f1ef',
            pointerEvents: disabled ? 'none' : 'auto',
            transition: 'background-color 120ms ease, border-color 120ms ease',
            '&:hover': disabled ? undefined : {
                bgcolor: '#e5e5e1',
                borderColor: '#bdbdb8',
            },
            '&:focus-visible': disabled ? undefined : {
                outline: '2px solid #6b6b6b',
                outlineOffset: 2,
            },
            userSelect: 'none',
        }}
    >
        <Box sx={{ color: 'inherit', display: 'flex', mt: hint ? 0.125 : 0 }}>{icon}</Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
                fontSize: textVar.sm, fontWeight: 500, color: 'inherit', wordBreak: 'break-word',
            }}>
                {label}
            </Typography>
            {hint && (
                <Typography sx={{
                    fontSize: textVar.xs, color: 'text.disabled', lineHeight: 1.45, wordBreak: 'break-word', mt: 0.125,
                }}>
                    {hint}
                </Typography>
            )}
        </Box>
    </Box>
);

interface WorkflowRunTargetDialogProps {
    item: KnowledgeItem | null;
    tables: DictTable[];
    onClose: () => void;
    onRun: (item: KnowledgeItem, target: WorkflowRunTarget) => Promise<boolean>;
}

const WorkflowRunTargetDialog: React.FC<WorkflowRunTargetDialogProps> = ({
    item, tables, onClose, onRun,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const open = !!item;
    const hasTables = tables.length > 0;
    const tableNames = tables.map(tbl => tbl.displayId || tbl.id).join(', ');

    const [kind, setKind] = useState<WorkflowRunKind>('tables');
    const [selectedConnectorId, setSelectedConnectorId] = useState('');
    const [connectors, setConnectors] = useState<ConnectorInstance[]>([]);
    const [loadingConnectors, setLoadingConnectors] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const userPickedRef = useRef(false);

    const sortedConnectors = useMemo(
        () => [...connectors].sort((a, b) => connectorSortOrder(a.source_type, b.source_type)),
        [connectors],
    );
    const runnableConnectors = useMemo(
        () => sortedConnectors.filter(isConnectorRunnable),
        [sortedConnectors],
    );
    const selectedConnector = selectedConnectorId
        ? sortedConnectors.find(c => c.id === selectedConnectorId)
        : undefined;
    const selectedRunnable = selectedConnector && isConnectorRunnable(selectedConnector)
        ? selectedConnector
        : undefined;
    const canRun = !submitting && (
        kind === 'tables' ? hasTables : (!loadingConnectors && !!selectedRunnable)
    );

    useEffect(() => {
        if (!open) {
            userPickedRef.current = false;
            setSubmitting(false);
            return;
        }

        userPickedRef.current = false;
        setKind(hasTables ? 'tables' : 'connector');
        setSelectedConnectorId('');
        setConnectors([]);
        setLoadingConnectors(true);

        let cancelled = false;
        apiRequest<{ connectors?: ConnectorInstance[] }>(CONNECTOR_URLS.LIST, { method: 'GET' })
            .then(({ data }) => {
                if (cancelled) return;
                const list = data.connectors || [];
                setConnectors(list);
                if (userPickedRef.current) return;
                const first = [...list]
                    .sort((a, b) => connectorSortOrder(a.source_type, b.source_type))
                    .find(isConnectorRunnable);
                if (first) setSelectedConnectorId(first.id);
            })
            .catch(() => {
                if (cancelled) return;
                setConnectors([]);
                setSelectedConnectorId('');
            })
            .finally(() => {
                if (!cancelled) setLoadingConnectors(false);
            });

        return () => { cancelled = true; };
        // Fetch and default selection bind to this open; table count is read at open.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const disabledWhy = kind === 'tables' && !hasTables
        ? t('knowledge.noTablesForRun')
        : kind === 'connector' && loadingConnectors
            ? t('knowledge.connectorsLoading')
            : kind === 'connector' && sortedConnectors.length === 0
                ? t('knowledge.noConnector')
                : kind === 'connector' && !selectedRunnable
                    ? t('knowledge.connectorDisconnected')
                    : '';

    const pickKind = (next: WorkflowRunKind) => {
        userPickedRef.current = true;
        setKind(next);
        if (next === 'connector' && !runnableConnectors.some(c => c.id === selectedConnectorId)) {
            const first = runnableConnectors[0];
            setSelectedConnectorId(first?.id ?? '');
        }
    };

    const pickConnector = (connector: ConnectorInstance) => {
        if (!isConnectorRunnable(connector)) return;
        userPickedRef.current = true;
        setKind('connector');
        setSelectedConnectorId(connector.id);
    };

    const handleClose = () => {
        if (!submitting) onClose();
    };

    const handleConfirm = async () => {
        if (!item || !canRun) return;
        const target: WorkflowRunTarget = kind === 'tables'
            ? { kind: 'tables' }
            : {
                kind: 'connector',
                connectorId: selectedRunnable!.id,
                displayName: selectedRunnable!.display_name,
            };
        setSubmitting(true);
        try {
            const ok = await onRun(item, target);
            if (ok) onClose();
        } finally {
            setSubmitting(false);
        }
    };

    const goToSources = () => {
        dispatch(dfActions.setDataSourceSidebarTab('sources'));
        onClose();
    };

    const showAddConnection = !loadingConnectors && runnableConnectors.length === 0;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontSize: textVar.xl, pb: 0.5 }}>
                {t('knowledge.runTitle')}
            </DialogTitle>
            <DialogContent sx={{
                display: 'flex', flexDirection: 'column', gap: 1.5,
                pt: '8px !important',
            }}>
                <Typography sx={{ fontSize: textVar.xs, color: 'text.secondary', lineHeight: 1.4 }}>
                    {t('knowledge.runHint')}
                </Typography>

                <Box
                    sx={{
                        display: 'flex', flexDirection: 'column', gap: 0.5,
                        maxHeight: 360, overflowY: 'auto',
                        px: 1, py: 0.75,
                        border: `1px solid ${borderColor.divider}`,
                        borderRadius: radius.sm,
                    }}
                >
                    <RadioGroup
                        name="workflow-run-target"
                        value={kind}
                        onChange={(_event, value) => pickKind(value as WorkflowRunKind)}
                    >
                        <FormControlLabel
                            value="tables"
                            control={<Radio size="small" />}
                            sx={{ m: 0, alignItems: 'flex-start', py: 0.5 }}
                            label={
                                <Box sx={{ pl: 0.25, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: textVar.sm, fontWeight: 500, color: 'text.primary', wordBreak: 'break-word' }}>
                                        {t('knowledge.currentTables')}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: textVar.xs,
                                        color: hasTables ? 'text.secondary' : 'text.disabled',
                                        fontStyle: hasTables ? 'normal' : 'italic',
                                        wordBreak: 'break-word',
                                    }}>
                                        {hasTables
                                            ? `${tables.length} · ${tableNames}`
                                            : t('knowledge.noTablesForRun')}
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            value="connector"
                            control={<Radio size="small" />}
                            sx={{ m: 0, alignItems: 'flex-start', py: 0.5 }}
                            label={
                                <Typography sx={{
                                    fontSize: textVar.sm, fontWeight: 500, color: 'text.primary', pt: 0.25, wordBreak: 'break-word',
                                }}>
                                    {t('knowledge.databaseConnector')}
                                </Typography>
                            }
                        />
                    </RadioGroup>

                    <Box sx={{ pl: 3.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        {loadingConnectors ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5, justifyContent: 'center' }}>
                                <CircularProgress size={16} />
                                <Typography sx={{ fontSize: textVar.xs, color: 'text.secondary' }}>
                                    {t('knowledge.connectorsLoading')}
                                </Typography>
                            </Box>
                        ) : sortedConnectors.length === 0 ? (
                            <Typography sx={{
                                fontSize: textVar.xs, color: 'text.disabled', fontStyle: 'italic', py: 0.5,
                            }}>
                                {t('knowledge.noConnector')}
                            </Typography>
                        ) : sortedConnectors.map(connector => {
                            const runnable = isConnectorRunnable(connector);
                            const selected = kind === 'connector' && selectedConnectorId === connector.id;
                            return (
                                <Box
                                    key={connector.id}
                                    onClick={() => pickConnector(connector)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 0.75,
                                        px: 0.5,
                                        py: 0.5,
                                        borderRadius: radius.sm,
                                        cursor: runnable ? 'pointer' : 'default',
                                        bgcolor: selected ? 'action.selected' : 'transparent',
                                        '&:hover': runnable
                                            ? { bgcolor: selected ? 'action.selected' : 'action.hover' }
                                            : undefined,
                                    }}
                                >
                                    <Radio
                                        size="small"
                                        checked={selected}
                                        disabled={!runnable}
                                        onChange={() => pickConnector(connector)}
                                        slotProps={{ input: { 'aria-label': connector.display_name } }}
                                        sx={{ p: 0.25, mt: 0.125 }}
                                    />
                                    {getConnectorIcon(connector.icon || connector.source_type, {
                                        sx: { fontSize: iconVar.md, opacity: 0.7, flexShrink: 0, mt: 0.25 },
                                    })}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{
                                            fontSize: textVar.sm,
                                            fontWeight: 500,
                                            color: runnable ? 'text.primary' : 'text.secondary',
                                            wordBreak: 'break-word',
                                        }}>
                                            {connector.display_name}
                                        </Typography>
                                        <Typography sx={{
                                            fontSize: textVar.xs,
                                            color: runnable ? 'text.secondary' : 'text.disabled',
                                            wordBreak: 'break-word',
                                        }}>
                                            {runnable
                                                ? (connector.type_name || connector.source_type)
                                                : t('knowledge.connectorDisconnected')}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                        {showAddConnection && (
                            <Button
                                variant="text"
                                onClick={goToSources}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: textVar.sm,
                                    px: 0.5,
                                    minWidth: 0,
                                    alignSelf: 'flex-start',
                                }}
                            >
                                {t('knowledge.addConnection')}
                            </Button>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={submitting} sx={{ textTransform: 'none', fontSize: textVar.sm }}>
                    {t('app.cancel')}
                </Button>
                <Tooltip title={!canRun && disabledWhy ? disabledWhy : ''} disableHoverListener={canRun}>
                    <span>
                        <Button
                            onClick={() => { void handleConfirm(); }}
                            disabled={!canRun}
                            variant="contained"
                            sx={{ textTransform: 'none', fontSize: textVar.sm }}
                        >
                            {submitting
                                ? <CircularProgress size={14} />
                                : kind === 'tables'
                                    ? t('knowledge.runOnThisData')
                                    : t('knowledge.runOnDatabase')}
                        </Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
};

// ── Main Component ───────────────────────────────────────────────────────

export const KnowledgePanel: React.FC = () => {
    const { t } = useTranslation();
    const store = useKnowledgeStore();
    const dispatch = useDispatch();

    // For the "distill from this session" placeholder under WORKFLOWS.
    const tables = useSelector(dfSelectors.getAllTables);
    const charts = useSelector((s: DataFormulatorState) => s.charts);
    const conceptShelfItems = useSelector((s: DataFormulatorState) => s.conceptShelfItems);
    const selectedModelId = useSelector((s: DataFormulatorState) => s.selectedModelId);
    const allModels = useSelector((s: DataFormulatorState) => [...s.globalModels, ...s.models]);

    const [searchQuery, setSearchQuery] = useState('');

    // Editor dialog state — used both for editing existing entries and
    // for creating new rules (in which case editorOriginalPath is empty).
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorCategory, setEditorCategory] = useState<EditorKind>('rules');
    const [editorPath, setEditorPath] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [editorOriginalPath, setEditorOriginalPath] = useState('');
    const [editorSaving, setEditorSaving] = useState(false);
    const [editorLoading, setEditorLoading] = useState(false);
    const [memoryUnlocked, setMemoryUnlocked] = useState(false);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<{ category: KnowledgeCategory; path: string; title: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch all on mount
    useEffect(() => {
        store.fetchAll();
    }, []);

    // ── Search ───────────────────────────────────────────────────────────

    const handleSearch = useCallback(() => {
        const q = searchQuery.trim();
        if (q) {
            store.search(q);
        } else {
            store.clearSearch();
        }
    }, [searchQuery, store]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        store.clearSearch();
    }, [store]);

    // ── Editor ──────────────────────────────────────────────────────────

    const openCreateDialog = useCallback((category: KnowledgeCategory) => {
        setEditorCategory(category);
        setEditorPath(category === 'rules' ? DEFAULT_RULE_FILENAME : '');
        setEditorOriginalPath('');
        setEditorContent(category === 'rules' ? RULE_TEMPLATE : '');
        setEditorLoading(false);
        setEditorOpen(true);
    }, []);

    const openEditDialog = useCallback(async (category: KnowledgeCategory, item: KnowledgeItem) => {
        setEditorCategory(category);
        setEditorPath(item.path);
        setEditorOriginalPath(item.path);
        setEditorContent('');
        setEditorOpen(true);
        setEditorLoading(true);

        const content = await store.read(category, item.path);
        if (content !== null) {
            setEditorContent(content);
        }
        setEditorLoading(false);
    }, [store]);

    const openMemoryDialog = useCallback(async () => {
        setEditorCategory('memory');
        setMemoryUnlocked(false);
        setEditorPath('data-memory.md');
        setEditorOriginalPath('data-memory.md');
        setEditorContent('');
        setEditorOpen(true);
        setEditorLoading(true);
        try {
            setEditorContent(await readDataMemory());
        } catch {
            dispatch(dfActions.addMessages({
                timestamp: Date.now(),
                type: 'error',
                component: 'knowledge',
                value: t('knowledge.failedToLoad'),
            }));
        } finally {
            setEditorLoading(false);
        }
    }, [dispatch, t]);

    const handleSave = useCallback(async () => {
        if (editorCategory !== 'memory' && (!editorPath.trim() || !editorContent.trim())) return;
        setEditorSaving(true);

        if (editorCategory === 'memory') {
            try {
                await rewriteDataMemory(editorContent);
                dispatch(dfActions.addMessages({
                    timestamp: Date.now(),
                    type: 'success',
                    component: 'knowledge',
                    value: t('knowledge.saved'),
                }));
                setEditorOpen(false);
            } catch {
                dispatch(dfActions.addMessages({
                    timestamp: Date.now(),
                    type: 'error',
                    component: 'knowledge',
                    value: t('knowledge.failedToSave'),
                }));
            } finally {
                setEditorSaving(false);
            }
            return;
        }

        const fileName = editorPath.endsWith('.md') ? editorPath : `${editorPath}.md`;
        const path = fileName;
        const success = await store.save(editorCategory, path, editorContent);
        if (success && editorOriginalPath && path !== editorOriginalPath) {
            try { await deleteKnowledge(editorCategory, editorOriginalPath); } catch { /* best-effort */ }
        }
        setEditorSaving(false);
        if (success) {
            setEditorOpen(false);
        }
    }, [editorPath, editorOriginalPath, editorContent, editorCategory, store, dispatch, t]);

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        await store.remove(deleteTarget.category, deleteTarget.path);
        setDeleting(false);
        setDeleteTarget(null);
    }, [deleteTarget, store]);

    // ── Distill from current session ────────────────────────────────────
    // The WORKFLOWS placeholder is bound to the
    // active workspace. When the workspace already has a distilled
    // workflow (matched by `sourceWorkspaceId` in front matter) we
    // expose an inline ⟳ Update affordance on the existing entry;
    // otherwise the placeholder opens the dialog in *create* mode.
    // See design-docs/24-session-scoped-distillation.md.

    const activeWorkspace = useSelector((s: DataFormulatorState) => s.activeWorkspace);
    const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
    const [sessionUpdateMode, setSessionUpdateMode] = useState(false);
    // True while the SessionDistillDialog is running its LLM call.
    // The dialog can be closed independently; this flag lives on the panel
    // so the action row keeps a busy indicator until the request finishes.
    const [sessionDistilling, setSessionDistilling] = useState(false);

    // True when at least one leaf in the session has a distillable chain
    // (i.e. has a user message). Cheap to compute — same predicate as
    // before, just used for the placeholder enable-state.
    const hasDistillableSession = React.useMemo(() => {
        return tables.some(t =>
            isLeafDerivedTable(t, tables) &&
            buildLeafEvents(t, tables, charts, conceptShelfItems) != null,
        );
    }, [tables, charts, conceptShelfItems]);

    const selectedModel = allModels.find(m => m.id === selectedModelId);
    const canDistillFromSession = hasDistillableSession && !!selectedModel && !!activeWorkspace;

    const sessionWorkflow = React.useMemo(
        () => findSessionWorkflow(
            store.stateMap['workflows'].items,
            activeWorkspace?.id,
        ),
        [store.stateMap, activeWorkspace?.id],
    );

    const openSessionDistillDialog = useCallback((updateMode: boolean) => {
        setSessionUpdateMode(updateMode);
        setSessionDialogOpen(true);
    }, []);

    const [runItem, setRunItem] = useState<KnowledgeItem | null>(null);

    const handleReplay = useCallback(async (item: KnowledgeItem, target: WorkflowRunTarget) => {
        const content = await store.read('workflows', item.path);
        if (content == null) return false;
        const prompt = target.kind === 'connector'
            ? t('knowledge.replayPromptConnector', {
                content,
                connector_id: target.connectorId,
                source_id: target.connectorId,
            })
            : t('knowledge.replayPrompt', { content });
        if (target.kind === 'tables') {
            const rootTable = tables.find(tbl => !tbl.derive);
            const workspaceTable = rootTable?.virtual?.tableId || rootTable?.id;
            if (workspaceTable) {
                void setTableBindings(workspaceTable, [item.path]).catch(() => undefined);
            }
        }
        window.dispatchEvent(new CustomEvent('df-replay-workflow', {
            detail: { prompt, title: item.title, target },
        }));
        return true;
    }, [store, t, tables]);

    // ── Render section ──────────────────────────────────────────────────


    const renderItem = useCallback((
        category: KnowledgeCategory,
        item: KnowledgeItem,
    ) => {
        const displayTitle = (item.title || '').replace(/^\s*(?:Workflow|Experience) from .+?:\s*/i, '').trim();
        const primary = displayTitle || item.title || item.path;
        return (
            <Box
                key={`${category}/${item.path}`}
                onClick={() => openEditDialog(category, item)}
                sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 0.75,
                    mx: 0.75, px: 0.75, py: 0.625,
                    borderRadius: 0.75,
                    cursor: 'pointer',
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.045)' },
                    '&:hover .item-actions': { display: 'inline-flex' },
                    userSelect: 'none',
                }}
            >
                <DescriptionOutlinedIcon sx={{ fontSize: iconVar.md, color: 'text.primary', mt: 0.25 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: textVar.sm, fontWeight: 500, lineHeight: 1.45, wordBreak: 'break-word', color: 'text.primary' }}>
                        {primary}
                    </Typography>
                </Box>
                {item.source === 'agent_summarized' && (
                    <Tooltip title={t('knowledge.sourceAgent')}>
                        <SmartToyOutlinedIcon sx={{ fontSize: iconVar.sm, color: 'text.secondary', mt: 0.25 }} />
                    </Tooltip>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch', flexShrink: 0 }}>
                    {category === 'workflows' && (
                        <Tooltip title={t('knowledge.runThisWorkflow')}>
                            <IconButton
                                size="small"
                                aria-label={t('knowledge.runThisWorkflow')}
                                onClick={(e) => { e.stopPropagation(); setRunItem(item); }}
                                sx={{
                                    p: 0.25,
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: theme => alpha(theme.palette.primary.main, 0.08) },
                                }}
                            >
                                <PlayArrowIcon sx={{ fontSize: iconVar.lg }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <IconButton
                        className="item-actions"
                        size="small"
                        aria-label={t('knowledge.deleteItem')}
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget({ category, path: item.path, title: item.title }); }}
                        sx={{ p: 0.25, mt: 'auto', display: 'none', color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                    >
                        <DeleteOutlineIcon sx={{ fontSize: iconVar.md }} />
                    </IconButton>
                </Box>
            </Box>
        );
    }, [openEditDialog, t]);

    const renderCategorySection = useCallback((
        category: KnowledgeCategory,
        label: string,
        hint: string,
    ) => {
        const state = store.stateMap[category];

        // Persistent action row at the top of the section. Rules: opens
        // the create dialog. Workflows: opens the session distill
        // dialog in create or update mode depending on whether the active
        // workspace already has a distilled workflow.
        // See design-docs/24-session-scoped-distillation.md.
        const renderActionRow = () => {
            if (category === 'rules') {
                return (
                    <ActionRow
                        icon={<AddIcon sx={{ fontSize: iconVar.lg }} />}
                        label={t('knowledge.addNewRule', { defaultValue: 'Add new rule' })}
                        onClick={() => openCreateDialog('rules')}
                    />
                );
            }
            // workflows
            const updateMode = !!sessionWorkflow;
            const distillLabel = updateMode
                ? t('knowledge.updateFromSession', { defaultValue: 'Update from this session' })
                : t('knowledge.distillFromSession', { defaultValue: 'Distill from this session' });
            const distillIcon = updateMode
                ? <RefreshIcon sx={{ fontSize: iconVar.lg }} />
                : <AddIcon sx={{ fontSize: iconVar.lg }} />;
            if (!canDistillFromSession) {
                // Always keep the save-workflow CTA visible. Disabled look plus
                // one honest why: workspace, then model, then a chat leaf.
                const why = !activeWorkspace
                    ? t('knowledge.distillNeedWorkspace', {
                        defaultValue: 'Open or create a workspace first',
                    })
                    : !selectedModel
                        ? t('knowledge.distillNeedModel', {
                            defaultValue: 'Pick a model first',
                        })
                        : t('knowledge.distillNeedChat', {
                            defaultValue: 'Chat an analysis in this session first, then save it as a workflow',
                        });
                return (
                    <ActionRow
                        icon={distillIcon}
                        label={distillLabel}
                        disabled
                        hint={why}
                    />
                );
            }
            if (sessionDistilling) {
                return (
                    <ActionRow
                        icon={<CircularProgress size={14} />}
                        label={t('knowledge.distilling', { defaultValue: 'Distilling workflow…' })}
                        onClick={() => openSessionDistillDialog(updateMode)}
                    />
                );
            }
            return (
                <ActionRow
                    icon={distillIcon}
                    label={distillLabel}
                    onClick={() => openSessionDistillDialog(updateMode)}
                />
            );
        };

        return (
            <Box key={category} sx={{ pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.07)' }}>
                <Box
                    sx={{
                        display: 'flex', alignItems: 'center',
                        px: 1.5, pt: 1.25, pb: 0.75,
                        backgroundColor: 'rgba(255, 255, 255, 0.46)',
                    }}
                >
                    <Typography sx={{ fontSize: textVar.xs, fontWeight: 700, color: 'rgba(0, 0, 0, 0.72)', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                        {label}
                    </Typography>
                </Box>

                {/* Always-visible guidance for the section. */}
                <Box
                    sx={{
                        mx: 1.5, mb: 0.75,
                        py: 0.25,
                    }}
                >
                    <Typography sx={{ fontSize: textVar.xs, color: 'text.secondary', lineHeight: 1.55 }}>
                        {hint}
                    </Typography>
                </Box>

                {state.loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                        <CircularProgress size={16} />
                    </Box>
                )}
                {!state.loading && renderActionRow()}
                {state.items.map(item => renderItem(category, item))}
            </Box>
        );
    }, [store.stateMap, renderItem, openCreateDialog, t, canDistillFromSession, sessionWorkflow, sessionDistilling, openSessionDistillDialog, activeWorkspace, selectedModel]);

    // ── Main render ─────────────────────────────────────────────────────

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Content area. Rules vs Workflows guidance is surfaced via an
                info icon next to each section title (see renderCategorySection). */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain' }}>
                <Box>
                    {renderCategorySection('rules', t('knowledge.rules'), t('knowledge.rulesHint'))}
                    {renderCategorySection('workflows', t('knowledge.workflows'), t('knowledge.workflowsHint'))}
                    <Box sx={{ pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.07)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, pt: 1.25, pb: 0.75, backgroundColor: 'rgba(255, 255, 255, 0.46)' }}>
                            <Typography sx={{ fontSize: textVar.xs, fontWeight: 700, color: 'rgba(0, 0, 0, 0.72)', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                                {t('knowledge.dataMemory', { defaultValue: 'Data Memory' })}
                            </Typography>
                        </Box>
                        <Box sx={{ mx: 1.5, mb: 0.75, py: 0.25 }}>
                            <Typography sx={{ fontSize: textVar.xs, color: 'text.secondary', lineHeight: 1.55 }}>
                                {t('knowledge.dataMemoryHint', { defaultValue: 'User-wide notes about known data sources and relationships. This memory may be stale; agents verify live metadata before using it.' })}
                            </Typography>
                        </Box>
                        <ActionRow
                            icon={<DescriptionOutlinedIcon sx={{ fontSize: iconVar.lg }} />}
                            label={t('knowledge.editDataMemory', { defaultValue: 'data-memory.md' })}
                            onClick={openMemoryDialog}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Session distill dialog */}
            <SessionDistillDialog
                open={sessionDialogOpen}
                updateMode={sessionUpdateMode}
                onClose={() => setSessionDialogOpen(false)}
                onRunningChange={setSessionDistilling}
            />

            <WorkflowRunTargetDialog
                item={runItem}
                tables={tables}
                onClose={() => setRunItem(null)}
                onRun={handleReplay}
            />

            {/* Editor dialog */}
            <Dialog
                open={editorOpen}
                onClose={() => { if (!editorSaving) setEditorOpen(false); }}
                maxWidth="lg"
                fullWidth
                sx={{ '& .MuiDialog-paper': { height: '90vh', maxHeight: 900 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: textVar.xl, pb: 0.5 }}>
                    <Box sx={{ flex: 1 }}>
                        {editorCategory === 'memory'
                            ? t('knowledge.dataMemory', { defaultValue: 'Data Memory' })
                            : t('knowledge.editTitle')}
                    </Box>
                    {editorCategory === 'memory' && (
                        <Tooltip title={memoryUnlocked
                            ? t('knowledge.lockDataMemory', { defaultValue: 'Lock editing' })
                            : t('knowledge.unlockDataMemory', { defaultValue: 'Unlock editing' })}
                        >
                            <IconButton
                                size="small"
                                aria-label={memoryUnlocked
                                    ? t('knowledge.lockDataMemory', { defaultValue: 'Lock editing' })
                                    : t('knowledge.unlockDataMemory', { defaultValue: 'Unlock editing' })}
                                onClick={() => setMemoryUnlocked(unlocked => !unlocked)}
                                color={memoryUnlocked ? 'primary' : 'default'}
                            >
                                {memoryUnlocked
                                    ? <LockOpenOutlinedIcon sx={{ fontSize: iconVar.lg }} />
                                    : <LockOutlinedIcon sx={{ fontSize: iconVar.lg }} />}
                            </IconButton>
                        </Tooltip>
                    )}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0, pt: '8px !important' }}>
                    {editorCategory === 'memory' ? (
                        <Typography sx={{ fontSize: textVar.sm, color: 'text.secondary' }}>
                            data-memory.md
                        </Typography>
                    ) : <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            label={t('knowledge.fileName')}
                            placeholder={t('knowledge.fileNamePlaceholder')}
                            value={editorPath}
                            onChange={(e) => setEditorPath(e.target.value)}
                            sx={{ flex: 1, minWidth: 150, '& .MuiInputBase-input': { fontSize: textVar.sm } }}
                            slotProps={{ inputLabel: { sx: { fontSize: textVar.sm } } }}
                        />
                    </Box>}

                    {editorLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <Box sx={{
                            border: `1px solid ${borderColor.component}`,
                            borderRadius: radius.sm,
                            overflow: 'hidden',
                            flex: 1,
                            minHeight: 300,
                        }}>
                            <MarkdownEditor
                                value={editorContent}
                                onChange={setEditorContent}
                                placeholder="# Title\n\nWrite your knowledge content in Markdown..."
                                readOnly={editorCategory === 'memory' && !memoryUnlocked}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {editorCategory !== 'memory' && (
                        <Button
                            onClick={() => { setEditorOpen(false); setDeleteTarget({ category: editorCategory, path: editorOriginalPath, title: editorOriginalPath }); }}
                            color="error"
                            sx={{ textTransform: 'none', fontSize: textVar.sm, mr: 'auto' }}
                        >
                            {t('app.delete')}
                        </Button>
                    )}
                    {editorCategory === 'memory' && <Box sx={{ mr: 'auto' }} />}
                    <Button
                        onClick={() => setEditorOpen(false)}
                        disabled={editorSaving}
                        sx={{ textTransform: 'none', fontSize: textVar.sm }}
                    >
                        {t('app.cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={
                            editorSaving
                            || (editorCategory === 'memory' && !memoryUnlocked)
                            || (editorCategory !== 'memory' && !editorContent.trim())
                            || (editorCategory !== 'memory' && !editorPath.trim())
                        }
                        variant="contained"
                        sx={{ textTransform: 'none', fontSize: textVar.sm }}
                    >
                        {editorSaving ? t('knowledge.saving') : t('knowledge.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog open={!!deleteTarget} onClose={() => { if (!deleting) setDeleteTarget(null); }}>
                <DialogTitle sx={{ fontSize: textVar.xl, pb: 0.5 }}>
                    {deleteTarget ? t('knowledge.deleteConfirm', { title: deleteTarget.title }) : ''}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: textVar.md }}>
                        {t('knowledge.deleteConfirmBody')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ textTransform: 'none', fontSize: textVar.sm }}>
                        {t('app.cancel')}
                    </Button>
                    <Button onClick={handleDelete} disabled={deleting} color="error" variant="contained" sx={{ textTransform: 'none', fontSize: textVar.sm }}>
                        {deleting ? <CircularProgress size={14} /> : t('app.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
