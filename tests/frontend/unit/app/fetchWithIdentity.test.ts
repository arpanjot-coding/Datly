/**
 * Tests for fetchWithIdentity — launch token and workspace headers.
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('../../../../src/app/store', () => ({
    store: {
        getState: vi.fn(() => ({
            identity: { type: 'local', id: 'alice' },
            activeWorkspace: null,
            serverConfig: { WORKSPACE_BACKEND: 'local' },
        })),
    },
}));

vi.mock('../../../../src/app/desktop', () => ({
    getLaunchToken: vi.fn(() => ''),
    isDesktopRuntime: vi.fn(() => false),
}));

vi.mock('../../../../src/i18n', () => ({
    default: { language: 'en' },
}));

import { fetchWithIdentity } from '../../../../src/app/utils';
import { store } from '../../../../src/app/store';
import { getLaunchToken } from '../../../../src/app/desktop';

function mockFetchResponse(status: number, body: any = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

beforeEach(() => {
    vi.restoreAllMocks();
    (getLaunchToken as Mock).mockReturnValue('');
    globalThis.fetch = vi.fn(async () => mockFetchResponse(200));
});

describe('fetchWithIdentity', () => {
    it('attaches the Electron launch token when present', async () => {
        (getLaunchToken as Mock).mockReturnValue('launch-token-abc');

        await fetchWithIdentity('/api/test');

        const headers = (globalThis.fetch as Mock).mock.calls[0][1].headers as Headers;
        expect(headers.get('X-Datly-Launch-Token')).toBe('launch-token-abc');
    });

    it('does not attach a launch token when the desktop shell is absent', async () => {
        await fetchWithIdentity('/api/test');

        const headers = (globalThis.fetch as Mock).mock.calls[0][1].headers as Headers;
        expect(headers.has('X-Datly-Launch-Token')).toBe(false);
    });

    it('does not send a client identity header', async () => {
        await fetchWithIdentity('/api/test');

        const headers = (globalThis.fetch as Mock).mock.calls[0][1].headers as Headers;
        expect(headers.has('X-Identity-Id')).toBe(false);
    });

    it('preserves an explicit workspace instead of the active workspace', async () => {
        (store.getState as Mock).mockReturnValue({
            identity: { type: 'local', id: 'alice' },
            activeWorkspace: { id: 'workspace-a', displayName: 'Workspace A' },
            serverConfig: { WORKSPACE_BACKEND: 'local' },
        });

        await fetchWithIdentity('/api/test', {
            headers: { 'X-Workspace-Id': 'workspace-b' },
        });

        const headers = (globalThis.fetch as Mock).mock.calls[0][1].headers as Headers;
        expect(headers.get('X-Workspace-Id')).toBe('workspace-b');
    });

    it('should not modify headers for non-API URLs', async () => {
        await fetchWithIdentity('/static/file.js');

        const callArgs = (globalThis.fetch as Mock).mock.calls[0];
        expect(callArgs[1]?.headers).toBeUndefined();
    });

    it('returns 401 without retrying', async () => {
        (globalThis.fetch as Mock).mockResolvedValue(mockFetchResponse(401));

        const resp = await fetchWithIdentity('/api/data');

        expect(resp.status).toBe(401);
        expect(globalThis.fetch).toHaveBeenCalledOnce();
    });
});
