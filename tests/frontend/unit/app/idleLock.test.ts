import { describe, expect, it } from 'vitest';

import { resolveIdleLockMs } from '../../../../src/app/idleLock';

describe('idle lock', () => {
    it('uses a positive configured timeout', () => {
        expect(resolveIdleLockMs(30_000)).toBe(30_000);
    });

    it('falls back when the configured value is missing', () => {
        expect(resolveIdleLockMs(undefined)).toBe(15 * 60 * 1000);
        expect(resolveIdleLockMs(0)).toBe(15 * 60 * 1000);
        expect(resolveIdleLockMs(-1)).toBe(15 * 60 * 1000);
    });
});
