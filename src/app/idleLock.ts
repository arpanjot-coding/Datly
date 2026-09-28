const DEFAULT_IDLE_MS = 15 * 60 * 1000;

export function resolveIdleLockMs(
    configured?: number | null,
    fallback = DEFAULT_IDLE_MS,
): number {
    if (typeof configured === "number" && Number.isFinite(configured) && configured > 0) {
        return configured;
    }
    return fallback;
}

export function desktopIdleLockEnabled(): boolean {
    if (typeof window === "undefined") {
        return false;
    }
    return Boolean(window.electronAPI?.isDesktop);
}
