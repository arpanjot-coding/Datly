import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toInputTable } from '../../../../src/app/tableToInputTable';
import type { DictTable } from '../../../../src/components/ComponentType';
import { Type } from '../../../../src/data/types';

const NOW = 1_777_206_000_000;

function makeTable(overrides: Partial<DictTable> = {}): DictTable {
    return {
        kind: 'table',
        id: 'sales',
        displayId: 'Sales',
        names: ['amount'],
        metadata: {
            amount: { type: Type.Number, levels: [] },
        },
        rows: [{ amount: 1 }],
        virtual: { tableId: 'sales_ws', rowCount: 10 },
        description: '',
        ...overrides,
    };
}

describe('toInputTable', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('maps connectorId to kind connector and copies sourceConfig.connectorId', () => {
        const source = {
            type: 'database' as const,
            connectorId: 'web:example-com',
            originalTableName: 'table_0',
            canRefresh: true,
        };
        const input = toInputTable(makeTable({ source }));

        expect(input.source).toEqual({
            kind: 'connector',
            connectorId: 'web:example-com',
            sourceTable: { id: 'table_0', name: 'table_0' },
            path: [],
            workspaceTableId: 'sales_ws',
        });
        expect(input.sourceConfig).toEqual(source);
        expect(input.sourceConfig?.connectorId).toBe('web:example-com');
    });

    it('keeps extract and gzip leftovers as kind workspace', () => {
        const extract = toInputTable(makeTable({
            source: { type: 'extract', fileName: 'page.html' },
        }));
        expect(extract.source).toEqual({ kind: 'workspace', tableId: 'sales_ws' });
        expect(extract.sourceConfig?.type).toBe('extract');
        expect(extract.sourceConfig?.connectorId).toBeUndefined();

        const gzipUrl = toInputTable(makeTable({
            source: { type: 'url', url: 'https://example.com/data.csv' },
        }));
        expect(gzipUrl.source).toEqual({ kind: 'workspace', tableId: 'sales_ws' });
        expect(gzipUrl.source.kind).not.toBe('connector');
        expect(gzipUrl.sourceConfig?.connectorId).toBeUndefined();

        const gzipStream = toInputTable(makeTable({
            source: { type: 'stream', url: 'https://example.com/live' },
        }));
        expect(gzipStream.source).toEqual({ kind: 'workspace', tableId: 'sales_ws' });
        expect(gzipStream.source.kind).not.toBe('connector');
        expect(gzipStream.sourceConfig?.connectorId).toBeUndefined();
        expect(gzipStream.sourceConfig?.canRefresh).toBeUndefined();
    });

    it('maps a table without source to kind workspace', () => {
        const input = toInputTable(makeTable());
        expect(input.source).toEqual({ kind: 'workspace', tableId: 'sales_ws' });
        expect(input.sourceConfig).toBeUndefined();
    });
});
