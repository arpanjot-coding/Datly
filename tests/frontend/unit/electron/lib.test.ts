import { createRequire } from 'module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
    withDesktopQuery,
    pythonCommand,
    candidateUrls,
    firstReachableUrl,
    resolveRuntime,
    generateLaunchToken,
    backendEnv,
    isLoopbackUrl,
} = require('../../../../electron/lib.cjs') as {
    withDesktopQuery: (url: string) => string;
    pythonCommand: (
        root: string,
        platform?: string,
        resourcesPath?: string,
        packaged?: boolean,
    ) => { command: string; argsPrefix: string[]; missingSidecar?: boolean };
    candidateUrls: (url: string) => string[];
    firstReachableUrl: (urls: string[], probe: (url: string) => Promise<boolean>) => Promise<string | null>;
    resolveRuntime: (opts: {
        env?: NodeJS.ProcessEnv;
        projectRoot?: string;
        probe?: (url: string) => Promise<boolean>;
        packaged?: boolean;
    }) => Promise<{ appUrl: string; healthUrl: string; spawnBackend: boolean }>;
    generateLaunchToken: () => string;
    backendEnv: (opts: {
        env?: NodeJS.ProcessEnv;
        port: number | string;
        launchToken?: string;
        packaged?: boolean;
    }) => NodeJS.ProcessEnv;
    isLoopbackUrl: (url: string) => boolean;
};

describe('electron lib', () => {
    it('adds desktop=1 without dropping other query params', () => {
        expect(withDesktopQuery('http://127.0.0.1:5173/')).toBe('http://127.0.0.1:5173/?desktop=1');
        expect(withDesktopQuery('http://127.0.0.1:5567/?desktop=1')).toBe('http://127.0.0.1:5567/?desktop=1');
        expect(withDesktopQuery('http://127.0.0.1:5173/app?foo=bar')).toBe(
            'http://127.0.0.1:5173/app?foo=bar&desktop=1',
        );
    });

    it('falls back to uv when no venv launcher exists', () => {
        const result = pythonCommand('D:\\missing-venv', 'win32');
        expect(result).toEqual({ command: 'uv', argsPrefix: ['run', 'data_formulator'] });
    });

    it('packaged pythonCommand does not fall back to uv', () => {
        const result = pythonCommand('D:\\missing-venv', 'win32', 'D:\\missing-resources', true);
        expect(result.command).not.toBe('uv');
        expect(result.missingSidecar).toBe(true);
    });

    it('probes both 127.0.0.1 and localhost for the same port', () => {
        const urls = candidateUrls('http://127.0.0.1:5173/');
        expect(urls).toContain('http://127.0.0.1:5173/');
        expect(urls).toContain('http://localhost:5173/');
    });

    it('uses the IPv6-friendly localhost URL when 127.0.0.1 is down', async () => {
        const probe = async (url: string) => url.includes('localhost');
        const runtime = await resolveRuntime({
            env: { DF_ELECTRON_URL: 'http://127.0.0.1:5173' },
            probe,
        });
        expect(runtime.spawnBackend).toBe(false);
        expect(runtime.appUrl).toContain('localhost');
        expect(runtime.appUrl).toContain('desktop=1');
    });

    it('picks the first reachable candidate', async () => {
        const hit = await firstReachableUrl(
            ['http://127.0.0.1:5173/', 'http://localhost:5173/'],
            async (url) => url.includes('localhost'),
        );
        expect(hit).toBe('http://localhost:5173/');
    });

    it('packaged runtime does not attach to a foreign 5567 server', async () => {
        const probe = async (url: string) => url.includes('5567') || url.includes('5173');
        const runtime = await resolveRuntime({
            env: {},
            projectRoot: 'D:\\missing-venv',
            packaged: true,
            probe,
        });
        expect(runtime.spawnBackend).toBe(true);
        expect(runtime.appUrl).not.toContain(':5567');
        expect(runtime.appUrl).not.toContain(':5173');
    });

    it('generates a 256-bit launch token', () => {
        const token = generateLaunchToken();
        expect(token).toMatch(/^[0-9a-f]{64}$/);
        expect(generateLaunchToken()).not.toBe(token);
    });

    it('packaged backend env requires a token and drops DEV_TRUST', () => {
        const env = backendEnv({
            env: { DATA_FORMULATOR_DEV_TRUST: '1', PATH: 'x' },
            port: 6000,
            launchToken: 'abc',
            packaged: true,
        });
        expect(env.DATA_FORMULATOR_LAUNCH_TOKEN).toBe('abc');
        expect(env.DATA_FORMULATOR_PACKAGED).toBe('1');
        expect(env.DATA_FORMULATOR_DEV_TRUST).toBeUndefined();
        expect(env.DATA_FORMULATOR_PORT).toBe('6000');
    });

    it('allows loopback navigation and rejects foreign hosts', () => {
        expect(isLoopbackUrl('http://127.0.0.1:5567/')).toBe(true);
        expect(isLoopbackUrl('file:///tmp/loading.html')).toBe(true);
        expect(isLoopbackUrl('https://evil.example')).toBe(false);
    });
});
