import { describe, expect, it } from 'vitest';

import { assembleVegaChart, chartTypeForAssembly } from '../../../../src/app/utils';
import { Type } from '../../../../src/data/types';

const concepts = [
    { id: 'date', name: 'date', source: 'original', tableRef: 't' },
    { id: 'close', name: 'close', source: 'original', tableRef: 't' },
    { id: 'symbol', name: 'symbol', source: 'original', tableRef: 't' },
    { id: 'height', name: 'height', source: 'original', tableRef: 't' },
    { id: 'weight', name: 'weight', source: 'original', tableRef: 't' },
] as any;

const timeSeriesRows = [
    { date: '2025-08-01', close: 190.1, symbol: 'GOOGL' },
    { date: '2025-08-04', close: 191.4, symbol: 'GOOGL' },
    { date: '2025-08-01', close: 420.2, symbol: 'MSFT' },
    { date: '2025-08-04', close: 422.0, symbol: 'MSFT' },
];

const timeSeriesEncodings = {
    x: { fieldID: 'date', dtype: 'temporal' },
    y: { fieldID: 'close', dtype: 'quantitative' },
    color: { fieldID: 'symbol', dtype: 'nominal' },
} as any;

const metadata = {
    date: { type: Type.Date, levels: [] },
    close: { type: Type.Number, levels: [] },
    symbol: { type: Type.String, levels: [] },
} as any;

const specMarkType = (spec: any): string | undefined => {
    if (typeof spec?.mark === 'string') return spec.mark;
    if (spec?.mark?.type) return spec.mark.type;
    const layer = spec?.layer?.[0];
    if (typeof layer?.mark === 'string') return layer.mark;
    return layer?.mark?.type;
};

describe('chartTypeForAssembly', () => {
    it('promotes a scatter with temporal x to a line chart', () => {
        expect(chartTypeForAssembly(
            'Scatter Plot',
            { x: { field: 'date', type: 'temporal' }, y: { field: 'close', type: 'quantitative' } },
            metadata,
        )).toBe('Line Chart');
    });

    it('keeps a two-measure scatter as a scatter', () => {
        expect(chartTypeForAssembly(
            'Scatter Plot',
            { x: { field: 'height', type: 'quantitative' }, y: { field: 'weight', type: 'quantitative' } },
        )).toBe('Scatter Plot');
    });

    it('keeps an event cloud (many rows per date) as a scatter', () => {
        const events = [
            { date: '2025-08-01', close: 1 },
            { date: '2025-08-01', close: 2 },
            { date: '2025-08-01', close: 3 },
            { date: '2025-08-02', close: 4 },
            { date: '2025-08-02', close: 5 },
        ];
        expect(chartTypeForAssembly(
            'Scatter Plot',
            { x: { field: 'date', type: 'temporal' }, y: { field: 'close', type: 'quantitative' } },
            metadata,
            undefined,
            events,
        )).toBe('Scatter Plot');
    });
});

describe('assembleVegaChart time-series wires', () => {
    it('draws a connecting line for a scatter encoded against a date axis', () => {
        const spec = assembleVegaChart(
            'Scatter Plot',
            timeSeriesEncodings,
            concepts,
            timeSeriesRows,
            metadata,
            400,
            300,
        ) as any;

        expect(specMarkType(spec)).toBe('line');
    });

    it('still draws points for a quantitative-vs-quantitative scatter', () => {
        const spec = assembleVegaChart(
            'Scatter Plot',
            {
                x: { fieldID: 'height', dtype: 'quantitative' },
                y: { fieldID: 'weight', dtype: 'quantitative' },
            } as any,
            concepts,
            [{ height: 1, weight: 2 }, { height: 2, weight: 3 }],
            {
                height: { type: Type.Number, levels: [] },
                weight: { type: Type.Number, levels: [] },
            } as any,
            400,
            300,
        ) as any;

        expect(['circle', 'point']).toContain(specMarkType(spec));
    });
});
