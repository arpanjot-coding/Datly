/**
 * Agent response resolution — maps AI agent chart recommendations to
 * concrete Chart objects.
 *
 * The encoding recommendation engine lives in the flint-chart library.
 * Use `vlRecommendEncodings` / `ecRecommendEncodings` / etc. directly.
 */

import { Channel, Chart, DictTable, FieldItem } from '../components/ComponentType';
import { generateFreshChart } from './dfSlice';
import { vlGetTemplateDef } from 'flint-chart';
import { Type } from '../data/types';

/** Map from agent short names / snake_case to display chart type names. */
const AGENT_CHART_TYPE_MAP: Record<string, string> = {
    scatter: 'Scatter Plot',
    scatter_plot: 'Scatter Plot',
    point: 'Scatter Plot',
    regression: 'Regression',
    bar: 'Bar Chart',
    bar_chart: 'Bar Chart',
    grouped_bar: 'Grouped Bar Chart',
    grouped_bar_chart: 'Grouped Bar Chart',
    group_bar: 'Grouped Bar Chart',
    stacked_bar: 'Stacked Bar Chart',
    stacked_bar_chart: 'Stacked Bar Chart',
    histogram: 'Histogram',
    line: 'Line Chart',
    line_chart: 'Line Chart',
    area: 'Area Chart',
    area_chart: 'Area Chart',
    heatmap: 'Heatmap',
    boxplot: 'Boxplot',
    box_plot: 'Boxplot',
    pie: 'Pie Chart',
    pie_chart: 'Pie Chart',
    lollipop: 'Lollipop Chart',
    lollipop_chart: 'Lollipop Chart',
    waterfall: 'Waterfall Chart',
    candlestick: 'Candlestick Chart',
    world_map: 'World Map',
    us_map: 'US Map',
    worldmap: 'World Map',
    usmap: 'US Map',
    connected_scatter: 'Connected Scatter Plot',
    connected_scatter_plot: 'Connected Scatter Plot',
};

const normalizeChartTypeKey = (raw: string): string =>
    raw.trim().toLowerCase().replace(/[\s-]+/g, '_');

/**
 * Map an agent `chart_type` string onto a Flint template display name.
 * Accepts short names (`line`), snake_case (`line_chart`), and full labels
 * (`Line Chart`). Unknown values return undefined so the caller can fall back.
 */
export function resolveAgentChartType(raw: unknown): string | undefined {
    if (typeof raw !== 'string' || !raw.trim()) return undefined;
    const trimmed = raw.trim();
    const key = normalizeChartTypeKey(trimmed);
    if (AGENT_CHART_TYPE_MAP[key]) return AGENT_CHART_TYPE_MAP[key];
    if (vlGetTemplateDef(trimmed)) return trimmed;
    const titled = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (vlGetTemplateDef(titled)) return titled;
    return undefined;
}

const isTemporalTableField = (table: DictTable, fieldName: string): boolean => {
    const metaType = table.metadata?.[fieldName]?.type;
    return metaType === Type.Date || metaType === Type.DateTime || metaType === Type.Time;
};

/**
 * Resolve an AI agent's chart recommendation into a concrete Chart object.
 * The agent returns a `refinedGoal` with `chart.chart_type` which may be
 * a short name (e.g. "scatter"), a full template name (e.g. "Radar Chart"),
 * or a user-chosen chart type passed through from the UI.
 */
export const resolveRecommendedChart = (refinedGoal: any, allFields: FieldItem[], table: DictTable): Chart => {
    const chartObj = refinedGoal['chart'] || {};
    const rawChartType = chartObj['chart_type'];
    const chartEncodings = chartObj['encodings'];

    if (chartEncodings == undefined || rawChartType == undefined) {
        const xName = table.names.length > 1 ? table.names[0] : undefined;
        const fallbackType = xName && isTemporalTableField(table, xName) ? 'Line Chart' : 'Scatter Plot';
        let newChart = generateFreshChart(table.id, fallbackType) as Chart;
        const basicEncodings: { [key: string]: string } = table.names.length > 1
            ? { x: table.names[0], y: table.names[1] }
            : {};
        newChart = resolveChartFields(newChart, allFields, basicEncodings, table);
        return newChart;
    }

    // Resolve chart type: short-name / snake_case map, then a valid template name.
    // Unknown labels used to fall through to Scatter Plot, which dropped the
    // connecting stroke on time-series recommendations (`line_chart` → scatter).
    let chartType = resolveAgentChartType(rawChartType) || 'Scatter Plot';
    const xField = typeof chartEncodings === 'object' ? chartEncodings.x : undefined;
    if (chartType === 'Scatter Plot' && typeof xField === 'string' && isTemporalTableField(table, xField)) {
        chartType = 'Line Chart';
    }
    let newChart = generateFreshChart(table.id, chartType) as Chart;
    newChart = resolveChartFields(newChart, allFields, chartEncodings, table);

    // Apply chart config properties from agent recommendation
    if (chartObj['config'] && typeof chartObj['config'] === 'object') {
        newChart.config = { ...chartObj['config'] };
    }

    // Legacy: "Dotted Line Chart" was folded into Line Chart with a `showPoints` config flag.
    const rawKey = typeof rawChartType === 'string' ? normalizeChartTypeKey(rawChartType) : '';
    if (rawKey === 'dotted_line' || rawKey === 'dotted_line_chart') {
        newChart.chartType = 'Line Chart';
        newChart.config = { ...(newChart.config || {}), showPoints: true };
    }
    return newChart;
};

/**
 * Populate a chart's encodingMap from a plain { channel: fieldName } object.
 */
export const resolveChartFields = (
    chart: Chart,
    allFields: FieldItem[],
    chartEncodings: { [key: string]: string },
    table: DictTable,
): Chart => {
    // Get the keys that should be present after this update
    const newEncodingKeys = new Set(Object.keys(chartEncodings).map(key => key === 'facet' ? 'column' : key));

    // Remove encodings that are no longer in chartEncodings
    for (const key of Object.keys(chart.encodingMap)) {
        if (!newEncodingKeys.has(key) && chart.encodingMap[key as Channel]?.fieldID != undefined) {
            chart.encodingMap[key as Channel] = {};
        }
    }

    // Add/update encodings from chartEncodings
    for (let [key, value] of Object.entries(chartEncodings)) {
        if (key === 'facet') {
            key = 'column';
        }

        const field = allFields.find(c => c.name === value);
        if (field) {
            chart.encodingMap[key as Channel] = { fieldID: field.id };
        }
    }

    return chart;
};
