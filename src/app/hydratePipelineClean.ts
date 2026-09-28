/**
 * Hydrate a pipeline CLEAN write into Redux as a kebab-shaped derive.
 * Do not fork applyCleanVerb; reuse insertDerivedTables + concepts + focus.
 */

import { DictTable } from '../components/ComponentType';
import { apiRequest } from './apiClient';
import { runPipeline, type PipelineRun } from './pipelineApi';
import {
    DataFormulatorState,
    dfActions,
    dfSelectors,
    fetchColumnStats,
    fetchFieldSemanticType,
    getDataFieldItems,
} from './dfSlice';
import { computeContentHash, getUrls } from './utils';

function findCleanStepResult(run: PipelineRun): Record<string, unknown> | undefined {
    const step = [...(run.steps || [])].reverse().find(s => s.step_type === 'clean');
    return step?.result;
}

function cleanWasApplied(result: Record<string, unknown>): boolean {
    if (result.skipped) return false;
    const applied = result.applied;
    if (Array.isArray(applied)) return applied.length > 0;
    return Boolean(applied);
}

export function hydratePipelineClean(run: PipelineRun, sourceTableId: string) {
    return async (
        dispatch: (action: unknown) => unknown,
        getState: () => DataFormulatorState,
    ): Promise<DictTable | null> => {
        const result = findCleanStepResult(run);
        if (!result || result.skipped || !cleanWasApplied(result)) {
            return null;
        }

        const outputName = typeof result.output_table === 'string' ? result.output_table : '';
        if (!outputName) {
            return null;
        }

        const tables = dfSelectors.getAllTables(getState());
        const sourceTable = tables.find(
            t => t.id === sourceTableId || t.virtual?.tableId === sourceTableId,
        );
        if (!sourceTable) {
            return null;
        }
        if (outputName === sourceTable.id || outputName === sourceTable.virtual?.tableId) {
            return null;
        }

        const { data: listData } = await apiRequest<{ tables: any[] }>(getUrls().LIST_TABLES, {
            method: 'GET',
        });
        const wsTable = (listData?.tables || []).find((t: { name?: string }) => t.name === outputName);
        if (!wsTable) {
            return null;
        }

        const { buildDictTableFromWorkspace } = await import('./tableThunks');
        const listed = buildDictTableFromWorkspace(wsTable, undefined);
        const derived: DictTable = {
            kind: 'table',
            id: outputName,
            displayId: listed.displayId || outputName,
            names: listed.names,
            metadata: listed.metadata,
            rows: listed.rows,
            description: listed.description || '',
            derive: {
                source: [sourceTable.id],
                code: '# pipeline_clean',
                outputVariable: 'df_clean',
                dialog: [],
                trigger: {
                    tableId: sourceTable.id,
                    resultTableId: outputName,
                    source: 'user',
                },
            },
            virtual: {
                tableId: outputName,
                rowCount: listed.virtual?.rowCount ?? listed.rows?.length ?? 0,
            },
            parentNodeId: sourceTable.id,
            contentHash: computeContentHash(listed.rows || [], listed.names),
            // listed.source may set canRefresh from source_metadata. Derived
            // CLEAN parquet must not inherit scrape refresh.
            source: undefined,
        };

        dispatch(dfActions.insertDerivedTables(derived));
        dispatch(dfActions.addConceptItems(getDataFieldItems(derived)));
        dispatch(dfActions.setFocused({ type: 'table', tableId: derived.id }));
        dispatch(fetchColumnStats(derived));
        dispatch(fetchFieldSemanticType(derived));
        return derived;
    };
}

export function applyAllSafeClean(args: { tableId: string; workspaceTableName: string }) {
    return async (
        dispatch: (action: unknown) => any,
        getState: () => DataFormulatorState,
    ) => {
        const run = await runPipeline({
            trigger: 'manual',
            table_name: args.workspaceTableName,
            steps: [
                { step_type: 'clean', params: { source_table: args.workspaceTableName, auto_safe_only: true } },
            ],
        });
        return hydratePipelineClean(run, args.tableId)(dispatch, getState);
    };
}
