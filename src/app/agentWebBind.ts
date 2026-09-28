import type { SourceTableRef } from './utils';
import {
    buildWebUrlTableSource,
    catalogNodeToSourceTableRef,
    type WebCatalogNodeLike,
    type WebUrlTableBind,
} from './urlTabWebBind';

export type PendingTableLoadBind =
    | { mode: 'extract' }
    | { mode: 'web'; url: string };

export function resolvePendingTableLoadBind(
    pending: { sourceUrl?: string },
    connectorsEnabled: boolean,
): PendingTableLoadBind {
    const url = (pending.sourceUrl || '').trim();
    if (connectorsEnabled && url) {
        return { mode: 'web', url };
    }
    return { mode: 'extract' };
}

export function successfulFetchUrlFromToolResult(event: {
    tool?: string;
    url?: string;
    error?: unknown;
}): string | undefined {
    if (event.tool !== 'fetch_url') return undefined;
    const url = typeof event.url === 'string' ? event.url.trim() : '';
    if (!url || event.error) return undefined;
    return url;
}

export function stemTableIdFromUrl(url: string, fallback: string): string {
    try {
        const parsed = new URL(url);
        const last = decodeURIComponent(
            parsed.pathname.split('/').filter(Boolean).pop() || '',
        );
        if (!last) return fallback;
        const stem = last.includes('.') ? last.replace(/\.[^.]+$/, '') : last;
        return stem || fallback;
    } catch {
        return fallback;
    }
}

export function pickWebCatalogTableForPending(
    pendingName: string,
    nodes: WebCatalogNodeLike[],
    url?: string,
): SourceTableRef {
    const tables = nodes.filter((node) => !node.node_type || node.node_type === 'table');
    const match = tables.find((node) => {
        const ref = catalogNodeToSourceTableRef(node);
        return ref.id === pendingName || ref.name === pendingName;
    });
    if (match) return catalogNodeToSourceTableRef(match);
    if (tables[0]) return catalogNodeToSourceTableRef(tables[0]);
    const stem = url ? stemTableIdFromUrl(url, pendingName) : pendingName;
    return { id: stem || pendingName, name: pendingName };
}

export function buildPendingWebTableBind(args: {
    connectorId: string;
    pendingName: string;
    displayName?: string;
    url?: string;
    catalogNodes?: WebCatalogNodeLike[];
}): WebUrlTableBind {
    const displayName = args.displayName || args.pendingName;
    const ref = pickWebCatalogTableForPending(
        args.pendingName,
        args.catalogNodes || [],
        args.url,
    );
    return buildWebUrlTableSource({
        connectorId: args.connectorId,
        tableId: ref.id,
        tableName: displayName,
    });
}
