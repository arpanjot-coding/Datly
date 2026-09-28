/**
 * Grid clean verbs: compile+sign+sandbox on the server, then insert one derived table.
 * Params only. Never send client Python. No model gate.
 */

import { DictTable } from '../components/ComponentType';
import { Type } from '../data/types';
import { inferTypeFromValueArray, refineTemporalType } from '../data/utils';
import { apiRequest } from './apiClient';
import {
    DataFormulatorState,
    dfActions,
    dfSelectors,
    getDataFieldItems,
} from './dfSlice';
import type { AppDispatch } from './store';
import { computeContentHash, getUrls } from './utils';

export const CLEAN_VERBS = [
    'rename',
    'split',
    'replace',
    'trim',
    'fill',
    'drop',
    'dedupe',
    'cast',
    'first_row_header',
    'keep_rows',
    'remove_rows',
] as const;

export type CleanVerb = (typeof CLEAN_VERBS)[number];

/** Cast targets from the app Type enum (not TypeList, which omits boolean/integer/duration). */
export const CLEAN_CAST_TYPES: Type[] = [
    Type.String,
    Type.Boolean,
    Type.Integer,
    Type.Number,
    Type.Date,
    Type.DateTime,
    Type.Time,
    Type.Duration,
];

export const MAX_CLEAN_ROW_KEYS = 2000;

export interface CompileCleanStepResponse {
    code: string;
    code_signature: string;
    output_variable: string;
    names: string[];
    rows: any[];
    virtual?: {
        table_name?: string;
        row_count?: number;
    };
}

export interface CleanStepRequestBody {
    verb: CleanVerb;
    params: Record<string, unknown>;
    source_table: string;
    output_table_name: string;
}

export function uniqueCleanTableName(base: string, existing: Iterable<string>): string {
    const set = existing instanceof Set ? existing : new Set(existing);
    let name = base;
    let n = 1;
    while (set.has(name)) {
        name = `${base}_${n}`;
        n += 1;
    }
    return name;
}

export function suggestCleanOutputName(sourceId: string, verb: CleanVerb): string {
    const stem = sourceId.replace(/\.[^.]+$/, '').replace(/[^\w]+/g, '_') || 'table';
    return `${stem}_${verb}`;
}

export function workspaceTableName(table: DictTable): string {
    return table.virtual?.tableId || table.id;
}

export function buildCleanStepRequest(
    verb: CleanVerb,
    params: Record<string, unknown>,
    sourceTable: string,
    outputTableName: string,
): CleanStepRequestBody {
    return {
        verb,
        params,
        source_table: sourceTable,
        output_table_name: outputTableName,
    };
}

export function lineageHasFirstRowHeader(table: DictTable, tables: DictTable[]): boolean {
    const byId = new Map(tables.map(item => [item.id, item]));
    const seen = new Set<string>();
    let current: DictTable | undefined = table;
    while (current && !seen.has(current.id)) {
        seen.add(current.id);
        const code = current.derive?.code || '';
        if (code.includes('# clean_step: first_row_header')) return true;
        if (current.derive?.outputVariable === 'df_first_row_header') return true;
        const parentId: string | undefined = current.derive?.trigger?.tableId || current.parentNodeId;
        current = parentId ? byId.get(parentId) : undefined;
    }
    return false;
}

function metadataFromRows(names: string[], rows: any[]): DictTable['metadata'] {
    return names.reduce((acc, name) => {
        const colValues = rows.map(r => r?.[name]);
        const inferred = inferTypeFromValueArray(colValues);
        acc[name] = {
            type: refineTemporalType(colValues, inferred),
            levels: [],
        };
        return acc;
    }, {} as DictTable['metadata']);
}

export function buildDerivedCleanTable(args: {
    sourceTable: DictTable;
    outputId: string;
    response: CompileCleanStepResponse;
}): DictTable {
    const { sourceTable, outputId, response } = args;
    const rows = Array.isArray(response.rows) ? response.rows : [];
    const names = (response.names && response.names.length > 0)
        ? response.names.map(n => String(n))
        : (rows[0] ? Object.keys(rows[0]).filter(k => k !== '#rowId') : []);
    const written = response.virtual?.table_name || outputId;
    const rowCount = response.virtual?.row_count ?? rows.length;

    return {
        kind: 'table',
        id: written,
        displayId: written,
        names,
        rows,
        metadata: metadataFromRows(names, rows),
        derive: {
            source: [sourceTable.id],
            code: response.code,
            codeSignature: response.code_signature,
            outputVariable: response.output_variable,
            dialog: [],
            trigger: {
                tableId: sourceTable.id,
                resultTableId: written,
                source: 'user',
            },
        },
        virtual: {
            tableId: written,
            rowCount,
        },
        description: '',
        parentNodeId: sourceTable.id,
        contentHash: computeContentHash(rows, names),
    };
}

export interface ApplyCleanVerbArgs {
    tableId: string;
    verb: CleanVerb;
    params?: Record<string, unknown>;
}

export function applyCleanVerb(args: ApplyCleanVerbArgs) {
    return async (dispatch: AppDispatch, getState: () => DataFormulatorState): Promise<DictTable> => {
        const tables = dfSelectors.getAllTables(getState());
        const sourceTable = tables.find(t => t.id === args.tableId);
        if (!sourceTable) {
            throw new Error('Source table is not loaded');
        }

        const existing = tables.flatMap(t => [t.id, t.virtual?.tableId]).filter((id): id is string => !!id);
        const outputTableName = uniqueCleanTableName(
            suggestCleanOutputName(sourceTable.id, args.verb),
            existing,
        );
        const body = buildCleanStepRequest(
            args.verb,
            args.params || {},
            workspaceTableName(sourceTable),
            outputTableName,
        );

        const { data } = await apiRequest<CompileCleanStepResponse>(getUrls().COMPILE_CLEAN_STEP, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!data?.code || !data.code_signature || !data.output_variable) {
            throw new Error('Clean step did not return signed code');
        }

        const derived = buildDerivedCleanTable({
            sourceTable,
            outputId: outputTableName,
            response: data,
        });

        dispatch(dfActions.insertDerivedTables(derived));
        dispatch(dfActions.addConceptItems(getDataFieldItems(derived)));
        dispatch(dfActions.setFocused({ type: 'table', tableId: derived.id }));
        return derived;
    };
}
