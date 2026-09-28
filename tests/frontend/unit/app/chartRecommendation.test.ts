import { describe, expect, it } from 'vitest';

import { resolveAgentChartType, resolveRecommendedChart } from '../../../../src/app/chartRecommendation';
import { Type } from '../../../../src/data/types';
import { DictTable, FieldItem } from '../../../../src/components/ComponentType';

const dateTable = {
    kind: 'table',
    id: 'stock-close1',
    displayId: 'stock-close1',
    names: ['date', 'close', 'symbol'],
    metadata: {
        date: { type: Type.Date, levels: [] },
        close: { type: Type.Number, levels: [] },
        symbol: { type: Type.String, levels: [] },
    },
    rows: [
        { date: '2025-08-01', close: 190, symbol: 'GOOGL' },
        { date: '2025-08-02', close: 191, symbol: 'GOOGL' },
    ],
    virtual: { tableId: 'stock-close1', rowCount: 2 },
} as unknown as DictTable;

const fields: FieldItem[] = [
    { id: 'f-date', name: 'date', source: 'original', tableRef: 'stock-close1' },
    { id: 'f-close', name: 'close', source: 'original', tableRef: 'stock-close1' },
    { id: 'f-symbol', name: 'symbol', source: 'original', tableRef: 'stock-close1' },
] as FieldItem[];

describe('resolveAgentChartType', () => {
    it('maps short names, snake_case, and full labels onto template names', () => {
        expect(resolveAgentChartType('line')).toBe('Line Chart');
        expect(resolveAgentChartType('line_chart')).toBe('Line Chart');
        expect(resolveAgentChartType('Line Chart')).toBe('Line Chart');
        expect(resolveAgentChartType('connected_scatter')).toBe('Connected Scatter Plot');
        expect(resolveAgentChartType('scatter_plot')).toBe('Scatter Plot');
    });

    it('returns undefined for unknown labels instead of inventing a type', () => {
        expect(resolveAgentChartType('not_a_chart')).toBeUndefined();
        expect(resolveAgentChartType('')).toBeUndefined();
    });
});

describe('resolveRecommendedChart', () => {
    it('does not fall through line_chart to Scatter Plot', () => {
        const chart = resolveRecommendedChart({
            chart: { chart_type: 'line_chart', encodings: { x: 'date', y: 'close', color: 'symbol' } },
        }, fields, dateTable);
        expect(chart.chartType).toBe('Line Chart');
        expect(chart.encodingMap.x?.fieldID).toBe('f-date');
        expect(chart.encodingMap.y?.fieldID).toBe('f-close');
        expect(chart.encodingMap.color?.fieldID).toBe('f-symbol');
    });

    it('promotes a scatter recommendation with a temporal x to a line chart', () => {
        const chart = resolveRecommendedChart({
            chart: { chart_type: 'Scatter Plot', encodings: { x: 'date', y: 'close', color: 'symbol' } },
        }, fields, dateTable);
        expect(chart.chartType).toBe('Line Chart');
    });

    it('keeps scatter when x is not temporal', () => {
        const numericTable = {
            ...dateTable,
            names: ['height', 'weight'],
            metadata: {
                height: { type: Type.Number, levels: [] },
                weight: { type: Type.Number, levels: [] },
            },
            rows: [{ height: 1, weight: 2 }],
        } as unknown as DictTable;
        const numericFields: FieldItem[] = [
            { id: 'f-h', name: 'height', source: 'original', tableRef: 't' },
            { id: 'f-w', name: 'weight', source: 'original', tableRef: 't' },
        ] as FieldItem[];
        const chart = resolveRecommendedChart({
            chart: { chart_type: 'scatter', encodings: { x: 'height', y: 'weight' } },
        }, numericFields, numericTable);
        expect(chart.chartType).toBe('Scatter Plot');
    });
});
