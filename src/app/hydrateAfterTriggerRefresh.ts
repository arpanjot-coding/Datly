/**
 * After connector refresh, reuse the load CLEAN hydrate rule.
 * Cascade failure must not roll back an already-refreshed parquet sample.
 */

import { DictTable } from '../components/ComponentType';
import { DataFormulatorState } from './dfSlice';
import { hydratePipelineClean } from './hydratePipelineClean';
import { triggerRefreshCascade, type PipelineRun } from './pipelineApi';

export function afterRefreshHydrate(run: PipelineRun, sourceTableId: string) {
    return hydratePipelineClean(run, sourceTableId);
}

export function hydrateAfterTriggerRefresh(args: {
    sourceTableId: string;
    tableName: string;
}) {
    return async (
        dispatch: (action: unknown) => unknown,
        getState: () => DataFormulatorState,
    ): Promise<DictTable | null> => {
        try {
            const run = await triggerRefreshCascade({
                table_name: args.tableName,
                data_changed: true,
            });
            return afterRefreshHydrate(run, args.sourceTableId)(dispatch, getState);
        } catch {
            return null;
        }
    };
}
