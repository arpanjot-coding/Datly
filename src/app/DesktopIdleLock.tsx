import React, { FC, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { desktopIdleLockEnabled, resolveIdleLockMs } from './idleLock';
import { surface } from './tokens';

export const DesktopIdleLock: FC = () => {
    const { t } = useTranslation();
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        if (!desktopIdleLockEnabled()) {
            return undefined;
        }
        const idleMs = resolveIdleLockMs(window.electronAPI?.idleLockMs);
        let timer = window.setTimeout(() => setLocked(true), idleMs);
        const bump = () => {
            if (locked) {
                return;
            }
            window.clearTimeout(timer);
            timer = window.setTimeout(() => setLocked(true), idleMs);
        };
        const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'pointerdown', 'wheel'];
        events.forEach((eventName) => window.addEventListener(eventName, bump));
        return () => {
            window.clearTimeout(timer);
            events.forEach((eventName) => window.removeEventListener(eventName, bump));
        };
    }, [locked]);

    if (!locked) {
        return null;
    }

    return (
        <Box
            role="dialog"
            aria-modal="true"
            aria-labelledby="df-idle-lock-title"
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: surface.canvas,
            }}
        >
            <Box sx={{ maxWidth: 420, px: 3, textAlign: 'center' }}>
                <Typography id="df-idle-lock-title" variant="h6" sx={{ mb: 1 }}>
                    {t('app.idleLockTitle')}
                </Typography>
                <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                    {t('app.idleLockBody')}
                </Typography>
                <Button variant="contained" onClick={() => setLocked(false)} sx={{ textTransform: 'none' }}>
                    {t('app.idleUnlock')}
                </Button>
            </Box>
        </Box>
    );
};
