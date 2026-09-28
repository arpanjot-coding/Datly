import { describe, expect, it } from 'vitest';

import {
    buildPendingWebTableBind,
    resolvePendingTableLoadBind,
    successfulFetchUrlFromToolResult,
} from '../../../../src/app/agentWebBind';

describe('agent web bind', () => {
    it('pending with sourceUrl binds as a refreshable database connector, not extract', () => {
        const decision = resolvePendingTableLoadBind(
            { name: 'cities', sourceUrl: 'https://example.com/data.csv' },
            true,
        );

        expect(decision).toEqual({
            mode: 'web',
            url: 'https://example.com/data.csv',
        });

        const bind = buildPendingWebTableBind({
            connectorId: 'web:example-com',
            pendingName: 'cities',
            url: decision.mode === 'web' ? decision.url : '',
            catalogNodes: [{
                name: 'data',
                node_type: 'table',
                metadata: { _source_name: 'data' },
            }],
        });

        expect(bind.source.type).toBe('database');
        expect(bind.source.type).not.toBe('extract');
        expect(bind.source.type).not.toBe('url');
        expect(bind.source.type).not.toBe('stream');
        expect(['url', 'stream', 'extract']).not.toContain(bind.source.type);
        expect(bind.source.connectorId).toBe('web:example-com');
        expect(bind.source.canRefresh).toBe(true);
        expect(bind.sourceTableRef).toEqual({ id: 'data', name: 'cities' });
    });

    it('pending without sourceUrl stays extract', () => {
        const image = resolvePendingTableLoadBind({ name: 'from_image' }, true);
        const upload = resolvePendingTableLoadBind(
            { name: 'from_upload', csvScratchPath: 'scratch/a.csv' },
            true,
        );
        expect(image).toEqual({ mode: 'extract' });
        expect(upload).toEqual({ mode: 'extract' });
        expect(image.mode).not.toBe('web');
        expect(upload.mode).not.toBe('web');
    });

    it('sourceUrl with connectors disabled stays extract', () => {
        expect(resolvePendingTableLoadBind(
            { name: 'cities', sourceUrl: 'https://example.com/data.csv' },
            false,
        )).toEqual({ mode: 'extract' });
    });

    it('remembers only a successful fetch_url url', () => {
        expect(successfulFetchUrlFromToolResult({
            tool: 'fetch_url',
            url: 'https://example.com/data.csv',
        })).toBe('https://example.com/data.csv');
        expect(successfulFetchUrlFromToolResult({
            tool: 'fetch_url',
            url: 'https://example.com/blocked',
            error: 'verification challenge',
        })).toBeUndefined();
        expect(successfulFetchUrlFromToolResult({
            tool: 'execute_python',
            url: 'https://example.com/data.csv',
        })).toBeUndefined();
    });

    it('uses the URL stem when the catalog is empty', () => {
        const bind = buildPendingWebTableBind({
            connectorId: 'web:stem',
            pendingName: 'preview_df',
            url: 'https://example.com/reports/cities.csv',
            catalogNodes: [],
        });

        expect(bind.source.type).toBe('database');
        expect(bind.sourceTableRef).toEqual({ id: 'cities', name: 'preview_df' });
    });
});
