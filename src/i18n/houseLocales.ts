/** House locale set from autonomous-developer cross-cutting.md. Native names on the picker. */
export const HOUSE_LOCALE_IDS = [
    'ar',
    'zh',
    'nl',
    'en',
    'fr',
    'de',
    'el',
    'hi',
    'it',
    'ja',
    'ko',
    'pl',
    'pt',
    'ro',
    'ru',
    'es',
    'th',
    'tr',
    'vi',
    'fil',
] as const;

export type HouseLocaleId = (typeof HOUSE_LOCALE_IDS)[number];

export const NATIVE_LANGUAGE_LABELS: Record<string, string> = {
    ar: 'العربية',
    zh: '中文',
    nl: 'Nederlands',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    el: 'Ελληνικά',
    hi: 'हिन्दी',
    it: 'Italiano',
    ja: '日本語',
    ko: '한국어',
    pl: 'Polski',
    pt: 'Português',
    ro: 'Română',
    ru: 'Русский',
    es: 'Español',
    th: 'ไทย',
    tr: 'Türkçe',
    vi: 'Tiếng Việt',
    fil: 'Filipino',
};

export const SHORT_LANGUAGE_LABELS: Record<string, string> = {
    ar: 'AR',
    zh: '中文',
    nl: 'NL',
    en: 'EN',
    fr: 'FR',
    de: 'DE',
    el: 'EL',
    hi: 'HI',
    it: 'IT',
    ja: '日本語',
    ko: '한국어',
    pl: 'PL',
    pt: 'PT',
    ro: 'RO',
    ru: 'RU',
    es: 'ES',
    th: 'TH',
    tr: 'TR',
    vi: 'VI',
    fil: 'FIL',
};

/** i18next / navigator aliases that load the house file. */
export const HOUSE_LOCALE_ALIASES: Record<string, string> = {
    tl: 'fil',
};
