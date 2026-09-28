import { afterEach, describe, expect, it } from 'vitest';
import {
    electronTitlebarInsets,
    islandOverlayFlush,
    isDesktopRuntime,
} from '../../../../src/app/desktop';

describe('isDesktopRuntime', () => {
    afterEach(() => {
        delete window.electronAPI;
        window.history.replaceState({}, '', '/');
    });

    it('is false in a normal browser session', () => {
        expect(isDesktopRuntime()).toBe(false);
    });

    it('is true when the desktop query flag is set', () => {
        window.history.replaceState({}, '', '/?desktop=1');
        expect(isDesktopRuntime()).toBe(true);
    });

    it('is true when the Electron preload bridge is present', () => {
        window.electronAPI = { isDesktop: true, platform: 'win32' };
        expect(isDesktopRuntime()).toBe(true);
    });

    it('reserves Windows caption space when the overlay title bar is on', () => {
        window.electronAPI = {
            isDesktop: true,
            platform: 'win32',
            titleBarOverlay: true,
            titleBarHeight: 52,
            captionInset: 140,
            trafficInset: 0,
        };
        expect(electronTitlebarInsets()).toEqual({
            left: 0,
            right: 140,
            overlay: true,
            height: 52,
        });
    });
});

describe('islandOverlayFlush', () => {
    afterEach(() => {
        delete window.electronAPI;
        window.history.replaceState({}, '', '/');
    });

    it('keeps the full sage inset in a browser session', () => {
        expect(islandOverlayFlush()).toEqual({
            flushTop: false,
            flushRight: false,
            flushLeft: false,
        });
    });

    it('flushes the top and right under Windows caption buttons', () => {
        expect(islandOverlayFlush({
            left: 0,
            right: 140,
            overlay: true,
            height: 52,
        })).toEqual({
            flushTop: true,
            flushRight: true,
            flushLeft: false,
        });
    });

    it('flushes the top and left under macOS traffic lights', () => {
        expect(islandOverlayFlush({
            left: 78,
            right: 0,
            overlay: true,
            height: 52,
        })).toEqual({
            flushTop: true,
            flushRight: false,
            flushLeft: true,
        });
    });
});
