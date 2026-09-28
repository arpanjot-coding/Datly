/**
 * Desktop identity helpers.
 *
 * Application identity is the OS account (`local:<username>`), assigned
 * by the backend and echoed through `/api/app-config`. Client-generated
 * browser UUIDs are not an identity.
 */

export type IdentityType = 'user' | 'browser' | 'local';

export interface Identity {
    type: IdentityType;
    id: string;
    displayName?: string;
    email?: string;
}

export interface UserInfo {
    name: string;
    userId: string;
}

/**
 * Generates a UUID v4.
 * Uses crypto.randomUUID if available, then crypto.getRandomValues, then Math.random.
 */
export function generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    let idx = 0;
    let randomBytes: Uint8Array | null = null;

    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        randomBytes = new Uint8Array(16);
        crypto.getRandomValues(randomBytes);
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = randomBytes
            ? randomBytes[idx++] % 16
            : (Math.random() * 16 | 0);
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Creates the identity key used for state storage on the backend.
 * Format: "{type}:{id}" (e.g., "local:alice").
 */
export function getIdentityKey(identity: Identity): string {
    if (identity.type === 'local' && identity.id.startsWith('local:')) {
        return identity.id;
    }
    return `${identity.type}:${identity.id}`;
}
