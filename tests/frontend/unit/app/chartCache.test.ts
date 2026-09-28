import { describe, expect, it } from 'vitest';
import { computeCacheKey } from '../../../../src/app/chartCache';
import { HOUSE_THEME_REVISION } from '../../../../src/app/chartTheme';

describe('computeCacheKey', () => {
    it('does not take a 13th positional argument', () => {
        expect(computeCacheKey.length).toBe(11);
    });

    it('bakes houseRevision when themeId is null', () => {
        const parsed = JSON.parse(computeCacheKey('Bar Chart', {}, {}, 10, 'hash', 't1'));
        expect(parsed.themeId).toBe(null);
        expect(parsed.houseRevision).toBe(HOUSE_THEME_REVISION);
    });

    it('does not bake houseRevision when a flint theme is selected', () => {
        const parsed = JSON.parse(
            computeCacheKey(
                'Bar Chart',
                {},
                {},
                10,
                'hash',
                't1',
                undefined,
                undefined,
                undefined,
                undefined,
                'nyt',
            ),
        );
        expect(parsed.themeId).toBe('nyt');
        expect(parsed.houseRevision).toBe(null);
    });
});
