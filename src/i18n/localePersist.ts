const I18N_LNG_KEY = 'i18nextLng';
const LANGUAGE_COMPLETED_KEY = 'datly.languageCompleted';

function readStorage(key: string): string | null {
    try {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key: string, value: string | null): void {
    try {
        if (typeof localStorage === 'undefined') return;
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
    } catch {
        // ignore quota / private mode
    }
}

/** Captured before i18n.init so a detector cache write cannot fake first-run complete. */
export const preInitI18nextLng = readStorage(I18N_LNG_KEY);

/** Detector may persist only after Continue, or when this session already had i18nextLng. */
let armDetectorPersist: (() => void) | undefined;

export function registerArmDetectorPersist(fn: () => void): void {
    armDetectorPersist = fn;
    if (preInitI18nextLng) fn();
}

export function getPreInitI18nextLng(): string | null {
    return preInitI18nextLng;
}

/** Undo a detector / preview write so a kill cannot look like a returning user. */
export function restoreI18nextLngToPreInit(): void {
    writeStorage(I18N_LNG_KEY, preInitI18nextLng);
}

/** Confirmed locale. Next launch can skip the picker; later changeLanguage may cache. */
export function persistI18nextLng(lng: string): void {
    writeStorage(I18N_LNG_KEY, lng);
    armDetectorPersist?.();
}

export function getLanguageCompleted(): boolean {
    return readStorage(LANGUAGE_COMPLETED_KEY) === 'true';
}

export function setLanguageCompleted(done: boolean): void {
    writeStorage(LANGUAGE_COMPLETED_KEY, done ? 'true' : null);
}
