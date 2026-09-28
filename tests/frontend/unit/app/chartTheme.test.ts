import { describe, expect, it } from 'vitest';
import { DATLY_CHART_THEME, DATLY_THEME_LABEL, HOUSE_THEME_REVISION } from '../../../../src/app/chartTheme';
import { surface } from '../../../../src/app/tokens';

const HOUSE_CATEGORICAL = [
    '#1f6b4a',
    '#b4532a',
    '#3d5a73',
    '#c4a35a',
    '#2d6a8a',
    '#7a4e6e',
] as const;

describe('DATLY_CHART_THEME', () => {
    it('uses Datly forest green as the default series ink', () => {
        expect(DATLY_THEME_LABEL).toBe('Datly');
        expect(DATLY_CHART_THEME.id).toBe('datly');
        expect(DATLY_CHART_THEME.ink.series.single).toBe('#1f6b4a');
        expect(DATLY_CHART_THEME.ink.series.categorical[0]).toBe('#1f6b4a');
        expect(DATLY_CHART_THEME.ink.series.categorical[1]).toBe('#b4532a');
        expect(DATLY_CHART_THEME.ink.series.categorical[0]).not.toBe(
            DATLY_CHART_THEME.ink.series.categorical[1],
        );
        expect(DATLY_CHART_THEME.marks.point.presence).toBe('omit');
        expect(DATLY_CHART_THEME.ink.surface.plot).toBe(surface.plot);
        expect(DATLY_CHART_THEME.ink.surface.plot).toBe(surface.paper);
        expect(DATLY_CHART_THEME.ink.surface.plot).toBe('#f3f5f0');
        expect(DATLY_CHART_THEME.ink.surface.canvas).toBe(surface.paper);
    });

    it('replaces sage cluster hues 2-5 with slate/ochre/steel/plum', () => {
        expect([...DATLY_CHART_THEME.ink.series.categorical]).toEqual([...HOUSE_CATEGORICAL]);
        expect([...DATLY_CHART_THEME.ink.series.categoricalExtended.slice(0, 6)]).toEqual(
            [...HOUSE_CATEGORICAL],
        );
        expect(HOUSE_THEME_REVISION).toBe(2);
    });
});
