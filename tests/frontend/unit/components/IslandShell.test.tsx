import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { IslandShell } from '../../../../src/components/IslandShell';

const theme = createTheme();

const renderShell = () =>
    render(
        <ThemeProvider theme={theme}>
            <IslandShell header={<div>hdr</div>}>body</IslandShell>
        </ThemeProvider>,
    );

describe('IslandShell overlay flush', () => {
    afterEach(() => {
        delete window.electronAPI;
    });

    it('keeps sage inset and island rounding in a browser session', () => {
        const { container } = renderShell();
        const field = container.firstElementChild as HTMLElement;
        const island = field.firstElementChild as HTMLElement;
        expect(window.getComputedStyle(field).paddingTop).not.toBe('0px');
        expect(window.getComputedStyle(island).borderTopRightRadius).not.toBe('0px');
    });

    it('keeps an even sage lip on every side under Windows caption buttons', () => {
        window.electronAPI = {
            isDesktop: true,
            platform: 'win32',
            titleBarOverlay: true,
            titleBarHeight: 0,
            captionInset: 0,
            trafficInset: 0,
        };
        const { container } = renderShell();
        const field = container.firstElementChild as HTMLElement;
        const island = field.firstElementChild as HTMLElement;
        const fieldStyle = window.getComputedStyle(field);
        expect(fieldStyle.paddingTop).not.toBe('0px');
        expect(fieldStyle.paddingTop).toBe(fieldStyle.paddingBottom);
        expect(fieldStyle.paddingTop).toBe(fieldStyle.paddingLeft);
        expect(fieldStyle.paddingTop).toBe(fieldStyle.paddingRight);
        expect(window.getComputedStyle(island).borderTopLeftRadius).not.toBe('0px');
        expect(window.getComputedStyle(island).borderTopRightRadius).not.toBe('0px');
    });

    it('drops only the left lip under macOS traffic lights', () => {
        window.electronAPI = {
            isDesktop: true,
            platform: 'darwin',
            titleBarOverlay: true,
            titleBarHeight: 0,
            captionInset: 0,
            trafficInset: 78,
        };
        const { container } = renderShell();
        const field = container.firstElementChild as HTMLElement;
        const fieldStyle = window.getComputedStyle(field);
        expect(fieldStyle.paddingTop).not.toBe('0px');
        expect(fieldStyle.paddingTop).toBe(fieldStyle.paddingBottom);
        expect(fieldStyle.paddingLeft === '0px' || fieldStyle.paddingLeft === '').toBe(true);
        expect(window.getComputedStyle(field.firstElementChild as HTMLElement).borderTopLeftRadius).not.toBe('0px');
    });
});
