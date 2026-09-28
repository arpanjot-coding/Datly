import { fontUi, surface } from './tokens';

/** Bump on DATLY_CHART_THEME ink/type/structure change. Baked into computeCacheKey when themeId is null. */
export const HOUSE_THEME_REVISION = 3;

/** House theme for assembled charts: Cicada ink on paper, forest-green series. */
export const DATLY_CHART_THEME = {
    id: 'datly',
    label: 'Datly',
    ink: {
        surface: {
            source: 'house',
            canvas: surface.paper,
            plot: surface.plot,
        },
        text: {
            primary: surface.ink,
            secondary: surface.muted,
            muted: '#8a938b',
        },
        structure: {
            axis: surface.ink,
            grid: '#d4dbd3',
            rule: surface.ink,
            connector: surface.muted,
        },
        series: {
            single: '#1f6b4a',
            // Adjacent series must contrast. Two forest greens in a row made
            // dual time-series (GOOGL vs MSFT) read as one disconnected cloud.
            // Hues 2-5: slate / ochre / steel / plum (not sage).
            categorical: [
                '#1f6b4a',
                '#b4532a',
                '#3d5a73',
                '#c4a35a',
                '#2d6a8a',
                '#7a4e6e',
            ],
            categoricalExtended: [
                '#1f6b4a',
                '#b4532a',
                '#3d5a73',
                '#c4a35a',
                '#2d6a8a',
                '#7a4e6e',
                '#6b8f71',
                '#c47a4a',
                '#5c665e',
                '#18563c',
            ],
            sequential: {
                stops: ['#e4efe8', '#b7d4c4', '#6fa58a', '#1f6b4a', '#143d2c'],
                space: 'lab',
                endpointsAgainstSurface: true,
                consumption: 'interpolate',
            },
            diverging: {
                stops: ['#1f6b4a', '#9dc4b0', '#f3f5f0', '#e0b49a', '#b4532a'],
                space: 'lab',
                endpointsAgainstSurface: true,
                consumption: 'interpolate',
            },
            status: {
                positive: '#1f6b4a',
                negative: '#b4532a',
                neutral: surface.muted,
            },
            overflow: surface.muted,
        },
        accent: '#1f6b4a',
    },
    type: {
        minSize: 10,
        headline: {
            family: fontUi,
            size: 'text.400',
            weight: 'medium',
        },
        deck: {
            size: 'text.200',
            color: surface.muted,
        },
        axisLabel: {
            size: 'text.100',
            color: surface.muted,
        },
        axisTitle: {
            size: 'text.100',
            weight: 'medium',
            color: surface.ink,
        },
    },
    structure: {
        axis: {
            categorical: { line: 'omit', ticks: 'omit' },
            measure: { line: 'omit', ticks: 'omit' },
        },
        grid: {
            measure: 'quiet',
            category: 'omit',
            style: 'solid',
            zero: 'full',
        },
        frame: 'omit',
        baseline: 'quiet',
    },
    marks: {
        bandFraction: 0.72,
        strokeWeight: 2,
        strokeCap: 'round',
        strokeJoin: 'round',
        interpolation: 'monotone',
        cornerRadius: 4,
        point: {
            // Omit vertex dots on lines. `quiet` still *shows* dots, and on a
            // dense time series they fuse into a beaded rope that buries the
            // connecting stroke. Scatter marks are unaffected (they draw
            // because the chart is a scatter).
            presence: 'omit',
            fill: 'solid',
            size: 64,
        },
    },
} as const;

export const DATLY_THEME_LABEL = 'Datly';
