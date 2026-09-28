import type { ConnectorInstance } from '../components/ComponentType';
import { apiRequest } from './apiClient';
import { deriveConnectorDisplayName } from './connectorNames';
import { findReusableWebConnector, WEB_LOADER_TYPE } from './urlTabWebBind';
import { CONNECTOR_ACTION_URLS, CONNECTOR_URLS } from './utils';

/**
 * Create or reuse a connected `web` instance for this URL.
 * Shared by the leftover URL tab and agent Load of a fetch_url preview.
 */
export async function ensureWebUrlConnector(url: string): Promise<string> {
    const { data: listData } = await apiRequest<{ connectors?: ConnectorInstance[] }>(
        CONNECTOR_URLS.LIST,
        { method: 'GET' },
    );
    const reused = findReusableWebConnector(listData.connectors || [], url);
    if (reused) {
        if (!reused.connected) {
            await apiRequest(CONNECTOR_ACTION_URLS.CONNECT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connector_id: reused.id,
                    params: { url },
                    persist: true,
                }),
            });
        }
        return reused.id;
    }

    const { data: createData } = await apiRequest<{ id: string; connected?: boolean }>(
        CONNECTOR_URLS.CREATE,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                loader_type: WEB_LOADER_TYPE,
                display_name: deriveConnectorDisplayName('Web', { url }),
                icon: WEB_LOADER_TYPE,
                params: { url },
                persist: true,
            }),
        },
    );
    if (!createData.connected) {
        await apiRequest(CONNECTOR_ACTION_URLS.CONNECT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                connector_id: createData.id,
                params: { url },
                persist: true,
            }),
        });
    }
    return createData.id;
}
