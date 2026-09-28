import React from 'react';
import { Box, SxProps, Theme, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import dfLogo from '../assets/df-logo.svg';

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1; }
`;

export interface AnvilLoaderProps {
    /** Override container height. Defaults to `'100vh'` (full-screen). */
    height?: string | number;
    /** Optional text shown below the mark. When omitted no text is rendered. */
    label?: React.ReactNode;
    /** Optional control shown beside the loading label. */
    action?: React.ReactNode;
    /** Extra sx applied to the outermost container. */
    sx?: SxProps<Theme>;
}

export function AnvilLoader({ height = '100vh', label, action, sx }: AnvilLoaderProps) {
    return (
        <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height, gap: 3,
            userSelect: 'none',
            ...sx as any,
        }}>
            <Box
                component="img"
                src={dfLogo}
                alt=""
                width={48}
                height={48}
                sx={{
                    width: 48,
                    height: 48,
                    display: 'block',
                    flexShrink: 0,
                    animation: `${pulse} 2.5s ease-in-out infinite`,
                    '@media (prefers-reduced-motion: reduce)': {
                        animation: 'none',
                        opacity: 1,
                    },
                }}
            />
            {(label !== undefined || action !== undefined) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {label !== undefined && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                fontFamily: 'var(--df-font-mono)',
                                letterSpacing: 3,
                                fontSize: '0.75rem',
                                fontWeight: 400,
                                textTransform: 'uppercase',
                            }}
                        >
                            {label}
                        </Typography>
                    )}
                    {action}
                </Box>
            )}
        </Box>
    );
}
