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

import { dataFormulatorReducer, dfActions, dfSelectors } from '../../../../src/app/dfSlice';
import {
    afterRefreshHydrate,
    hydrateAfterTriggerRefresh,
} from '../../../../src/app/hydrateAfterTriggerRefresh';
import { useDataRefresh } from '../../../../src/app/useDataRefresh';
import type { PipelineRun } from '../../../../src/app/pipelineApi';

const SOURCE_ID = 'scraped';
const OUTPUT_ID = 'scraped_trim_abc123';

const sourceTable = {
    kind: 'table' as const,
    id: SOURCE_ID,
    displayId: SOURCE_ID,
    names: ['name'],
    metadata: { name: { type: 'string', levels: [] } },
    rows: [{ name: ' alice ' }],
    contentHash: 'stale-hash',
    virtual: { tableId: SOURCE_ID, rowCount: 1 },
    description: '',
    source: {
        type: 'database' as const,
        connectorId: 'web:sales',
        canRefresh: true,
    },
};

const workspaceOutput = {
    name: OUTPUT_ID,
    row_count: 1,
    columns: [{ name: 'name', type: 'VARCHAR' }],
    sample_rows: [{ name: 'alice' }],
};

function makeAppliedRun(): PipelineRun {
    return {
        id: 'run-refresh-applied',
        workspace_id: 'ws',
        trigger: 'refresh',
        status: 'completed',
        steps: [
            { id: 'refresh', step_type: 'refresh', status: 'completed', params: {} },
            { id: 'profile', step_type: 'profile', status: 'completed', params: {} },
            {
                id: 'clean',
                step_type: 'clean',
                status: 'completed',
                params: {},
                result: {
                    applied: [{ verb: 'trim', output_table: OUTPUT_ID }],
                    output_table: OUTPUT_ID,
                },
            },
        ],
        context: {},
        created_at: '2026-01-01',
    };
}

function makeSkippedRun(): PipelineRun {
    return {
        id: 'run-refresh-skipped',
        workspace_id: 'ws',
        trigger: 'refresh',
        status: 'completed',
        steps: [
            { id: 'refresh', step_type: 'refresh', status: 'completed', params: {} },
            { id: 'profile', step_type: 'profile', status: 'completed', params: {} },
            {
                id: 'clean',
                step_type: 'clean',
                status: 'completed',
                params: {},
                result: { skipped: true, reason: 'no_applicable_clean_verbs' },
            },
        ],
        context: {},
        created_at: '2026-01-01',
    };
}

function makeStore() {
    const store = configureStore({
        reducer: dataFormulatorReducer,
        middleware: (getDefault) => getDefault({ serializableCheck: false }),
    });
    store.dispatch(dfActions.addTableToStore(sourceTable as any));
    return store;
}

function stubRefreshApis() {
    mocks.apiRequest.mockImplementation((url: string) => {
        const path = String(url);
        if (path.includes('refresh-data')) {
            return Promise.resolve({
                data: { row_count: 2, data_changed: true },
            });
        }
        if (path.includes('sample-table')) {
            return Promise.resolve({
                data: { rows: [{ name: 'bob' }, { name: 'cara' }] },
            });
        }
        if (path.includes('list-tables')) {
            return Promise.resolve({ data: { tables: [workspaceOutput] } });
        }
        return Promise.resolve({ data: { statistics: [], result: [] } });
    });
}

describe('afterRefreshHydrate', () => {
    beforeEach(() => {
        mocks.apiRequest.mockReset();
        mocks.triggerRefreshCascade.mockReset();
        stubRefreshApis();
    });

    it('applied + output_table inserts derived and focuses CLEAN output', async () => {
        const store = makeStore();

        await store.dispatch(afterRefreshHydrate(makeAppliedRun(), SOURCE_ID) as any);

        const state = store.getState();
        expect(state.derivedTables.map((t) => t.id)).toEqual([OUTPUT_ID]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: OUTPUT_ID });
        expect(state.derivedTables[0].derive?.trigger.tableId).toBe(SOURCE_ID);
    });

    it('skipped CLEAN stays on source', async () => {
        const store = makeStore();

        await store.dispatch(afterRefreshHydrate(makeSkippedRun(), SOURCE_ID) as any);

        const state = store.getState();
        expect(state.derivedTables).toEqual([]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: SOURCE_ID });
    });
});

describe('hydrateAfterTriggerRefresh', () => {
    beforeEach(() => {
        mocks.apiRequest.mockReset();
        mocks.triggerRefreshCascade.mockReset();
        stubRefreshApis();
    });

    it('awaits trigger-refresh then hydrates CLEAN output', async () => {
        mocks.triggerRefreshCascade.mockResolvedValue(makeAppliedRun());
        const store = makeStore();

        await store.dispatch(hydrateAfterTriggerRefresh({
            sourceTableId: SOURCE_ID,
            tableName: SOURCE_ID,
        }) as any);

        expect(mocks.triggerRefreshCascade).toHaveBeenCalledWith({
            table_name: SOURCE_ID,
            data_changed: true,
        });
        const state = store.getState();
        expect(state.derivedTables.map((t) => t.id)).toEqual([OUTPUT_ID]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: OUTPUT_ID });
    });

    it('cascade failure does not throw and does not insert derived', async () => {
        mocks.triggerRefreshCascade.mockRejectedValue(new Error('cascade failed'));
        const store = makeStore();

        await expect(store.dispatch(hydrateAfterTriggerRefresh({
            sourceTableId: SOURCE_ID,
            tableName: SOURCE_ID,
        }) as any)).resolves.toBeNull();

        const state = store.getState();
        const source = dfSelectors.getAllTables(state).find((t) => t.id === SOURCE_ID);
        expect(state.derivedTables).toEqual([]);
        expect(source?.rows).toEqual([{ name: ' alice ' }]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: SOURCE_ID });
    });
});

describe('useDataRefresh trigger-refresh hydrate', () => {
    let latest: ReturnType<typeof useDataRefresh> | null = null;

    function Probe() {
        latest = useDataRefresh();
        return null;
    }

    afterEach(() => {
        cleanup();
        latest = null;
    });

    beforeEach(() => {
        mocks.apiRequest.mockReset();
        mocks.triggerRefreshCascade.mockReset();
        stubRefreshApis();
    });

    it('manual refresh awaits cascade then hydrates when data changed', async () => {
        mocks.triggerRefreshCascade.mockResolvedValue(makeAppliedRun());
        const store = makeStore();

        render(React.createElement(Provider, { store }, React.createElement(Probe)));

        await act(async () => {
            await latest!.manualRefresh(SOURCE_ID);
        });

        expect(mocks.triggerRefreshCascade).toHaveBeenCalledWith({
            table_name: SOURCE_ID,
            data_changed: true,
        });
        const state = store.getState();
        const source = dfSelectors.getAllTables(state).find((t) => t.id === SOURCE_ID);
        expect(source?.rows).toEqual([{ name: 'bob' }, { name: 'cara' }]);
        expect(state.derivedTables.map((t) => t.id)).toEqual([OUTPUT_ID]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: OUTPUT_ID });
    });

    it('cascade failure keeps the refreshed sample and does not roll back', async () => {
        mocks.triggerRefreshCascade.mockRejectedValue(new Error('cascade failed'));
        const store = makeStore();

        render(React.createElement(Provider, { store }, React.createElement(Probe)));

        await act(async () => {
            await latest!.manualRefresh(SOURCE_ID);
        });

        const state = store.getState();
        const source = dfSelectors.getAllTables(state).find((t) => t.id === SOURCE_ID);
        expect(source?.rows).toEqual([{ name: 'bob' }, { name: 'cara' }]);
        expect(state.derivedTables).toEqual([]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: SOURCE_ID });
    });

    it('skipped CLEAN stays on the refreshed source', async () => {
        mocks.triggerRefreshCascade.mockResolvedValue(makeSkippedRun());
        const store = makeStore();

        render(React.createElement(Provider, { store }, React.createElement(Probe)));

        await act(async () => {
            await latest!.manualRefresh(SOURCE_ID);
        });

        const state = store.getState();
        const source = dfSelectors.getAllTables(state).find((t) => t.id === SOURCE_ID);
        expect(source?.rows).toEqual([{ name: 'bob' }, { name: 'cara' }]);
        expect(state.derivedTables).toEqual([]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: SOURCE_ID });
    });
});
