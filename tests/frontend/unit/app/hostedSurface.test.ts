import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(__dirname, '../../../..');

describe('hosted surface leftovers', () => {
    it('does not keep the share sheet that redirected to /login', () => {
        expect(existsSync(resolve(repoRoot, 'src/views/ShareSheet.tsx'))).toBe(false);
    });
});
