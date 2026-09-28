import { describe, expect, it } from 'vitest';

import {
    WEB_LOADER_CLASS_NAME,
    WEB_LOADER_TYPE,
    bindWebUrlCatalogNodes,
    buildWebUrlTableSource,
    findReusableWebConnector,
    isWebConnector,
    normalizeWebUrl,
} from '../../../../src/app/urlTabWebBind';

describe('url tab web bind', () => {
    it('stamps new URL tables as refreshable database sources, not url or stream', () => {
        const { source, sourceTableRef } = buildWebUrlTableSource({
            connectorId: 'web:example-com',
            tableId: 'cities',
            tableName: 'cities_1',
        });

        expect(source.type).toBe('database');
        expect(source.type).not.toBe('url');
        expect(source.type).not.toBe('stream');
        expect(source.type).not.toBe('extract');
        expect(['url', 'stream', 'extract']).not.toContain(source.type);
        expect(source.connectorId).toBe('web:example-com');
        expect(source.canRefresh).toBe(true);
        expect(source.url).toBeUndefined();
        expect(source.autoRefresh).toBeUndefined();
        expect(sourceTableRef).toEqual({ id: 'cities', name: 'cities_1' });
    });

    it('maps HTML catalog nodes table_0..n onto the same connector bind', () => {
        const items = bindWebUrlCatalogNodes('web:page', [
            {
                name: 'table_0',
                node_type: 'table',
                metadata: {
                    _source_name: 'table_0',
                    columns: [{ name: 'city' }],
                    sample_rows: [{ city: 'Seattle' }],
                },
            },
            {
                name: 'table_1',
                node_type: 'table',
                metadata: {
                    _source_name: 'table_1',
                    columns: [{ name: 'temp' }],
                    sample_rows: [{ temp: 12 }],
                },
            },
        ]);

        expect(items).toHaveLength(2);
        expect(items.map((item) => item.bind.sourceTableRef.id)).toEqual([
            'table_0',
            'table_1',
        ]);
        for (const item of items) {
            expect(item.bind.source.type).toBe('database');
            expect(item.bind.source.connectorId).toBe('web:page');
            expect(item.bind.source.canRefresh).toBe(true);
            expect(['url', 'stream', 'extract']).not.toContain(item.bind.source.type);
        }
        expect(items[0].rows).toEqual([{ city: 'Seattle' }]);
    });

    it('reuses an existing web connector with the same URL', () => {
        const reused = findReusableWebConnector(
            [
                {
                    id: 'mysql:prod',
                    source_type: 'MySQLDataLoader',
                    pinned_params: { url: 'https://example.com/data.csv' },
                },
                {
                    id: 'web:example-com',
                    source_type: WEB_LOADER_CLASS_NAME,
                    pinned_params: { url: 'https://example.com/data.csv' },
                },
            ],
            'https://example.com/data.csv',
        );

        expect(isWebConnector({ source_type: WEB_LOADER_CLASS_NAME })).toBe(true);
        expect(isWebConnector({ id: `${WEB_LOADER_TYPE}:other` })).toBe(true);
        expect(isWebConnector({ source_type: 'MySQLDataLoader' })).toBe(false);
        expect(reused?.id).toBe('web:example-com');
        expect(normalizeWebUrl('/api/demo.csv', 'https://app.local')).toBe(
            'https://app.local/api/demo.csv',
        );
        expect(
            findReusableWebConnector(
                [{
                    id: 'web:demo',
                    source_type: WEB_LOADER_CLASS_NAME,
                    pinned_params: { url: 'https://app.local/api/demo.csv' },
                }],
                '/api/demo.csv',
                'https://app.local',
            )?.id,
        ).toBe('web:demo');
    });
});
