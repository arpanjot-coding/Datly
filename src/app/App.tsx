import React, { FC, useEffect, useMemo, useState } from 'react';
import '../scss/App.scss';

import { useDispatch, useSelector } from "react-redux";
import {
    DataFormulatorState,
    dfActions,
    dfSelectors,
    fetchGlobalModelList,
} from './dfSlice'

import { palettes, defaultPaletteKey, surface } from './tokens';
import { createDatlyTheme } from './theme';

import {
    Button,
    Typography,
    Box,
    Link,
} from '@mui/material';

import { ThemeProvider } from '@mui/material/styles';

import { DataFormulatorFC } from '../views/DataFormulator';
import { LayoutProvider } from './LayoutProvider';
import { electronTitlebarInsets, isDesktopRuntime } from './desktop';
import { MIN_SUPPORTED } from './layout';
import { useAutoSave } from './useAutoSave';
import { useWorkspaceAutoName } from './useWorkspaceAutoName';

import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    useLocation,
    useRouteError,
} from "react-router-dom";
import { About } from '../views/About';
import { MessageSnackbar } from '../views/MessageSnackbar';
import { ChartRenderService } from '../views/ChartRenderService';
import store, { AppDispatch } from './store';
import { AnvilLoader } from '../components/AnvilLoader';
import { LogViewerDialog } from '../views/LogViewerDialog';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { getUrls } from './utils';
import { apiRequest } from './apiClient';
import { UnifiedDataUploadDialog } from '../views/UnifiedDataUploadDialog';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import { useTranslation } from 'react-i18next';
import { syncVegaLocale } from '../i18n/vega-locale';
import { getLanguageCompleted, getPreInitI18nextLng, setLanguageCompleted } from '../i18n/localePersist';
import { LanguageScreen } from '../views/onboarding/LanguageScreen';
import { DesktopIdleLock } from './DesktopIdleLock';

declare module '@mui/material/styles' {
    interface PaletteColor {
        bgcolor?: string;
        textColor?: string;
    }
    interface SimplePaletteColorOptions {
        bgcolor?: string;
        textColor?: string;
    }
    interface Palette {
        derived: Palette['primary'];
        custom: Palette['primary'];
    }
    interface PaletteOptions {
        derived: PaletteOptions['primary'];
        custom: PaletteOptions['primary'];
    }
}

export const toolName = "Datly"

export type AppShellOutletContext = {
    messagesOpen: boolean;
    setMessagesOpen: (open: boolean) => void;
};

export interface AppFCProps {
}

// Extract menu components into separate components to prevent full app re-renders
const TableMenu: React.FC = () => {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const { t } = useTranslation();
    
    return (
        <>
            <Button
                variant="text"
                onClick={() => setDialogOpen(true)}
                sx={{ textTransform: 'none' }}
            >
                {t('appBar.data')}
            </Button>
            
            {/* Unified Data Upload Dialog */}
            <UnifiedDataUploadDialog 
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                initialTab="menu"
            />
        </>
    );
};


const ErrorBoundaryFallback: React.FC = () => {
    const { t } = useTranslation();
    const routeError = useRouteError() as any;
    const [logsOpen, setLogsOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    // Read the desktop flag off the URL rather than the store -- the store may be
    // exactly what failed, and this screen has to render regardless.
    const isDesktopApp = isDesktopRuntime();
    const detail = routeError?.message || (typeof routeError === 'string' ? routeError : '');
    const stack = typeof routeError?.stack === 'string' ? routeError.stack : '';
    const mutedActionSx = {
        minWidth: 0, px: 0.5,
        color: 'text.disabled', fontSize: '0.7rem', fontWeight: 400,
        textTransform: 'none',
        '&:hover': { color: 'text.secondary', backgroundColor: 'transparent' },
    } as const;
    return (
        <Box sx={{ width: "100%", height: "100%", display: "flex" }}>
            <Box sx={{
                margin: "150px auto",
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                maxWidth: 640, px: 2,
            }}>
                <Typography color="gray">
                    {t('workspace.errorOccurred')} <Link href="/app">{t('workspace.refreshSession')}</Link>{'. '}{t('workspace.errorPersistHint')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {(detail || stack) && (
                        <Button
                            variant="text"
                            size="small"
                            startIcon={<KeyboardArrowDownIcon sx={{
                                fontSize: 15,
                                transform: detailsOpen ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.15s',
                            }} />}
                            onClick={() => setDetailsOpen(open => !open)}
                            sx={mutedActionSx}
                        >
                            View error details
                        </Button>
                    )}
                    {isDesktopApp && (
                        <Button
                            variant="text"
                            size="small"
                            startIcon={<TerminalOutlinedIcon sx={{ fontSize: 15 }} />}
                            onClick={() => setLogsOpen(true)}
                            sx={mutedActionSx}
                        >
                            View backend log
                        </Button>
                    )}
                </Box>
                {detailsOpen && (detail || stack) && (
                    <Typography
                        component="pre"
                        sx={{
                            fontFamily: 'var(--df-font-mono)', fontSize: '0.65rem', color: 'text.disabled',
                            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                            m: 0, maxHeight: 260, overflowY: 'auto', textAlign: 'left',
                            width: '100%',
                        }}
                    >
                        {[detail, stack].filter(Boolean).join('\n\n')}
                    </Typography>
                )}
                {isDesktopApp && <LogViewerDialog open={logsOpen} onOpenChange={setLogsOpen} hideTrigger />}
            </Box>
        </Box>
    );
};

const AppShell: FC = () => {
    const location = useLocation();
    const activeWorkspace = useSelector((state: DataFormulatorState) => state.activeWorkspace);
    const titlebar = electronTitlebarInsets();
    const [messagesOpen, setMessagesOpen] = useState(false);

    useAutoSave();
    useWorkspaceAutoName();

    const isAboutPage = location.pathname === '/about';
    const isAppPage = !isAboutPage;
    const isLandingView = isAppPage && !activeWorkspace;
    const shellMinWidth = isLandingView ? 0 : `${MIN_SUPPORTED.width}px`;

    return (
        <Box
            className={titlebar.overlay ? 'df-titlebar' : undefined}
            sx={{
                position: 'absolute',
                backgroundColor: surface.canvas,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'auto',
                '& > *': {
                    minWidth: shellMinWidth,
                    minHeight: `${MIN_SUPPORTED.height}px`,
                    '@media (max-width: 700px)': {
                        minWidth: 0,
                    },
                },
            }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
            }}>
                <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', '& > *': { height: '100%' } }}>
                    <Outlet context={{ messagesOpen, setMessagesOpen } satisfies AppShellOutletContext} />
                </Box>
                <MessageSnackbar hideTrigger open={messagesOpen} onOpenChange={setMessagesOpen} />
                <ChartRenderService />
            </Box>
        </Box>
    );
}

export const AppFC: FC<AppFCProps> = function AppFC(appProps) {

    const dispatch = useDispatch<AppDispatch>();
    const { t, i18n } = useTranslation();
    const rawPaletteKey = useSelector((state: DataFormulatorState) => state.config.paletteKey);
    const activePaletteKey = (rawPaletteKey && palettes[rawPaletteKey]) ? rawPaletteKey : defaultPaletteKey;

    const [configLoaded, setConfigLoaded] = useState(false);
    const [startupLogsOpen, setStartupLogsOpen] = useState(false);
    const isDesktopApp = isDesktopRuntime();

    useEffect(() => {
        syncVegaLocale();
        const onLangChanged = () => syncVegaLocale();
        i18n.on('languageChanged', onLangChanged);
        return () => { i18n.off('languageChanged', onLangChanged); };
    }, [i18n]);

    useEffect(() => {
        apiRequest(getUrls().APP_CONFIG)
            .then(({ data }) => {
                dispatch(dfActions.setServerConfig(data));
                setConfigLoaded(true);
            });
    }, []);

    // Validate persisted workspace still exists on the backend
    const activeWorkspace = useSelector((state: DataFormulatorState) => state.activeWorkspace);

    useEffect(() => {
        if (configLoaded) {
            // Recover orphaned state: content exists but activeWorkspace was lost
            if (!activeWorkspace && !dfSelectors.selectSessionEmpty(store.getState())) {
                const recoveredId = `recovered_${Date.now()}`;
                dispatch(dfActions.setActiveWorkspace({ id: recoveredId, displayName: t('workspace.recoveredSession') }));
            }
        }
    }, [configLoaded]);

    const [authChecked, setAuthChecked] = useState(false);
    const [languagePickerDismissed, setLanguagePickerDismissed] = useState(false);
    const serverConfig = useSelector((state: DataFormulatorState) => state.serverConfig);

    useEffect(() => {
        if (getPreInitI18nextLng() && !getLanguageCompleted()) {
            setLanguageCompleted(true);
        }
    }, []);

    useEffect(() => {
        if (!configLoaded) return;

        const serverIdentity = serverConfig?.IDENTITY;
        if (serverIdentity?.type === 'local' && serverIdentity?.id) {
            dispatch(dfActions.setIdentity({ type: 'local', id: serverIdentity.id }));
        }
        setAuthChecked(true);
    }, [configLoaded, dispatch, serverConfig?.IDENTITY]);

    useEffect(() => {
        document.title = toolName;
        // Load all server-configured models instantly (no connectivity check).
        // Users can verify connectivity via the "Test" button in the model dialog,
        // or errors will surface naturally when a model is first used.
        dispatch(fetchGlobalModelList());
    }, []);

    const theme = createDatlyTheme(activePaletteKey);

    const router = useMemo(() => createBrowserRouter([
        {
            path: "/",
            element: <AppShell />,
            errorElement: <ErrorBoundaryFallback />,
            children: [
                {
                    index: true,
                    element: <DataFormulatorFC />,
                },
                {
                    path: "app",
                    element: <DataFormulatorFC />,
                },
                {
                    path: "about",
                    element: <About />,
                },
                {
                    path: "*",
                    element: <DataFormulatorFC />,
                },
            ],
        }
    ]), []);

    // Gate uses the pre-init i18nextLng snapshot only. A detector cache write after init must not skip the picker.
    const showLanguagePicker =
        configLoaded &&
        authChecked &&
        !languagePickerDismissed &&
        !getLanguageCompleted() &&
        !getPreInitI18nextLng() &&
        serverConfig.AVAILABLE_LANGUAGES.length > 1;

    return (
        <ThemeProvider theme={theme}>
            <LayoutProvider>
                {configLoaded && authChecked ? (
                    <>
                        <Box
                            component="div"
                            aria-hidden={showLanguagePicker || undefined}
                            {...(showLanguagePicker ? ({ inert: '' } as { inert: string }) : {})}
                            sx={{
                                height: '100%',
                                ...(showLanguagePicker ? { pointerEvents: 'none' } : {}),
                            }}
                        >
                            <RouterProvider router={router} />
                        </Box>
                        {showLanguagePicker && (
                            <LanguageScreen
                                availableLanguages={serverConfig.AVAILABLE_LANGUAGES}
                                onContinue={() => setLanguagePickerDismissed(true)}
                            />
                        )}
                        <DesktopIdleLock />
                    </>
                ) : (
                    <>
                        <AnvilLoader
                            label={t('app.loadingProduct')}
                            action={isDesktopApp ? (
                                <Link
                                    component="button"
                                    type="button"
                                    underline="always"
                                    onClick={() => setStartupLogsOpen(true)}
                                    sx={{
                                        color: 'text.disabled',
                                        fontSize: '0.7rem',
                                        fontWeight: 400,
                                        fontFamily: 'inherit',
                                        '&:hover': { color: 'text.secondary' },
                                    }}
                                >
                                    View backend log
                                </Link>
                            ) : undefined}
                        />
                        {isDesktopApp && (
                            <LogViewerDialog
                                open={startupLogsOpen}
                                onOpenChange={setStartupLogsOpen}
                                hideTrigger
                            />
                        )}
                    </>
                )}
            </LayoutProvider>
        </ThemeProvider>
    );
}

function stringAvatar(name: string) {
    let displayName = ""
    try {
        let nameSplit = name.split(' ')
        displayName = `${nameSplit[0][0]}${nameSplit.length > 1 ? nameSplit[nameSplit.length - 1][0] : ''}`
    } catch {
        displayName = name ? name[0] : "?";
    }
    return {
        sx: {
            bgcolor: "cornflowerblue",
            width: 36,
            height: 36,
            margin: "auto",
            fontSize: "1rem"
        },
        children: displayName,
    };
}
