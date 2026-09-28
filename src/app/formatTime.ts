/**
 * Relative timestamps for session lists.
 *
 * Landing cards were showing a full locale dump (`8/19/2026, 11:16:08 PM`).
 * The workspace picker already used a relative formatter; this is that
 * helper, with `now` injectable so tests do not depend on wall time.
 */

export function formatRelativeTime(
    iso: string | null | undefined,
    now: number = Date.now(),
): string {
    if (!iso) return '';
    const then = new Date(iso);
    if (Number.isNaN(then.getTime())) return '';

    const diffMs = then.getTime() - now;
    const absSec = Math.abs(Math.round(diffMs / 1000));
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), 'second');
    const absMin = Math.round(absSec / 60);
    if (absMin < 60) return rtf.format(Math.round(diffMs / 60000), 'minute');
    const absHr = Math.round(absMin / 60);
    if (absHr < 24) return rtf.format(Math.round(diffMs / 3600000), 'hour');
    const absDay = Math.round(absHr / 24);
    if (absDay < 30) return rtf.format(Math.round(diffMs / 86400000), 'day');
    return then.toLocaleDateString();
}
