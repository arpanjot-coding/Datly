export function getLaunchToken(): string {
    if (typeof window === "undefined") {
        return "";
    }
    return window.electronAPI?.launchToken || "";
}

export function isDesktopRuntime(): boolean {
    if (typeof window === "undefined") {
        return false;
    }
    if (window.electronAPI?.isDesktop) {
        return true;
    }
    return new URLSearchParams(window.location.search).get("desktop") === "1";
}

export type TitlebarInsets = {
    left: number;
    right: number;
    overlay: boolean;
    height: number;
};

export function electronTitlebarInsets(): TitlebarInsets {
    const api = typeof window === "undefined" ? undefined : window.electronAPI;
    if (!api?.titleBarOverlay) {
        return { left: 0, right: 0, overlay: false, height: 0 };
    }
    return {
        left: api.trafficInset ?? 0,
        right: api.captionInset ?? 0,
        overlay: true,
        height: api.titleBarHeight ?? 0,
    };
}

/** Drop sage inset and rounding under native overlay chrome so caption / traffic
 *  buttons sit on the island instead of in the gutter beside it. */
export function islandOverlayFlush(insets: TitlebarInsets = electronTitlebarInsets()) {
    return {
        flushTop: insets.overlay,
        flushRight: insets.overlay && insets.right > 0,
        flushLeft: insets.overlay && insets.left > 0,
    };
}
