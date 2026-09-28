/**
 * Connector vs workspace lifetime for scrape refresh.
 * A saved canRefresh stamp is not enough: the web: instance must still exist.
 * Derived CLEAN parquet does not inherit scrape refresh.
 */

import type { DataSourceConfig, InputTable } from '../components/ComponentType';

export interface RefreshProvenanceOptions {
    connectorsEnabled?: boolean;
    isDerived?: boolean;
}

export function liveConnectorIdsFromList(
    data: { connectors?: Array<{ id?: string }> } | null | undefined,
): string[] | null {
    if (!Array.isArray(data?.connectors)) return null;
    return data.connectors
        .map((connector) => connector?.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

export function isScrapeRefreshable(
    sourceConfig: DataSourceConfig | undefined,
    liveConnectorIds: Iterable<string>,
    options?: RefreshProvenanceOptions,
): boolean {
    if (options?.isDerived) return false;
    if (options?.connectorsEnabled === false) return false;
    if (!sourceConfig || sourceConfig.type !== 'database') return false;
    if (sourceConfig.canRefresh !== true) return false;
    const connectorId = sourceConfig.connectorId;
    if (!connectorId) return false;
    const live = liveConnectorIds instanceof Set
        ? liveConnectorIds
        : new Set(
            liveConnectorIds != null && typeof liveConnectorIds !== 'string' && Symbol.iterator in Object(liveConnectorIds)
                ? liveConnectorIds
                : [],
        );
    return live.has(connectorId);
}

export function applyRefreshProvenance(
    sourceConfig: DataSourceConfig | undefined,
    liveConnectorIds: Iterable<string>,
    options?: RefreshProvenanceOptions,
): DataSourceConfig | undefined {
    if (!sourceConfig) return undefined;
    if (sourceConfig.type !== 'database' && !sourceConfig.connectorId) {
        return sourceConfig;
    }
    if (isScrapeRefreshable(sourceConfig, liveConnectorIds, options)) {
        return sourceConfig;
    }
    if (sourceConfig.canRefresh) {
        return { ...sourceConfig, canRefresh: false };
    }
    return sourceConfig;
}

export function applyRefreshProvenanceToInputTables(
    inputTables: InputTable[],
    liveConnectorIds: Iterable<string>,
    options?: RefreshProvenanceOptions,
): InputTable[] {
    return inputTables.map((table) => {
        const sourceConfig = applyRefreshProvenance(
            table.sourceConfig,
            liveConnectorIds,
            { ...options, isDerived: false },
        );
        if (sourceConfig === table.sourceConfig) return table;
        return { ...table, sourceConfig };
    });
}
