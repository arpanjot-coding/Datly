import type { DataSourceConfig } from '../components/ComponentType';
import type { SourceTableRef } from './utils';

/** Registry key for POST /api/connectors. */
export const WEB_LOADER_TYPE = 'web';

/** LIST payload `source_type` for a `web` instance. */
export const WEB_LOADER_CLASS_NAME = 'WebDataLoader';

export interface WebUrlTableBind {
    source: DataSourceConfig;
    sourceTableRef: SourceTableRef;
}

export interface WebCatalogNodeLike {
    name?: string;
    node_type?: string;
    metadata?: {
        _source_name?: string;
        dataset_id?: string | number;
        sample_rows?: unknown[];
        columns?: Array<{ name?: string } | string>;
    };
}

export function isWebConnector(connector: {
    id?: string;
    source_type?: string;
}): boolean {
    const sourceType = connector.source_type || '';
    const id = connector.id || '';
    return (
        sourceType === WEB_LOADER_CLASS_NAME
        || sourceType === WEB_LOADER_TYPE
        || id === WEB_LOADER_TYPE
        || id.startsWith(`${WEB_LOADER_TYPE}:`)
    );
}

export function normalizeWebUrl(url: string, origin?: string): string {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('/') && origin) {
        return `${origin.replace(/\/$/, '')}${trimmed}`;
    }
    return trimmed;
}

export function urlsMatchForWebReuse(
    left: string,
    right: string,
    origin?: string,
): boolean {
    const a = normalizeWebUrl(left, origin).replace(/\/$/, '');
    const b = normalizeWebUrl(right, origin).replace(/\/$/, '');
    return a.length > 0 && a === b;
}

export function findReusableWebConnector<T extends {
    id: string;
    source_type?: string;
    pinned_params?: Record<string, string>;
}>(connectors: T[], url: string, origin?: string): T | undefined {
    return connectors.find((connector) => (
        isWebConnector(connector)
        && urlsMatchForWebReuse(connector.pinned_params?.url || '', url, origin)
    ));
}

/**
 * New URL-tab ingest stamp. Always a refreshable connector table.
 * Do not use `url` or `stream` on this path.
 */
export function buildWebUrlTableSource(args: {
    connectorId: string;
    tableId: string;
    tableName?: string;
}): WebUrlTableBind {
    const tableId = args.tableId;
    const tableName = args.tableName || tableId;
    return {
        source: {
            type: 'database',
            connectorId: args.connectorId,
            databaseTable: tableId,
            canRefresh: true,
        },
        sourceTableRef: {
            id: tableId,
            name: tableName,
        },
    };
}

export function catalogNodeToSourceTableRef(node: WebCatalogNodeLike): SourceTableRef {
    const name = String(node.metadata?._source_name || node.name || 'table');
    const id = node.metadata?.dataset_id != null
        ? String(node.metadata.dataset_id)
        : name;
    return { id, name };
}

export function catalogColumnNames(node: WebCatalogNodeLike): string[] {
    const cols = node.metadata?.columns;
    if (!Array.isArray(cols)) return [];
    return cols
        .map((col) => (typeof col === 'string' ? col : col?.name || ''))
        .filter(Boolean);
}

export function bindWebUrlCatalogNodes(
    connectorId: string,
    nodes: WebCatalogNodeLike[],
): Array<{
    bind: WebUrlTableBind;
    rows: Record<string, unknown>[];
    columnNames: string[];
}> {
    return nodes
        .filter((node) => !node.node_type || node.node_type === 'table')
        .map((node) => {
            const ref = catalogNodeToSourceTableRef(node);
            return {
                bind: buildWebUrlTableSource({
                    connectorId,
                    tableId: ref.id,
                    tableName: ref.name,
                }),
                rows: Array.isArray(node.metadata?.sample_rows)
                    ? node.metadata.sample_rows as Record<string, unknown>[]
                    : [],
                columnNames: catalogColumnNames(node),
            };
        });
}
