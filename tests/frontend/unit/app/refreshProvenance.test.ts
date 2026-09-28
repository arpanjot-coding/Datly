import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    apiRequest: vi.fn(),
    triggerRefreshCascade: vi.fn(),
}));

vi.mock('../../../../src/app/apiClient', () => ({
    apiRequest: mocks.apiRequest,
    ApiRequestError: class ApiRequestError extends Error {},
}));

vi.mock('../../../../src/app/pipelineApi', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../../src/app/pipelineApi')>();
    return { ...actual, triggerRefreshCascade: mocks.triggerRefreshCascade };
});

import { dataFormulatorReducer, dfActions } from '../../../../src/app/dfSlice';
import { hydratePipelineClean } from '../../../../src/app/hydratePipelineClean';
import i18n from '../../../../src/i18n';
import {
    applyRefreshProvenance,
    applyRefreshProvenanceToInputTables,
    isScrapeRefreshable,
    liveConnectorIdsFromList,
} from '../../../../src/app/refreshProvenance';
import { materializeInputTablePreview } from '../../../../src/app/tableResolution';
import { useDataRefresh } from '../../../../src/app/useDataRefresh';
import type { DataSourceConfig, InputTable } from '../../../../src/components/ComponentType';
import type { PipelineRun } from '../../../../src/app/pipelineApi';

const LIVE_ID = 'web:sales';
const SOURCE_ID = 'scraped';
const OUTPUT_ID = 'scraped_trim_abc123';

const liveDbSource: DataSourceConfig = {
    type: 'database',
    connectorId: LIVE_ID,
    canRefresh: true,
};

function makeInputTable(sourceConfig: DataSourceConfig): InputTable {
    return {
        kind: 'input-table',
        id: SOURCE_ID,
        displayId: SOURCE_ID,
        source: {
            kind: 'connector',
            connectorId: sourceConfig.connectorId || LIVE_ID,
            sourceTable: { id: 'table_0', name: 'table_0' },
            path: [],
            workspaceTableId: SOURCE_ID,
        },
        sourceConfig,
        snapshot: {
            columns: [{ name: 'name', type: 'string' as any }],
            rowCount: 1,
            capturedAt: 1,
        },
        description: '',
        addedAt: 1,
    };
}

describe('isScrapeRefreshable', () => {
    it('keeps a live database connector refreshable', () => {
        expect(isScrapeRefreshable(liveDbSource, new Set([LIVE_ID]))).toBe(true);
        expect(isScrapeRefreshable(liveDbSource, [LIVE_ID])).toBe(true);
    });

    it('treats a missing instance as reconnect, not refresh', () => {
        expect(isScrapeRefreshable(liveDbSource, new Set())).toBe(false);
        expect(isScrapeRefreshable(liveDbSource, ['web:other'])).toBe(false);
    });

    it('does not treat derived tables or tables without connectorId as scrape-refreshable', () => {
        expect(isScrapeRefreshable(liveDbSource, [LIVE_ID], { isDerived: true })).toBe(false);
        expect(isScrapeRefreshable({
            type: 'database',
            canRefresh: true,
        }, [LIVE_ID])).toBe(false);
    });

    it('does not fake refresh when connectors are disabled', () => {
        expect(isScrapeRefreshable(liveDbSource, [LIVE_ID], { connectorsEnabled: false })).toBe(false);
    });

    it('does not invent refresh for stream or unstamped database sources', () => {
        expect(isScrapeRefreshable({
            type: 'stream',
            url: 'https://example.com/feed.json',
            canRefresh: true,
            connectorId: LIVE_ID,
        }, [LIVE_ID])).toBe(false);
        expect(isScrapeRefreshable({
            type: 'database',
            connectorId: LIVE_ID,
            canRefresh: false,
        }, [LIVE_ID])).toBe(false);
    });
});

describe('applyRefreshProvenance', () => {
    it('leaves a live scrape table marked refreshable', () => {
        expect(applyRefreshProvenance(liveDbSource, [LIVE_ID])).toEqual(liveDbSource);
    });

    it('clears canRefresh when the web instance is gone', () => {
        expect(applyRefreshProvenance(liveDbSource, [])).toEqual({
            ...liveDbSource,
            canRefresh: false,
        });
    });

    it('never invents canRefresh', () => {
        const unstamped: DataSourceConfig = {
            type: 'database',
            connectorId: LIVE_ID,
        };
        expect(applyRefreshProvenance(unstamped, [LIVE_ID])?.canRefresh).not.toBe(true);
    });

    it('clears canRefresh on derived CLEAN even if a live id is present', () => {
        expect(applyRefreshProvenance(liveDbSource, [LIVE_ID], { isDerived: true })).toEqual({
            ...liveDbSource,
            canRefresh: false,
        });
    });

    it('stamps restored input tables from the live connector list', () => {
        const live = applyRefreshProvenanceToInputTables(
            [makeInputTable(liveDbSource)],
            [LIVE_ID],
        );
        expect(live[0].sourceConfig?.canRefresh).toBe(true);

        const deleted = applyRefreshProvenanceToInputTables(
            [makeInputTable(liveDbSource)],
            [],
        );
        expect(deleted[0].sourceConfig?.canRefresh).toBe(false);
        expect(deleted[0].sourceConfig?.connectorId).toBe(LIVE_ID);
    });
});

describe('liveConnectorIdsFromList', () => {
    it('reads ids only from a connectors array', () => {
        expect(liveConnectorIdsFromList({ connectors: [{ id: LIVE_ID }, { id: '' }, {}] }))
            .toEqual([LIVE_ID]);
        expect(liveConnectorIdsFromList({ connectors: [] })).toEqual([]);
        expect(liveConnectorIdsFromList({ statistics: [], result: [] } as any)).toBeNull();
        expect(liveConnectorIdsFromList(undefined)).toBeNull();
    });
});

describe('materializeInputTablePreview provenance', () => {
    it('copies sourceConfig as-is when no live list is provided', () => {
        const table = makeInputTable(liveDbSource);
        expect(materializeInputTablePreview(table).source?.canRefresh).toBe(true);
    });

    it('does not look connected after restore when the instance is gone', () => {
        const table = makeInputTable(liveDbSource);
        const materialized = materializeInputTablePreview(table, []);
        expect(materialized.source?.canRefresh).toBe(false);
        expect(materialized.source?.connectorId).toBe(LIVE_ID);
    });

    it('keeps scrape refresh when the live web instance still exists', () => {
        const table = makeInputTable(liveDbSource);
        expect(materializeInputTablePreview(table, [LIVE_ID]).source?.canRefresh).toBe(true);
    });
});

describe('hydratePipelineClean provenance', () => {
    beforeEach(() => {
        mocks.apiRequest.mockReset();
        mocks.apiRequest.mockImplementation((url: string) => {
            if (String(url).includes('list-tables')) {
                return Promise.resolve({
                    data: {
                        tables: [{
                            name: OUTPUT_ID,
                            row_count: 1,
                            columns: [{ name: 'name', type: 'VARCHAR' }],
                            sample_rows: [{ name: 'alice' }],
                            source_metadata: {
                                loader_type: 'WebDataLoader',
                                source_table: 'table_0',
                            },
                        }],
                    },
                });
            }
            return Promise.resolve({ data: { statistics: [], result: [] } });
        });
    });

    it('does not copy scrape canRefresh onto derived CLEAN parquet', async () => {
        const store = configureStore({
            reducer: dataFormulatorReducer,
            middleware: (getDefault) => getDefault({ serializableCheck: false }),
        });
        store.dispatch(dfActions.addTableToStore({
            kind: 'table',
            id: SOURCE_ID,
            displayId: SOURCE_ID,
            names: ['name'],
            metadata: { name: { type: 'string', levels: [] } },
            rows: [{ name: ' alice ' }],
            virtual: { tableId: SOURCE_ID, rowCount: 1 },
            description: '',
            source: liveDbSource,
        } as any));

        const run: PipelineRun = {
            id: 'run-clean',
            workspace_id: 'ws',
            trigger: 'load',
            status: 'completed',
            steps: [{
                id: 'clean',
                step_type: 'clean',
                status: 'completed',
                params: {},
                result: {
                    applied: [{ verb: 'trim', output_table: OUTPUT_ID }],
                    output_table: OUTPUT_ID,
                },
            }],
            context: {},
            created_at: '2026-01-01',
        };

        await store.dispatch(hydratePipelineClean(run, SOURCE_ID) as any);

        const derived = store.getState().derivedTables[0];
        expect(derived.id).toBe(OUTPUT_ID);
        expect(derived.source).toBeUndefined();
        expect(derived.source?.canRefresh).not.toBe(true);
        expect(isScrapeRefreshable(derived.source, [LIVE_ID], { isDerived: !!derived.derive })).toBe(false);
    });
});

describe('useDataRefresh provenance', () => {
    let latest: ReturnType<typeof useDataRefresh> | null = null;

    function Probe() {
        latest = useDataRefresh();
        return null;
    }

    function makeStore() {
        const store = configureStore({
            reducer: dataFormulatorReducer,
            middleware: (getDefault) => getDefault({ serializableCheck: false }),
        });
        store.dispatch(dfActions.addTableToStore({
            kind: 'table',
            id: SOURCE_ID,
            displayId: SOURCE_ID,
            names: ['name'],
            metadata: { name: { type: 'string', levels: [] } },
            rows: [{ name: 'alice' }],
            contentHash: 'stale-hash',
            virtual: { tableId: SOURCE_ID, rowCount: 1 },
            description: '',
            source: liveDbSource,
        } as any));
        return store;
    }

    function stubApis(connectors: Array<{ id: string }>) {
        mocks.apiRequest.mockImplementation((url: string) => {
            const path = String(url);
            if (path.includes('refresh-data')) {
                return Promise.resolve({
                    data: { row_count: 2, data_changed: true },
                });
            }
            if (path.includes('sample-table')) {
                return Promise.resolve({
                    data: { rows: [{ name: 'bob' }] },
                });
            }
            if (path === '/api/connectors' || path.endsWith('/api/connectors')) {
                return Promise.resolve({ data: { connectors } });
            }
            return Promise.resolve({ data: { statistics: [], result: [] } });
        });
    }

    afterEach(() => {
        cleanup();
        latest = null;
    });

    beforeEach(() => {
        mocks.apiRequest.mockReset();
        mocks.triggerRefreshCascade.mockReset();
        mocks.triggerRefreshCascade.mockResolvedValue({
            id: 'run',
            workspace_id: 'ws',
            trigger: 'refresh',
            status: 'completed',
            steps: [],
            context: {},
            created_at: '2026-01-01',
        });
    });

    it('refresh after restore hits REFRESH_DATA when the web instance is live', async () => {
        stubApis([{ id: LIVE_ID }]);
        const store = makeStore();
        render(React.createElement(Provider, { store }, React.createElement(Probe)));

        await act(async () => {
            await latest!.manualRefresh(SOURCE_ID);
        });

        const refreshCall = mocks.apiRequest.mock.calls.find(([url]) => String(url).includes('refresh-data'));
        expect(refreshCall).toBeTruthy();
        expect(JSON.parse(String(refreshCall?.[1]?.body))).toMatchObject({
            connector_id: LIVE_ID,
            table_name: SOURCE_ID,
        });
        expect(latest!.getRefreshInfo(SOURCE_ID)?.canRefresh).toBe(true);
    });

    it('deleted instance does not look connected and asks to reconnect', async () => {
        stubApis([]);
        const store = makeStore();
        render(React.createElement(Provider, { store }, React.createElement(Probe)));

        await act(async () => {
            await latest!.manualRefresh(SOURCE_ID);
        });

        expect(mocks.apiRequest.mock.calls.some(([url]) => String(url).includes('refresh-data'))).toBe(false);
        expect(latest!.getRefreshInfo(SOURCE_ID)?.canRefresh).toBe(false);
        const warning = store.getState().messages.find((message) => message.type === 'warning');
        expect(warning?.value).toContain(i18n.t('dataLoading.loadPlan.reconnectAndRetry'));
    });

    it('does not fake canRefresh when data connectors are disabled', async () => {
        stubApis([{ id: LIVE_ID }]);
        const store = makeStore();
        store.dispatch(dfActions.setServerConfig({
            ...store.getState().serverConfig,
            DISABLE_DATA_CONNECTORS: true,
        }));
        render(React.createElement(Provider, { store }, React.createElement(Probe)));

        await act(async () => {
            await latest!.manualRefresh(SOURCE_ID);
        });

        expect(mocks.apiRequest.mock.calls.some(([url]) => String(url).includes('refresh-data'))).toBe(false);
        expect(latest!.getRefreshInfo(SOURCE_ID)?.canRefresh).toBe(false);
    });
});
