import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    Menu,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

import { DataFormulatorState, dfActions } from '../app/dfSlice';
import { iconVar, textVar } from '../app/layout';
import { borderColor, radius, surface } from '../app/tokens';
import store from '../app/store';
import { getSerializableState } from '../app/useAutoSave';
import { formatRelativeTime } from '../app/formatTime';
import {
    deleteWorkspace,
    isWorkspaceReadOnly,
    listWorkspaces,
    loadWorkspace,
    onWorkspaceListChanged,
    saveWorkspaceState,
    WorkspaceLoadSupersededError,
    type WorkspaceSummary,
} from '../app/workspaceService';

const rowSx = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 1.5,
    py: 1,
    mx: 0.5,
    my: 0.25,
    borderRadius: 1,
    cursor: 'pointer',
    backgroundColor: active ? 'action.selected' : 'transparent',
    color: 'text.primary',
    '&:hover': { backgroundColor: active ? 'action.selected' : 'action.hover' },
    transition: 'background-color 0.15s',
});

const WorkspacePickerMenu: React.FC<{
    anchorEl: HTMLElement | null;
    onClose: () => void;
}> = ({ anchorEl, onClose }) => {
    const open = Boolean(anchorEl);
    const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const dispatch = useDispatch();
    const activeWorkspace = useSelector((state: DataFormulatorState) => state.activeWorkspace);
    const { t } = useTranslation();

    const fetchWsList = useCallback(async () => {
        setListLoading(true);
        setListError(false);
        try {
            const sessions = await listWorkspaces();
            setWorkspaces(sessions);
        } catch {
            setListError(true);
        }
        setListLoading(false);
    }, []);

    useEffect(() => {
        if (!open) return;
        fetchWsList();
    }, [open, fetchWsList]);

    useEffect(() => {
        if (!open) return;
        return onWorkspaceListChanged(fetchWsList);
    }, [open, fetchWsList]);

    useEffect(() => {
        if (!open) {
            setConfirmDelete(null);
            setSearchQuery('');
        }
    }, [open]);

    const filteredWorkspaces = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return workspaces;
        return workspaces.filter(s => (s.display_name || '').toLowerCase().includes(q));
    }, [workspaces, searchQuery]);

    const handleOpen = async (wsId: string) => {
        if (activeWorkspace?.id === wsId) { onClose(); return; }
        try { await saveWorkspaceState(getSerializableState(store.getState())); } catch { /* best effort */ }
        const wsEntry = workspaces.find(w => w.id === wsId);
        dispatch(dfActions.setSessionLoading({ loading: true, label: t('workspace.openingWorkspace') }));
        onClose();
        try {
            const result = await loadWorkspace(wsId);
            if (result) {
                const displayName = result.displayName || wsEntry?.display_name || wsId;
                dispatch(dfActions.loadState({ ...result.state, activeWorkspace: { id: wsId, displayName, readOnly: result.readOnly } }));
                dispatch(dfActions.addMessages({ timestamp: Date.now(), component: "Workspace", type: "success", value: t('workspace.openedSession', { name: displayName }) }));
            } else {
                dispatch(dfActions.addMessages({ timestamp: Date.now(), component: "Workspace", type: "error", value: t('workspace.failedToOpenWorkspace') }));
            }
        } catch (e) {
            if (e instanceof WorkspaceLoadSupersededError) {
                return;
            }
            dispatch(dfActions.addMessages({ timestamp: Date.now(), component: "Workspace", type: "error", value: t('workspace.failedToOpenWorkspace') }));
        }
        dispatch(dfActions.setSessionLoading({ loading: false }));
    };

    const handleCreate = () => {
        dispatch(dfActions.resetState());
        onClose();
    };

    const handleDelete = async (workspaceId: string) => {
        try {
            await deleteWorkspace(workspaceId);
            setWorkspaces(prev => prev.filter(s => s.id !== workspaceId));
            dispatch(dfActions.addMessages({ timestamp: Date.now(), component: "Workspace", type: "success", value: t('workspace.deletedSession', { name: workspaceId }) }));
        } catch (e) { /* ignore */ }
        setConfirmDelete(null);
    };

    const newSessionRow = (
        <Box sx={rowSx(false)} onClick={handleCreate} role="menuitem">
            <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                {t('workspace.newSession')}
            </Typography>
        </Box>
    );

    const deviceCaption = (
        <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', px: 1.5, py: 0.75, lineHeight: 1.3 }}
        >
            {t('workspace.deviceSessionsCaption', { defaultValue: 'Sessions on this device' })}
        </Typography>
    );

    const errorBlock = (
        <Box sx={{ px: 1.5, py: 1.25, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.75 }}>
            <Typography variant="body2" color="error">
                {t('workspace.loadFailed', { defaultValue: 'Could not load sessions' })}
            </Typography>
            <Button
                size="small"
                onClick={(e) => { e.stopPropagation(); fetchWsList(); }}
                sx={{ minWidth: 0, px: 0.5, fontSize: textVar.xs, textTransform: 'none' }}
            >
                {t('workspace.retry', { defaultValue: 'Retry' })}
            </Button>
        </Box>
    );

    const readOnlyActive = isWorkspaceReadOnly(activeWorkspace);

    const renderSessionRow = (s: WorkspaceSummary) => {
        const active = activeWorkspace?.id === s.id;
        const relative = formatRelativeTime(s.saved_at || undefined);
        const sessionReadOnly = s.read_only === true || (active && readOnlyActive);
        return (
            <Box
                key={s.id}
                role="menuitem"
                sx={rowSx(active)}
                onClick={() => handleOpen(s.id)}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={active ? 600 : 400} noWrap>
                        {s.display_name}
                    </Typography>
                    {relative && (
                        <Typography variant="caption" color="text.secondary">
                            {relative}
                        </Typography>
                    )}
                    {sessionReadOnly && (
                        <Typography variant="caption" color="text.secondary" display="block">
                            {t('workspace.readOnlyLabel', { defaultValue: 'Read-only' })}
                        </Typography>
                    )}
                </Box>
                {active ? (
                    <CheckIcon sx={{ fontSize: iconVar.md, color: 'primary.main', flexShrink: 0 }} />
                ) : sessionReadOnly ? null : confirmDelete === s.id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={e => e.stopPropagation()}>
                        <Button size="small" color="error" sx={{ minWidth: 0, fontSize: textVar.xs, textTransform: 'none' }}
                            onClick={() => handleDelete(s.id)}>{t('workspace.delete')}</Button>
                        <Button size="small" sx={{ minWidth: 0, fontSize: textVar.xs, textTransform: 'none' }}
                            onClick={() => setConfirmDelete(null)}>{t('workspace.cancel')}</Button>
                    </Box>
                ) : (
                    <Tooltip title={t('workspace.deleteSession')}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setConfirmDelete(s.id); }} sx={{ color: 'text.secondary' }}>
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        );
    };

    let body: React.ReactNode;
    if (listLoading && workspaces.length === 0) {
        body = (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 1.5 }}>
                <CircularProgress size={28} />
                <Typography variant="body2" color="text.secondary">{t('workspace.loadingSessions')}</Typography>
            </Box>
        );
    } else if (listError && workspaces.length === 0) {
        body = (
            <>
                {newSessionRow}
                {errorBlock}
            </>
        );
    } else if (!listLoading && workspaces.length === 0) {
        body = (
            <>
                {newSessionRow}
                <Box sx={{ px: 1.5, py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('workspace.emptySessions', { defaultValue: 'No sessions yet' })}
                    </Typography>
                </Box>
                {deviceCaption}
            </>
        );
    } else {
        body = (
            <>
                {newSessionRow}
                <Divider sx={{ my: 0.5 }} />
                {listError && errorBlock}
                <Box
                    className="df-no-drag"
                    sx={{ px: 1, py: 0.5 }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <TextField
                        size="small"
                        fullWidth
                        className="df-no-drag"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('workspace.searchSessions', { defaultValue: 'Search sessions' })}
                        autoComplete="off"
                        slotProps={{
                            input: {
                                className: 'df-no-drag',
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: iconVar.sm, color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                            },
                            htmlInput: {
                                className: 'df-no-drag',
                                'aria-label': t('workspace.searchSessions', { defaultValue: 'Search sessions' }),
                            },
                        }}
                        sx={{
                            '& .MuiInputBase-root': {
                                fontSize: textVar.sm,
                                height: 28,
                                borderRadius: radius.sm,
                                backgroundColor: surface.card,
                            },
                            '& .MuiInputBase-input': { py: 0.25, px: 0.5 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: borderColor.component },
                        }}
                    />
                </Box>
                {filteredWorkspaces.length === 0 ? (
                    <Box sx={{ px: 1.5, py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('workspace.noMatchingSessions', { defaultValue: 'No matching sessions' })}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ maxHeight: 240, overflowY: 'auto' }}>
                        {filteredWorkspaces.map(renderSessionRow)}
                    </Box>
                )}
                {deviceCaption}
            </>
        );
    }

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            disableAutoFocusItem
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            transitionDuration={0}
            slotProps={{
                list: { autoFocusItem: false },
                paper: {
                    sx: {
                        width: 280,
                        maxWidth: 'calc(100vw - 24px)',
                        mt: 0.75,
                        borderRadius: radius.lg,
                        overflow: 'hidden',
                        transformOrigin: 'top center',
                        '@keyframes df-ws-menu-in': {
                            from: { opacity: 0, transform: 'scale(0.97)' },
                            to: { opacity: 1, transform: 'scale(1)' },
                        },
                        animation: 'df-ws-menu-in 200ms ease-out',
                    },
                },
            }}
        >
            {body}
        </Menu>
    );
};

export const WorkspaceMenu: React.FC = () => {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const activeWorkspace = useSelector((state: DataFormulatorState) => state.activeWorkspace);
    const { t } = useTranslation();
    const diskPersistenceDisabled = false; // all backends support workspace switching

    if (!activeWorkspace) return null;

    return (
        <>
            <Box className="df-no-drag" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Tooltip title={t('workspace.sessionTooltip', { name: activeWorkspace?.id || '' })} placement="bottom">
                    <Box
                        className="df-no-drag"
                        role="button"
                        tabIndex={0}
                        aria-haspopup="menu"
                        aria-expanded={Boolean(menuAnchor)}
                        onClick={(event) => !diskPersistenceDisabled && setMenuAnchor(event.currentTarget)}
                        onKeyDown={(event) => {
                            if (diskPersistenceDisabled) return;
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                setMenuAnchor(event.currentTarget);
                            }
                        }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            height: 32,
                            cursor: 'pointer',
                            px: 1,
                            border: `1px solid ${borderColor.component}`,
                            borderRadius: radius.md,
                            backgroundColor: surface.card,
                            '&:hover': { backgroundColor: 'action.hover' },
                            '&:hover .ws-chevron': { opacity: 1 },
                        }}
                    >
                        <Typography noWrap sx={{
                            fontSize: textVar.md,
                            fontWeight: 500,
                            color: 'text.primary',
                            maxWidth: 220,
                            letterSpacing: '0.01em',
                        }}>
                            {activeWorkspace?.displayName || activeWorkspace.id}
                        </Typography>
                        <KeyboardArrowDownIcon className="ws-chevron" sx={{ fontSize: iconVar.md, color: 'text.secondary', opacity: 0.4, transition: 'opacity 0.15s' }} />
                    </Box>
                </Tooltip>
                {isWorkspaceReadOnly(activeWorkspace) && (
                    <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, whiteSpace: 'nowrap' }}>
                        {t('workspace.readOnlyLabel', { defaultValue: 'Read-only' })}
                    </Typography>
                )}
            </Box>
            <WorkspacePickerMenu anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)} />
        </>
    );
};
