import React from 'react';
import { Box, type SxProps } from '@mui/material';

import { statusPillSx } from '../app/recipes';
import { status } from '../app/tokens';

export type StatusKind = keyof typeof status;

export interface StatusPillProps {
    kind: StatusKind;
    children?: React.ReactNode;
    sx?: SxProps;
}

/** Active / Offline / In progress (dashed) / danger. */
export const StatusPill: React.FC<StatusPillProps> = ({ kind, children, sx }) => (
    <Box
        component="span"
        sx={[
            statusPillSx(kind),
            ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx]),
        ]}
    >
        {children}
    </Box>
);
