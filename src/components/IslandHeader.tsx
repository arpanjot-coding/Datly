import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GridViewIcon from '@mui/icons-material/GridView';
import ArticleIcon from '@mui/icons-material/Article';
import InfoIcon from '@mui/icons-material/Info';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import { useTranslation } from 'react-i18next';

import { DataFormulatorState, dfActions, dfSelectors } from '../app/dfSlice';
import { electronTitlebarInsets } from '../app/desktop';
import { iconVar, textVar } from '../app/layout';
import { useLayout } from '../app/LayoutProvider';
import { islandHeaderSx } from '../app/recipes';
import { radius, surface } from '../app/tokens';
import { getSerializableState } from '../app/useAutoSave';
import { deleteWorkspace, saveWorkspaceState } from '../app/workspaceService';
import { toolName, type AppShellOutletContext } from '../app/App';
import dfLogo from '../assets/df-logo.svg';
import { ConfigDialog } from '../views/ConfigDialog';
import { LogViewerDialog } from '../views/LogViewerDialog';
import { MessageSnackbarTrigger } from '../views/MessageSnackbar';
import { WorkspaceMenu } from '../views/WorkspaceMenu';
import { SqlDrawer } from '../views/SqlDrawer';
export type IslandHeaderVariant = 'landing' | 'workspace' | 'about';

const TopNavButton: FC<{ to: string; label: string; selected: boolean }> = ({ to, label, selected }) => (
    <Button
        component={RouterLink}
        to={to}
        aria-current={selected ? 'page' : undefined}
        onClick={(event) => {
            if (selected) {
                event.preventDefault();
            }
        }}
        sx={{
            textDecoration: 'none',
            textTransform: 'none',
            fontSize: textVar.md,
            fontWeight: 400,
            border: 'none',
            px: 1.5,
            py: 0.5,
            minWidth: 'auto',
            cursor: selected ? 'default' : 'pointer',
            color: selected ? 'text.primary' : 'text.secondary',
            backgroundColor: selected ? alpha(surface.ink, 0.06) : 'transparent',
            borderRadius: radius.pill,
            '&:hover': {
                color: 'text.primary',
                backgroundColor: selected ? alpha(surface.ink, 0.06) : alpha(surface.ink, 0.04),
            },
        }}
    >
        {label}
    </Button>
);

const COMPACT_TOOLBAR_WIDTH = 900;

const useIsNarrow = (ref: React.RefObject<HTMLElement | null>, threshold: number) => {
    const [narrow, setNarrow] = useState(false);
    useEffect(() => {
        const element = ref.current;
        if (!element || typeof ResizeObserver === 'undefined') return;
        const update = () => setNarrow(element.getBoundingClientRect().width < threshold);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(element);
        return () => ro.disconnect();
    }, [ref, threshold]);
    return narrow;
};

const menuItemSx = { fontSize: textVar.md, minHeight: 34, py: 0.5 };

const ToolbarOverflowMenu: React.FC<{
    items: {
        key: string;
        label: string;
        icon: React.ReactNode;
        onClick?: () => void;
    }[];
}> = ({ items }) => {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const close = () => setAnchorEl(null);

    return (
        <>
            <Tooltip title={t('appBar.moreOptions', { defaultValue: 'More options' })}>
                <IconButton
                    size="small"
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                    aria-haspopup="menu"
                    aria-label={t('appBar.moreOptions', { defaultValue: 'More options' })}
                    sx={{
                        p: 0.5,
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary', backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    }}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={close}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { minWidth: 200 } } }}
            >
                {items.map(item => (
                    <MenuItem
                        key={item.key}
                        sx={menuItemSx}
                        onClick={() => { close(); item.onClick?.(); }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primaryTypographyProps={{ fontSize: textVar.md }}>{item.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

const useExitSession = () => {
    const dispatch = useDispatch();
    const state = useSelector((s: DataFormulatorState) => s);
    const sessionEmpty = useSelector(dfSelectors.selectSessionEmpty);

    return useCallback(async () => {
        const workspaceId = state.activeWorkspace?.id;
        if (sessionEmpty) {
            if (workspaceId) {
                try { await deleteWorkspace(workspaceId); } catch { /* may never have been created */ }
            }
        } else {
            try { await saveWorkspaceState(getSerializableState(state)); } catch { /* best effort */ }
        }
        dispatch(dfActions.resetState());
    }, [state, sessionEmpty, dispatch]);
};

const ExitSessionButton: React.FC = () => {
    const { t } = useTranslation();
    const handleExit = useExitSession();

    return (
        <Tooltip title={t('workspace.exitSessionTooltip', { defaultValue: 'Exit session and return to the workspace picker' })} placement="bottom">
            <Button
                size="small"
                variant="text"
                onClick={handleExit}
                startIcon={<LogoutIcon sx={{ fontSize: iconVar.md }} />}
                sx={{
                    textTransform: 'none',
                    fontSize: textVar.md,
                    fontWeight: 400,
                    px: 1.5,
                    py: 0.5,
                    minWidth: 'auto',
                    lineHeight: 1.5,
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary', backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
            >
                {t('workspace.exit', { defaultValue: 'Exit' })}
            </Button>
        </Tooltip>
    );
};

export const IslandHeader: FC<{ variant: IslandHeaderVariant }> = ({ variant }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { tokens } = useLayout();
    const headerRef = useRef<HTMLDivElement | null>(null);
    const isCompactToolbar = useIsNarrow(headerRef, COMPACT_TOOLBAR_WIDTH);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsFocusLanguage, setSettingsFocusLanguage] = useState(false);
    const [logsOpen, setLogsOpen] = useState(false);
    const [sqlOpen, setSqlOpen] = useState(false);
    const shellOutlet = useOutletContext<AppShellOutletContext | undefined>();
    const openMessages = useCallback(() => {
        shellOutlet?.setMessagesOpen(true);
    }, [shellOutlet]);
    const exitSession = useExitSession();
    const titlebar = electronTitlebarInsets();
    const headerHeight = titlebar.overlay && titlebar.height > 0
        ? Math.max(tokens.appBar, titlebar.height)
        : tokens.appBar;

    const generatedReports = useSelector((state: DataFormulatorState) => state.generatedReports);
    const serverConfig = useSelector((state: DataFormulatorState) => state.serverConfig);

    const isAboutPage = variant === 'about';
    const isAppPage = !isAboutPage;
    const inSession = variant === 'workspace';
    const showWorkspace = variant === 'workspace';
    const showExplore = variant === 'workspace';

    const reportsLabel = generatedReports.length > 0
        ? t('appBar.reportsWithCount', { count: generatedReports.length })
        : t('appBar.reports');

    const handleSettingsOpenChange = useCallback((value: boolean) => {
        setSettingsOpen(value);
        if (!value) setSettingsFocusLanguage(false);
    }, []);

    const openPreferencesToLanguage = useCallback(() => {
        if (document.getElementById('language-screen-title')) return;
        setSettingsFocusLanguage(true);
        setSettingsOpen(true);
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== ',') return;
            if (event.altKey || event.shiftKey || event.repeat) return;
            const isMac = window.electronAPI?.platform === 'darwin'
                || (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform));
            if (isMac) {
                if (!event.metaKey || event.ctrlKey) return;
            } else if (!event.ctrlKey || event.metaKey) {
                return;
            }
            event.preventDefault();
            openPreferencesToLanguage();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [openPreferencesToLanguage]);

    useEffect(() => {
        const unsubscribe = window.electronAPI?.onOpenPreferences?.(openPreferencesToLanguage);
        return () => { unsubscribe?.(); };
    }, [openPreferencesToLanguage]);

    return (
        <Box
            component="header"
            ref={headerRef}
            className="df-titlebar"
            sx={[
                islandHeaderSx,
                {
                    height: headerHeight,
                    minHeight: headerHeight,
                    position: 'relative',
                    pl: titlebar.left ? `${Math.max(12, titlebar.left)}px` : undefined,
                    pr: titlebar.right ? `${titlebar.right}px` : undefined,
                    ...(titlebar.overlay ? {
                        WebkitAppRegion: 'drag',
                        '& button, & a, & input, & [role="button"], & [role="radio"], & [role="radiogroup"], & .MuiInputBase-root, & .MuiSelect-root': {
                            WebkitAppRegion: 'no-drag',
                        },
                    } : {}),
                },
            ]}
        >
            <Box
                component={RouterLink}
                to="/app"
                aria-label={toolName}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 0,
                    mr: 1,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { color: 'inherit' },
                }}
            >
                <Box sx={{ width: 40, minWidth: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box component="img" sx={{ height: 22 }} alt="" src={dfLogo} />
                </Box>
                <Typography noWrap sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' }, letterSpacing: '-0.02em', fontSize: 16 }}>
                    {toolName}
                </Typography>
            </Box>
            {variant !== 'workspace' && (
                <Box
                    sx={{
                        ml: 1,
                        height: '28px',
                        my: 'auto',
                        display: 'flex',
                        gap: 0.5,
                    }}
                >
                    <TopNavButton to="/app" label={t('appBar.app')} selected={isAppPage} />
                    <TopNavButton to="/about" label={t('appBar.about')} selected={isAboutPage} />
                </Box>
            )}

            {showWorkspace && (
                isCompactToolbar ? (
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', mx: 1 }}>
                        <WorkspaceMenu />
                    </Box>
                ) : (
                    <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
                        <WorkspaceMenu />
                    </Box>
                )
            )}
            {isAppPage && isCompactToolbar && (
                <Box sx={{ display: 'flex', ml: 'auto', alignItems: 'center', gap: 0.5 }}>
                    <ConfigDialog open={settingsOpen} onOpenChange={handleSettingsOpenChange} hideTrigger focusLanguage={settingsFocusLanguage} />
                    {serverConfig.IS_LOCAL_MODE && (
                        <LogViewerDialog open={logsOpen} onOpenChange={setLogsOpen} hideTrigger />
                    )}
                    <MessageSnackbarTrigger onOpen={openMessages} />
                    {inSession && (
                        <Tooltip title={t('sql.title', { defaultValue: 'SQL (read only)' })}>
                            <IconButton
                                size="small"
                                aria-label={t('sql.title', { defaultValue: 'SQL (read only)' })}
                                onClick={() => setSqlOpen(true)}
                                sx={{ color: 'inherit' }}
                            >
                                <StorageOutlinedIcon sx={{ fontSize: iconVar.md }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <ToolbarOverflowMenu
                        items={[
                            ...(showExplore ? [
                                {
                                    key: 'explore',
                                    label: t('appBar.explore'),
                                    icon: <GridViewIcon fontSize="small" />,
                                    onClick: () => { dispatch(dfActions.setViewMode('editor')); },
                                },
                                {
                                    key: 'reports',
                                    label: reportsLabel,
                                    icon: <ArticleIcon fontSize="small" />,
                                    onClick: () => { dispatch(dfActions.setViewMode('report')); },
                                },
                            ] : []),
                            {
                                key: 'settings',
                                label: t('app.settings'),
                                icon: <SettingsOutlinedIcon fontSize="small" />,
                                onClick: () => { setSettingsFocusLanguage(false); setSettingsOpen(true); },
                            },
                            {
                                key: 'messages',
                                label: t('messages.viewSystemMessages'),
                                icon: <InfoIcon fontSize="small" />,
                                onClick: () => { openMessages(); },
                            },
                            ...(serverConfig.IS_LOCAL_MODE ? [{
                                key: 'logs',
                                label: t('logs.viewLogs', { defaultValue: 'View backend log' }),
                                icon: <TerminalOutlinedIcon fontSize="small" />,
                                onClick: () => setLogsOpen(true),
                            }] : []),
                            ...(inSession ? [{
                                key: 'sql',
                                label: t('sql.title', { defaultValue: 'SQL (read only)' }),
                                icon: <StorageOutlinedIcon fontSize="small" />,
                                onClick: () => { setSqlOpen(true); },
                            }, {
                                key: 'exit',
                                label: t('workspace.exit', { defaultValue: 'Exit' }),
                                icon: <LogoutIcon fontSize="small" />,
                                onClick: () => { exitSession(); },
                            }] : []),
                        ]}
                    />
                </Box>
            )}
            {isAppPage && !isCompactToolbar && (
                <Box sx={{ display: 'flex', ml: 'auto', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <ConfigDialog open={settingsOpen} onOpenChange={handleSettingsOpenChange} focusLanguage={settingsFocusLanguage} />
                        {serverConfig.IS_LOCAL_MODE && <LogViewerDialog />}
                        <MessageSnackbarTrigger onOpen={openMessages} />
                        {inSession && (
                            <Tooltip title={t('sql.title', { defaultValue: 'SQL (read only)' })}>
                                <IconButton
                                    size="small"
                                    aria-label={t('sql.title', { defaultValue: 'SQL (read only)' })}
                                    onClick={() => setSqlOpen(true)}
                                    sx={{ color: 'inherit' }}
                                >
                                    <StorageOutlinedIcon sx={{ fontSize: iconVar.md }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                    {inSession && (
                        <>
                            <Divider orientation="vertical" variant="middle" flexItem sx={{ my: 1 }} />
                            <ExitSessionButton />
                        </>
                    )}
                </Box>
            )}
            {isAboutPage && isCompactToolbar && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                    <ConfigDialog open={settingsOpen} onOpenChange={handleSettingsOpenChange} hideTrigger focusLanguage={settingsFocusLanguage} />
                    {serverConfig.IS_LOCAL_MODE && (
                        <LogViewerDialog open={logsOpen} onOpenChange={setLogsOpen} hideTrigger />
                    )}
                    <MessageSnackbarTrigger onOpen={openMessages} />
                    <ToolbarOverflowMenu
                        items={[
                            {
                                key: 'settings',
                                label: t('app.settings'),
                                icon: <SettingsOutlinedIcon fontSize="small" />,
                                onClick: () => { setSettingsFocusLanguage(false); setSettingsOpen(true); },
                            },
                            {
                                key: 'messages',
                                label: t('messages.viewSystemMessages'),
                                icon: <InfoIcon fontSize="small" />,
                                onClick: () => { openMessages(); },
                            },
                            ...(serverConfig.IS_LOCAL_MODE ? [{
                                key: 'logs',
                                label: t('logs.viewLogs', { defaultValue: 'View backend log' }),
                                icon: <TerminalOutlinedIcon fontSize="small" />,
                                onClick: () => setLogsOpen(true),
                            }] : []),
                        ]}
                    />
                </Box>
            )}
            {isAboutPage && !isCompactToolbar && (
                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                    <ConfigDialog open={settingsOpen} onOpenChange={handleSettingsOpenChange} focusLanguage={settingsFocusLanguage} />
                    {serverConfig.IS_LOCAL_MODE && <LogViewerDialog />}
                    <MessageSnackbarTrigger onOpen={openMessages} />
                </Box>
            )}
            {inSession && <SqlDrawer open={sqlOpen} onClose={() => setSqlOpen(false)} />}
        </Box>
    );
};
