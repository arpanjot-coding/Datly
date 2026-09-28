import React from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

import { islandOverlayFlush } from '../app/desktop';
import { islandFieldSx, islandSx } from '../app/recipes';

export interface IslandShellProps {
    header?: React.ReactNode;
    children?: React.ReactNode;
    sx?: SxProps<Theme>;
}

/** Cream island on the sage field. Header slot is drag; the body is not. */
export const IslandShell: React.FC<IslandShellProps> = ({ header, children, sx }) => {
    const { flushRight, flushLeft } = islandOverlayFlush();
    const inset = 'var(--df-island-inset, 8px)';

    return (
        <Box
            sx={[
                islandFieldSx,
                (flushRight || flushLeft) ? {
                    p: 0,
                    // Same sage lip above and below. Caption buttons sit in the
                    // top lip, so the card itself stays fully rounded.
                    pt: inset,
                    pr: flushRight ? 0 : inset,
                    pb: inset,
                    pl: flushLeft ? 0 : inset,
                } : {},
            ]}
        >
            <Box
                className="df-no-drag"
                sx={[
                    islandSx,
                    {
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                    },
                    ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx]),
                ]}
            >
                {header}
                <Box
                    className="df-no-drag"
                    sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};
