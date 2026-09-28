import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

import { borderColor, radius, shadow, status, surface } from './tokens';

type RecipeSx = SystemStyleObject<Theme>;

/** Sage-facing inset around an island. Visual value comes from `--df-island-inset`. */
export const islandFieldSx: RecipeSx = {
    boxSizing: 'border-box',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    p: 'var(--df-island-inset, 8px)',
};

export const islandSx: RecipeSx = {
    backgroundColor: surface.paper,
    border: `1px solid ${borderColor.view}`,
    borderRadius: radius.island,
    boxShadow: shadow.sm,
    overflow: 'hidden',
};

export const islandHeaderSx: RecipeSx = {
    height: 'var(--df-app-bar, 44px)',
    minHeight: 'var(--df-app-bar, 44px)',
    display: 'flex',
    alignItems: 'center',
    px: 2,
    gap: 1,
    flexShrink: 0,
    backgroundColor: surface.card,
    borderBottom: `1px solid ${borderColor.divider}`,
};

export const cardRecipeSx: RecipeSx = {
    backgroundColor: surface.card,
    border: `1px solid ${borderColor.component}`,
    borderRadius: radius.md,
    boxShadow: 'none',
};

export const composerSx = (theme: Theme): RecipeSx => ({
    backgroundColor: surface.card,
    border: `1px solid ${borderColor.component}`,
    borderRadius: radius.md,
    boxShadow: shadow.sm,
    '&:focus-within': {
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`,
    },
});

export const statusPillSx = (kind: keyof typeof status): RecipeSx => {
    const s = status[kind];
    const dashed = 'dashed' in s && s.dashed;
    return {
        display: 'inline-flex',
        alignItems: 'center',
        height: 22,
        px: 1,
        fontSize: 'var(--df-text-xs)',
        fontWeight: 500,
        lineHeight: 1,
        color: s.fg,
        backgroundColor: s.bg,
        border: `1px ${dashed ? 'dashed' : 'solid'} ${s.border}`,
        borderRadius: radius.pill,
        whiteSpace: 'nowrap',
    };
};
