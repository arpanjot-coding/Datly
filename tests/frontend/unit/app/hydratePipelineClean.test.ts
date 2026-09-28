import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
    apiRequest: vi.fn(),
    runPipeline: vi.fn(),
    deleteTablesFromWorkspace: vi.fn(),
}));

vi.mock('../../../../src/app/apiClient', () => ({
    apiRequest: mocks.apiRequest,
    ApiRequestError: class ApiRequestError extends Error {},
}));

vi.mock('../../../../src/app/pipelineApi', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../../src/app/pipelineApi')>();
    return { ...actual, runPipeline: mocks.runPipeline };
});

vi.mock('../../../../src/app/workspaceService', () => ({
    deleteTablesFromWorkspace: mocks.deleteTablesFromWorkspace,
}));

import { dataFormulatorReducer, dfActions } from '../../../../src/app/dfSlice';
import {
    applyAllSafeClean,
    hydratePipelineClean,
} from '../../../../src/app/hydratePipelineClean';
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
    virtual: { tableId: SOURCE_ID, rowCount: 1 },
    description: '',
};

const workspaceOutput = {
    name: OUTPUT_ID,
    row_count: 1,
    columns: [{ name: 'name', type: 'VARCHAR' }],
    sample_rows: [{ name: 'alice' }],
};

function makeAppliedRun(): PipelineRun {
    return {
        id: 'run-applied',
        workspace_id: 'ws',
        trigger: 'load',
        status: 'completed',
        steps: [
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
        id: 'run-skipped',
        workspace_id: 'ws',
        trigger: 'load',
        status: 'completed',
        steps: [
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

function stubListTables() {
    mocks.apiRequest.mockImplementation((url: string) => {
        if (String(url).includes('list-tables')) {
            return Promise.resolve({ data: { tables: [workspaceOutput] } });
        }
        return Promise.resolve({ data: { statistics: [], result: [] } });
    });
}

describe('hydratePipelineClean', () => {
    beforeEach(() => {
        mocks.apiRequest.mockReset();
        mocks.runPipeline.mockReset();
        mocks.deleteTablesFromWorkspace.mockReset();
        stubListTables();
    });

    it('applied + output_table inserts derived, sets focus to output, lineage trigger.tableId is source', async () => {
        const store = makeStore();

        await store.dispatch(hydratePipelineClean(makeAppliedRun(), SOURCE_ID) as any);

        const state = store.getState();
        expect(state.inputTables.map((t) => t.id)).toEqual([SOURCE_ID]);
        expect(state.derivedTables.map((t) => t.id)).toEqual([OUTPUT_ID]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: OUTPUT_ID });
        expect(state.derivedTables[0].derive?.trigger.tableId).toBe(SOURCE_ID);
        expect(state.derivedTables[0].virtual.tableId).toBe(OUTPUT_ID);
        expect(state.derivedTables[0].source).toBeUndefined();
        expect(state.derivedTables[0].source?.canRefresh).not.toBe(true);
    });

    it('skipped stays on source (no insert)', async () => {
        const store = makeStore();
        expect(store.getState().focusedId).toEqual({ type: 'table', tableId: SOURCE_ID });

        await store.dispatch(hydratePipelineClean(makeSkippedRun(), SOURCE_ID) as any);

        const state = store.getState();
        expect(state.derivedTables).toEqual([]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: SOURCE_ID });
        expect(mocks.apiRequest).not.toHaveBeenCalled();
    });

    it('applyAllSafe path uses the helper after runPipeline', async () => {
        mocks.runPipeline.mockResolvedValue(makeAppliedRun());
        const store = makeStore();

        await store.dispatch(applyAllSafeClean({
            tableId: SOURCE_ID,
            workspaceTableName: SOURCE_ID,
        }) as any);

        expect(mocks.runPipeline).toHaveBeenCalledWith({
            trigger: 'manual',
            table_name: SOURCE_ID,
            steps: [
                { step_type: 'clean', params: { source_table: SOURCE_ID, auto_safe_only: true } },
            ],
        });
        const state = store.getState();
        expect(state.derivedTables.map((t) => t.id)).toEqual([OUTPUT_ID]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: OUTPUT_ID });
        expect(state.derivedTables[0].derive?.trigger.tableId).toBe(SOURCE_ID);
    });
});

describe('Unref-GC focused CLEAN output', () => {
    beforeEach(() => {
        mocks.deleteTablesFromWorkspace.mockReset();
    });

    it('does not delete a just-focused derived table', () => {
        const derived = {
            ...sourceTable,
            id: OUTPUT_ID,
            displayId: OUTPUT_ID,
            virtual: { tableId: OUTPUT_ID, rowCount: 1 },
            derive: {
                source: [SOURCE_ID],
                code: '# pipeline_clean',
                outputVariable: 'df_clean',
                dialog: [],
                trigger: { tableId: SOURCE_ID, resultTableId: OUTPUT_ID, source: 'user' as const },
            },
        };

        let state = dataFormulatorReducer(undefined, dfActions.addTableToStore(sourceTable as any));
        state = dataFormulatorReducer(state, dfActions.insertDerivedTables(derived as any));
        state = dataFormulatorReducer(state, dfActions.setFocused({ type: 'table', tableId: OUTPUT_ID }));
        state = dataFormulatorReducer(state, dfActions.addChart({
            id: 'chart-source',
            chartType: 'Bar Chart',
            tableRef: SOURCE_ID,
            source: 'user',
            encodingMap: {},
        } as any));

        state = dataFormulatorReducer(state, dfActions.deleteChartById('chart-source'));

        expect(state.derivedTables.map((t) => t.id)).toEqual([OUTPUT_ID]);
        expect(state.focusedId).toEqual({ type: 'table', tableId: OUTPUT_ID });
    });
});
