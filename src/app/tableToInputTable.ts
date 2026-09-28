import type { DictTable, InputTable } from '../components/ComponentType';

/**
 * Persist a Redux table as an InputTable for session save.
 * connectorId → source.kind connector. Gzip / extract leftovers stay workspace.
 */
export function toInputTable(table: DictTable): InputTable {
    return {
        kind: 'input-table',
        id: table.id,
        displayId: table.displayId,
        source: table.source?.connectorId
            ? {
                kind: 'connector',
                connectorId: table.source.connectorId,
                sourceTable: {
                    id: table.source.originalTableName || table.id,
                    name: table.source.originalTableName || table.displayId,
                },
                path: [],
                workspaceTableId: table.virtual?.tableId || table.id,
            }
            : { kind: 'workspace', tableId: table.virtual?.tableId || table.id },
        snapshot: {
            columns: table.names.map(name => {
                const {
                    semanticType: _semanticType,
                    intrinsicDomain: _intrinsicDomain,
                    unit: _unit,
                    displayName: _displayName,
                    ...physical
                } = table.metadata[name] as any;
                return { name, ...physical };
            }),
            rowCount: table.virtual?.rowCount ?? table.rows.length,
            capturedAt: Date.now(),
            ...(table.contentHash ? { contentHash: table.contentHash } : {}),
        },
        description: table.description || '',
        ...(table.source ? { sourceConfig: table.source } : {}),
        addedAt: Date.now(),
    };
}
