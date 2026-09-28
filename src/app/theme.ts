import { alpha, createTheme, type Theme } from '@mui/material/styles';

import { buttonVar, iconVar, textVar } from './layout';
import { bgAlpha, borderColor, defaultPaletteKey, fontUi, palettes, radius, shadow, status, surface } from './tokens';

/** sx `borderRadius` tokens multiply `theme.shape.borderRadius` (default 4). CSS overrides use px. */
const radiusPx = (units: number) => units * 4;

/** Project tokens into a MUI theme for the active palette. */
export function createDatlyTheme(paletteKey: string): Theme {
    const p = palettes[paletteKey] ?? palettes[defaultPaletteKey];
    const bg = (entry: { main: string; bgcolor?: string }) => entry.bgcolor ?? alpha(entry.main, bgAlpha);
    const tc = (entry: { main: string; textColor?: string }) => entry.textColor ?? entry.main;

    return createTheme({
        typography: {
            fontFamily: fontUi,
            h1: { fontWeight: 500, letterSpacing: '-0.03em' },
            h2: { fontWeight: 500, letterSpacing: '-0.02em' },
            h3: { fontWeight: 500, letterSpacing: '-0.02em' },
            button: { textTransform: 'none', fontWeight: 500 },
        },
        palette: {
            primary:   { main: p.primary.main,   bgcolor: bg(p.primary),   textColor: tc(p.primary)   },
            secondary: { main: p.secondary.main, bgcolor: bg(p.secondary), textColor: tc(p.secondary) },
            derived:   { main: p.derived.main,   bgcolor: bg(p.derived),   textColor: tc(p.derived)   },
            custom:    { main: p.custom.main,    bgcolor: bg(p.custom),    textColor: tc(p.custom)    },
            warning:   { main: p.warning.main },
            success:   { main: palettes.cicada.primary.main },
            background: { default: surface.canvas, paper: surface.paper },
            text: { primary: surface.ink, secondary: surface.muted },
            divider: borderColor.divider,
            action: {
                hover: 'rgba(28, 35, 29, 0.04)',
                selected: alpha(p.primary.main, 0.08),
            },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    ':root': {
                        '--df-focus-border': p.primary.main,
                        '--df-island-inset': '8px',
                    },
                    body: {
                        backgroundColor: surface.canvas,
                        color: surface.ink,
                        fontFamily: fontUi,
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                        html: {
                            scrollBehavior: 'auto',
                        },
                        '*, *::before, *::after': {
                            animationDuration: '0.01ms !important',
                            animationIterationCount: '1 !important',
                            transitionDuration: '0.01ms !important',
                            transitionDelay: '0ms !important',
                        },
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: alpha(surface.paper, 0.88),
                        color: surface.ink,
                        boxShadow: 'none',
                        borderBottom: `1px solid ${borderColor.divider}`,
                        backdropFilter: 'blur(12px)',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    rounded: {
                        borderRadius: radiusPx(radius.lg),
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: radiusPx(radius.lg),
                        border: `1px solid ${borderColor.view}`,
                        boxShadow: shadow.md,
                    },
                },
            },
            MuiDialogTitle: {
                styleOverrides: {
                    root: {
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        color: surface.ink,
                    },
                },
            },
            MuiMenu: {
                defaultProps: {
                    transitionDuration: 200,
                    MenuListProps: { dense: true },
                },
                styleOverrides: {
                    paper: {
                        borderRadius: radiusPx(radius.lg),
                        border: `1px solid ${borderColor.view}`,
                        boxShadow: shadow.md,
                    },
                },
            },
            MuiMenuList: {
                defaultProps: {
                    dense: true,
                },
            },
            MuiPopover: {
                styleOverrides: {
                    paper: {
                        borderRadius: radiusPx(radius.lg),
                        border: `1px solid ${borderColor.view}`,
                        boxShadow: shadow.md,
                    },
                },
            },
            MuiTooltip: {
                defaultProps: {
                    slotProps: {
                        transition: { timeout: 120 },
                    },
                },
                styleOverrides: {
                    tooltip: {
                        backgroundColor: surface.ink,
                        color: surface.paper,
                        borderRadius: 8,
                        fontFamily: fontUi,
                        fontSize: 12,
                        fontWeight: 500,
                        boxShadow: 'none',
                        padding: '6px 10px',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        height: 24,
                        borderRadius: 999,
                        fontWeight: 500,
                    },
                    outlined: {
                        borderColor: borderColor.component,
                    },
                    sizeSmall: {
                        height: 22,
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: ({ theme: t }) => ({
                        borderRadius: radiusPx(radius.sm),
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: borderColor.view,
                        },
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 3px ${alpha(t.palette.primary.main, 0.16)}`,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 1,
                        },
                    }),
                    notchedOutline: {
                        borderColor: borderColor.component,
                    },
                },
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        backgroundColor: surface.paper,
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderColor: borderColor.divider,
                    },
                    head: {
                        color: surface.ink,
                        fontWeight: 500,
                        backgroundColor: surface.paper,
                    },
                },
            },
            MuiSlider: {
                styleOverrides: {
                    thumb: ({ theme: t }) => ({
                        transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
                        '&:hover, &.Mui-focusVisible, &.Mui-active': {
                            boxShadow: `0 0 0 8px ${alpha(t.palette.primary.main, 0.16)}`,
                        },
                    }),
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        borderRadius: radiusPx(radius.sm),
                        boxShadow: 'none',
                    },
                    standardSuccess: {
                        color: status.active.fg,
                        backgroundColor: status.active.bg,
                    },
                    standardInfo: {
                        color: surface.ink,
                        backgroundColor: surface.paper,
                    },
                    standardWarning: {
                        color: status.progress.fg,
                        backgroundColor: status.progress.bg,
                    },
                    standardError: {
                        color: status.danger.fg,
                        backgroundColor: status.danger.bg,
                    },
                },
            },
            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                },
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 10,
                        fontFamily: fontUi,
                        fontWeight: 500,
                        lineHeight: 1.4,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        transition: 'background-color 150ms ease-out, color 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out',
                        '&:active': { transform: 'scale(0.96)' },
                        '& .MuiButton-startIcon': {
                            marginLeft: 0,
                            marginRight: buttonVar.iconGap,
                        },
                        '& .MuiButton-endIcon': {
                            marginLeft: buttonVar.iconGap,
                            marginRight: 0,
                        },
                    },
                    sizeSmall: {
                        minHeight: buttonVar.heightSmall,
                        padding: `0 ${buttonVar.paddingSmall}`,
                        fontSize: textVar.sm,
                        '& .MuiButton-icon > :nth-of-type(1)': {
                            fontSize: iconVar.sm,
                        },
                    },
                    sizeMedium: {
                        minHeight: buttonVar.heightMedium,
                        padding: `0 ${buttonVar.paddingMedium}`,
                        fontSize: textVar.md,
                        '& .MuiButton-icon > :nth-of-type(1)': {
                            fontSize: iconVar.md,
                        },
                    },
                    text: ({ ownerState, theme: t }) => {
                        const c = ownerState.color;
                        if (c && c !== 'inherit' && c !== 'error' && c !== 'info' && c !== 'success' && c in t.palette) {
                            const entry = (t.palette as any)[c];
                            if (entry?.textColor) return { color: entry.textColor };
                        }
                        return {};
                    },
                    outlined: ({ ownerState, theme: t }) => {
                        const c = ownerState.color;
                        if (c && c !== 'inherit' && c !== 'error' && c !== 'info' && c !== 'success' && c in t.palette) {
                            const entry = (t.palette as any)[c];
                            if (entry?.textColor) return { color: entry.textColor, borderColor: alpha(entry.textColor, 0.5) };
                        }
                        return {};
                    },
                },
                variants: [
                    {
                        props: { variant: 'soft' },
                        style: ({ theme: t }) => ({
                            color: (t.palette.primary as any).textColor ?? t.palette.primary.main,
                            backgroundColor: (t.palette.primary as any).bgcolor ?? alpha(t.palette.primary.main, 0.1),
                            '&:hover': {
                                backgroundColor: alpha(t.palette.primary.main, 0.16),
                            },
                        }),
                    },
                    {
                        props: { variant: 'toolbar' },
                        style: ({ theme: t }) => ({
                            color: t.palette.text.secondary,
                            backgroundColor: 'transparent',
                            '&:hover': {
                                color: t.palette.text.primary,
                                backgroundColor: t.palette.action.hover,
                            },
                        }),
                    },
                ],
            },
            MuiIconButton: {
                styleOverrides: {
                    root: ({ ownerState, theme: t }) => {
                        const c = ownerState.color;
                        const motion = {
                            transition: 'background-color 150ms ease-out, color 150ms ease-out, transform 150ms ease-out',
                            '&:active': { transform: 'scale(0.96)' },
                        };
                        if (c && c !== 'inherit' && c !== 'default' && c !== 'error' && c !== 'info' && c !== 'success' && c in t.palette) {
                            const entry = (t.palette as any)[c];
                            if (entry?.textColor) return { color: entry.textColor, ...motion };
                        }
                        return motion;
                    },
                },
            },
            MuiLink: {
                styleOverrides: {
                    root: ({ ownerState, theme: t }) => {
                        const c = ownerState.color as string | undefined;
                        if (c && c !== 'inherit' && c in t.palette) {
                            const entry = (t.palette as any)[c];
                            if (entry?.textColor) return { color: entry.textColor };
                        }
                        return {};
                    },
                },
            },
        },
        transitions: {
            duration: {
                shortest: 100,
                shorter: 150,
                short: 150,
                standard: 200,
                complex: 200,
                enteringScreen: 200,
                leavingScreen: 150,
            },
        },
    });
}
