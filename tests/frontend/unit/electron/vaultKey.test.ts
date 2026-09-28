import { createRequire } from 'module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { generateFernetKey, loadOrCreateVaultKey } = require('../../../../electron/vaultKey.cjs') as {
    generateFernetKey: () => string;
    loadOrCreateVaultKey: (opts: {
        userData: string;
        isEncryptionAvailable?: () => boolean;
        encryptString?: (value: string) => Buffer;
        decryptString?: (value: Buffer) => string;
    }) => string;
};

describe('vault key persistence', () => {
    it('generates a 32-byte url-safe key', () => {
        const key = generateFernetKey();
        const raw = Buffer.from(key, 'base64url');
        expect(raw.length).toBe(32);
    });

    it('round-trips an encrypted key when OS encryption is available', () => {
        const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'datly-vault-'));
        const first = loadOrCreateVaultKey({
            userData,
            isEncryptionAvailable: () => true,
            encryptString: (value) => Buffer.from(`enc:${value}`),
            decryptString: (value) => value.toString('utf8').slice(4),
        });
        const second = loadOrCreateVaultKey({
            userData,
            isEncryptionAvailable: () => true,
            encryptString: (value) => Buffer.from(`enc:${value}`),
            decryptString: (value) => value.toString('utf8').slice(4),
        });
        expect(second).toBe(first);
    });
});
