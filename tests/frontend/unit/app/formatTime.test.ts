import { describe, expect, it } from 'vitest';

import { formatRelativeTime } from '../../../../src/app/formatTime';

const NOW = Date.parse('2026-08-23T12:00:00.000Z');

describe('formatRelativeTime', () => {
    it('returns an empty string for missing or invalid input', () => {
        expect(formatRelativeTime(undefined, NOW)).toBe('');
        expect(formatRelativeTime(null, NOW)).toBe('');
        expect(formatRelativeTime('not-a-date', NOW)).toBe('');
    });

    it('uses relative units inside a month', () => {
        expect(formatRelativeTime('2026-08-23T11:59:30.000Z', NOW)).toMatch(/second/);
        expect(formatRelativeTime('2026-08-23T11:10:00.000Z', NOW)).toMatch(/minute|hour/);
        expect(formatRelativeTime('2026-08-20T12:00:00.000Z', NOW)).toMatch(/day/);
    });

    it('falls back to a locale date past a month', () => {
        const label = formatRelativeTime('2026-06-01T12:00:00.000Z', NOW);
        expect(label).not.toBe('');
        expect(label).not.toMatch(/second|minute|hour/);
    });
});
