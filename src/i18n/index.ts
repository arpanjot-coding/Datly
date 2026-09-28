import {
    preInitI18nextLng,
    registerArmDetectorPersist,
    restoreI18nextLngToPreInit,
} from './localePersist';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { HOUSE_LOCALE_IDS } from './houseLocales';
import {
    ar,
    de,
    el,
    en,
    es,
    fil,
    fr,
    hi,
    it,
    ja,
    ko,
    nl,
    pl,
    pt,
    ro,
    ru,
    th,
    tr,
    vi,
    zh,
} from './locales';

// localePersist is imported first so preInitI18nextLng snapshots localStorage
// before LanguageDetector caches a navigator guess.

// NOTE: locale JSON is ingested into the i18next store once, here, at init().
// Adding keys to a locale file requires a full page reload (not just HMR) for
// the running app to pick them up, since HMR won't re-run this init().
export const LISTED_LANGUAGES = HOUSE_LOCALE_IDS;

const resources = {
    ar: { translation: ar },
    zh: { translation: zh },
    nl: { translation: nl },
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    el: { translation: el },
    hi: { translation: hi },
    it: { translation: it },
    ja: { translation: ja },
    ko: { translation: ko },
    pl: { translation: pl },
    pt: { translation: pt },
    ro: { translation: ro },
    ru: { translation: ru },
    es: { translation: es },
    th: { translation: th },
    tr: { translation: tr },
    vi: { translation: vi },
    fil: { translation: fil },
    tl: { translation: fil },
};

function applyDocumentLang(lng?: string): void {
    if (typeof document === 'undefined') return;
    const lang = (lng || i18n.language || 'en').split('-')[0];
    document.documentElement.lang = lang;
    document.documentElement.dir = i18n.dir(lang);
}

function enableDetectorPersist(): void {
    const detector = i18n.services?.languageDetector as
        | { options?: { caches?: string[] } }
        | undefined;
    if (!detector?.options) return;
    detector.options.caches = ['localStorage'];
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: [...LISTED_LANGUAGES, 'tl'],
        nonExplicitSupportedLngs: true,
        load: 'languageOnly',
        returnNull: false,
        returnEmptyString: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            // Empty until Continue (or a returning pre-init snapshot).
            caches: [],
        },
    })
    .then(() => {
        applyDocumentLang();
        if (preInitI18nextLng) enableDetectorPersist();
        else restoreI18nextLngToPreInit();
    });

registerArmDetectorPersist(enableDetectorPersist);

i18n.on('languageChanged', (lng) => {
    applyDocumentLang(lng);
});

export { preInitI18nextLng };
export default i18n;
