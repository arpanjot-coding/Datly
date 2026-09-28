// ════════════════════════════════════════════════════════════════════════
// Design tokens — single source of truth for visual constants.
//
// Usage:
//   import { borderColor, shadow, transition, radius, ComponentBorderStyle } from '../app/tokens';
//   sx={{ ...ComponentBorderStyle, borderRadius: radius.md, transition: transition.fast }}
//   sx={{ borderBottom: `1px solid ${borderColor.divider}`, boxShadow: shadow.sm }}
// ════════════════════════════════════════════════════════════════════════

import type { SxProps, Theme } from '@mui/material';

// ── Border colors ──────────────────────────────────────────────────────

export const borderColor = {
    /** Quiet hairline on sage/paper */
    divider: 'rgba(28, 35, 29, 0.10)',

    /** Inner components: cards, chips, inputs, thumbnails */
    component: 'rgba(28, 35, 29, 0.08)',

    /** Outer containers: panels, dialogs, popovers, drop zones */
    view: 'rgba(28, 35, 29, 0.10)',
} as const;

/** UI type. Charts, reports, and the loading page use this same stack. */
export const fontUi = '"Segoe UI", system-ui, sans-serif';

/** Code, logs, and identifiers. */
export const fontMono = '"Roboto Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace';

/** Product chrome surfaces (Cicada / editorial light). Encoding palettes stay separate. */
export const surface = {
    canvas: '#d5dbd2',
    paper: '#f3f5f0',
    card: '#ffffff',
    ink: '#1c231d',
    muted: '#5c665e',
    /** Island interior (same as paper). */
    island: '#f3f5f0',
    /** Chart plot / thumbnail fill (same as paper). */
    plot: '#f3f5f0',
    overlay: 'rgba(28, 35, 29, 0.06)',
} as const;

/** Connector and session status chips. */
export const status = {
    active:   { fg: '#18563c', bg: '#e4efe8', border: 'rgba(31, 107, 74, 0.35)' },
    offline:  { fg: '#5c665e', bg: 'rgba(28, 35, 29, 0.06)', border: 'rgba(28, 35, 29, 0.12)' },
    progress: { fg: '#9a5b20', bg: '#f6ead8', border: 'rgba(180, 83, 42, 0.55)', dashed: true },
    danger:   { fg: '#8b2e1a', bg: '#f8e8e2', border: 'rgba(180, 83, 42, 0.45)' },
} as const;

/** Right edge of the collapsible sidebar: quiet when docked, clearer when it
 *  floats over the workspace. Kept separate from generic view borders because
 *  this edge is also a resize affordance. */
export const sidebarEdge = {
    border: 'rgba(28, 35, 29, 0.08)',
    dockedShadow: '3px 0 10px -8px rgba(28, 35, 29, 0.32)',
    overlayShadow: '5px 0 16px -8px rgba(28, 35, 29, 0.32)',
} as const;

// ── Composite border styles (spread into sx) ───────────────────────────

/** Section divider border — tabs, sidebars, table wrappers */
export const DividerBorderStyle: SxProps<Theme> = { border: `1px solid ${borderColor.divider}` };

/** Inner component border — cards, chips, input fields */
export const ComponentBorderStyle: SxProps<Theme> = { border: `1px solid ${borderColor.component}` };

/** Outer container border — panels, dialogs, popovers */
export const ViewBorderStyle: SxProps<Theme> = { border: `1px solid ${borderColor.view}` };

// ── Box shadows ────────────────────────────────────────────────────────

export const shadow = {
    sm: '0 1px 2px rgba(28, 35, 29, 0.05)',
    md: '0 8px 24px -16px rgba(28, 35, 29, 0.28)',
    lg: '0 16px 40px -24px rgba(28, 35, 29, 0.32)',
    xl: '0 20px 48px -20px rgba(28, 35, 29, 0.28)',
} as const;

// ── Transitions ────────────────────────────────────────────────────────

export const transition = {
    fast: 'background-color 150ms ease-out, color 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out, opacity 150ms ease-out',
    normal: 'background-color 200ms ease-out, color 200ms ease-out, border-color 200ms ease-out, box-shadow 200ms ease-out, transform 200ms ease-out, opacity 200ms ease-out',
    slow: 'background-color 280ms ease-out, color 280ms ease-out, transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease-out',
} as const;

export const pressScale = {
    rest: 'scale(1)',
    down: 'scale(0.96)',
} as const;

// ── Floating overlay controls ──────────────────────────────────────────

/**
 * Floating icon-button pill for canvas overlays (chart visualization toolbar,
 * report action buttons). A semi-transparent "glass" fill with a defined
 * border so the control stays legible over busy, colorful canvases as well as
 * plain document backgrounds. Resting state is neutral; spread this and
 * override `color` / `&:hover` for destructive or active variants.
 */
export const floatingPillSx: SxProps<Theme> = {
    backgroundColor: 'background.paper',
    border: `1px solid ${borderColor.divider}`,
    boxShadow: shadow.sm,
    color: 'text.secondary',
    transition: transition.fast,
    '&:hover': {
        backgroundColor: 'action.hover',
        color: 'primary.main',
        boxShadow: shadow.md,
    },
    '&:active': {
        transform: pressScale.down,
    },
};

/**
 * Width of the conversation column — the agent composer, and the thread block
 * when it has the panel to itself. Shared so the two stay aligned.
 */
export const conversationWidth = 640;

// ── Border radius ──────────────────────────────────────────────────────
// Values are MUI spacing units (1 unit = 4px via theme.spacing)

export const radius = {
    /** Nested chips */
    xs: 1,

    /** Nested controls inside padded cards */
    sm: 1.5,

    /** Cards, chat, dialogs */
    md: 3,

    /** Status indicators, model icons
     *  ModelSelectionDialog status badges */
    lg: 4,

    /** Sidebar island, large cards */
    xl: 6,

    /** Workspace / landing island */
    island: 7,

    /** Pill CTAs and chips */
    pill: '999px',
} as const;

// ── Color palettes ─────────────────────────────────────────────────────
// Each palette defines five color roles: primary, secondary, derived, custom, warning.
// `main` is the prominent color; `bgcolor` is a light tint for backgrounds.

export interface AppPaletteEntry {
    main: string;
    bgcolor?: string;
    textColor?: string;
}

export interface AppPalette {
    name: string;
    primary: AppPaletteEntry;
    secondary: AppPaletteEntry;
    derived: AppPaletteEntry;
    custom: AppPaletteEntry;
    warning: AppPaletteEntry;
}

export const palettes: Record<string, AppPalette> = {
    /** Default Material UI inspired palette
     *  Primary/Custom: split-complementary pair (blue 215° ↔ orange 25°) */
    material: {
        name: 'Material',
        primary:   { main: '#1565c0' },   // H215 S83 L42 — blue
        secondary: { main: '#7b1fa2' },   // purple
        derived:   { main: '#f9a825' },   // yellow
        custom:    { main: '#c75b1e' },    // H25 S83 L45 — warm orange (matched S/L)
        warning:   { main: '#bf5600' },
    },

    /** Fluent UI palette
     *  Primary/Custom: split-complementary (blue 205° ↔ orange 18°) */
    fluent: {
        name: 'Fluent UI',
        primary:   { main: '#0078d4' },   // H205 S100 L42 — Fluent blue
        secondary: { main: '#8764b8' },   // Fluent purple
        derived:   { main: '#ffb900' },   // Fluent gold
        custom:    { main: '#c85a17' },    // H18 S85 L44 — warm burnt orange (matched L)
        warning:   { main: '#a4262c' },   // Fluent red
    },

    /** Vivid Spectrum — high saturation, modern
     *  Primary/Custom: split-complementary (blue 224° ↔ amber 38°) */
    vivid: {
        name: 'Vivid',
        primary:   { main: '#2563eb' },   // H224 S84 L54
        secondary: { main: '#7c3aed' },
        custom:    { main: '#d97218' },    // H38 S84 L47 — vivid amber
        derived:   { main: '#ea580c' },
        warning:   { main: '#dc2626' },
    },

    /** Deep Jewel — rich, saturated jewel tones
     *  Primary/Custom: split-complementary (blue 224° ↔ copper 24°) */
    jewel: {
        name: 'Jewel',
        primary:   { main: '#1d4ed8' },   // H224 S80 L48
        secondary: { main: '#6d28d9' },
        derived:   { main: '#d97706' },
        custom:    { main: '#b85a1a' },    // H24 S80 L41 — deep copper
        warning:   { main: '#b91c1c' },
    },

    /** Electric Modern — punchy, high contrast
     *  Primary/Custom: split-complementary (blue 220° ↔ tangerine 28°) */
    electric: {
        name: 'Electric',
        primary:   { main: '#0066ff' },   // H220 S100 L50
        secondary: { main: '#8b5cf6' },
        derived:   { main: '#eab308' },
        custom:    { main: '#e07020' },    // H28 S78 L50 — electric tangerine
        warning:   { main: '#ef4444' },
    },

    /** Coastal — teal & coral, distinctive, less corporate
     *  Primary/Custom: split-complementary (teal 190° ↔ coral 350°) */
    coastal: {
        name: 'Coastal',
        primary:   { main: '#0891b2' },   // H190 S93 L37
        custom:    { main: '#c03050' },    // H350 S75 L47 — coral rose
        derived:   { main: '#ca8a04' },
        secondary: { main: '#7c3aed' },
        warning:   { main: '#dc2626' },
    },

    /** Copilot-inspired palette from the Copilot gradient spectrum
     *  Primary/Custom: analogous pair from the gradient (blue → purple) */
    copilot: {
        name: 'Copilot',
        primary:   { main: '#0f6cbd', textColor: '#0e5ea3' },   // Fluent 2 blue — darker for text
        secondary: { main: '#0e9a6c', textColor: '#087a55' },   // Copilot green — darker for text
        derived:   { main: '#d946ef', textColor: '#a020c0' },   // Copilot magenta — darker for text
        custom:    { main: '#7160e8', textColor: '#5a48c8' },    // Copilot purple — darker for text
        warning:   { main: '#d13438' },   // Fluent 2 red
    },

    /** Cicada — sage canvas, forest green actions (product chrome default) */
    cicada: {
        name: 'Cicada',
        primary:   { main: '#1f6b4a', bgcolor: '#e4efe8', textColor: '#18563c' },
        secondary: { main: '#4a5a4e', bgcolor: '#e8ebe4', textColor: '#3a483e' },
        derived:   { main: '#8a7a5c', bgcolor: '#f3efe6', textColor: '#6b5e46' },
        custom:    { main: '#3d6b5c', bgcolor: '#e6efeb', textColor: '#2f5448' },
        warning:   { main: '#b4532a' },
    },

    /** Evergreen — Shopify Polaris green, proven in data-heavy merchant dashboards
     *  Primary/Custom: complement (green 162° ↔ terracotta 345°) */
    evergreen: {
        name: 'Evergreen',
        primary:   { main: '#008060' },   // Shopify Polaris green — WCAG AA on white
        secondary: { main: '#5c6ac4' },   // Polaris indigo
        derived:   { main: '#b98900' },   // dark gold
        custom:    { main: '#b4456e' },    // H345 S50 L49 — muted rose
        warning:   { main: '#d72c0d' },   // Polaris critical red
    },

    /** Orchid — Figma purple, designed as accent-on-white in professional design tools
     *  Primary/Custom: complement (purple 270° ↔ olive 90°) */
    orchid: {
        name: 'Orchid',
        primary:   { main: '#9747ff', bgcolor: '#f3ecff', textColor: '#7030d4' },   // Figma purple — darkened for text
        secondary: { main: '#1264a3' },   // strong blue
        derived:   { main: '#e0a526', textColor: '#a87b10' },   // warm gold — darkened for text
        custom:    { main: '#538a3a', bgcolor: '#ecf4e8', textColor: '#3d6e28' },    // leaf green — darkened for text
        warning:   { main: '#cc3333' },
    },

    /** Mono — minimalist black & white, ink-on-paper
     *  Achromatic palette with pure grayscale tones */
    mono: {
        name: 'Mono',
        primary:   { main: '#1a1a1a', bgcolor: '#f0f0f0', textColor: '#1a1a1a' },   // near-black (same as main)
        secondary: { main: '#555555', bgcolor: '#f2f2f2', textColor: '#3a3a3a' },   // darkened for readability
        derived:   { main: '#777777', bgcolor: '#f5f5f5', textColor: '#4a4a4a' },   // darkened for readability
        custom:    { main: '#444444', bgcolor: '#f0f0f0', textColor: '#333333' },   // darkened for readability
        warning:   { main: '#8b2020' },   // muted dark red
    },
} as const;

/** Default palette key (used when no user preference is stored). */
export const defaultPaletteKey: keyof typeof palettes = 'cicada';

/** List of palette keys in display order */
export const paletteKeys = Object.keys(palettes) as (keyof typeof palettes)[];

/** Background tint opacity — applied to `main` to produce `bgcolor`. */
export const bgAlpha = 0.1;
