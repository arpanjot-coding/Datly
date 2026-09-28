import { createRequire } from 'module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { updatesDisabled } = require('../../../../electron/updater.cjs') as {
    updatesDisabled: (env?: NodeJS.ProcessEnv) => boolean;
};

describe('electron updater policy', () => {
    it('is enabled by default', () => {
        expect(updatesDisabled({})).toBe(false);
    });

    it('disables updates for managed installs', () => {
        expect(updatesDisabled({ DATA_FORMULATOR_MANAGED: '1' })).toBe(true);
        expect(updatesDisabled({ DATLY_DISABLE_UPDATES: 'true' })).toBe(true);
    });
});
