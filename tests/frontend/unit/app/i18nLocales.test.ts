import { describe, expect, it } from "vitest";

import {
  HOUSE_LOCALE_IDS,
  NATIVE_LANGUAGE_LABELS,
  type HouseLocaleId,
} from "../../../../src/i18n/houseLocales";
import { LISTED_LANGUAGES } from "../../../../src/i18n/index";
import {
  ar,
  de,
  el,
  en,
  es,
  fil,
  fr,
  hi,
  it as itBundle,
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
} from "../../../../src/i18n/locales";

type TranslationValue =
  | string
  | TranslationValue[]
  | { [key: string]: TranslationValue };
type TranslationMap = Record<string, TranslationValue>;

function collectKeys(value: TranslationMap, prefix = ""): Set<string> {
  const keys = new Set<string>();

  for (const [key, child] of Object.entries(value)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string") {
      keys.add(nextPrefix);
    } else if (Array.isArray(child)) {
      continue;
    } else {
      for (const childKey of collectKeys(child, nextPrefix)) {
        keys.add(childKey);
      }
    }
  }

  return keys;
}

const bundles: Record<HouseLocaleId, TranslationMap> = {
  ar,
  zh,
  nl,
  en,
  fr,
  de,
  el,
  hi,
  it: itBundle,
  ja,
  ko,
  pl,
  pt,
  ro,
  ru,
  es,
  th,
  tr,
  vi,
  fil,
};

describe("i18n locale bundles", () => {
  const englishKeys = collectKeys(en);

  for (const id of HOUSE_LOCALE_IDS) {
    it(`keeps ${id} string-leaf keys aligned with English`, () => {
      expect(collectKeys(bundles[id])).toEqual(englishKeys);
    });
  }

  it("lists picker languages as HOUSE_LOCALE_IDS", () => {
    expect(LISTED_LANGUAGES).toEqual(HOUSE_LOCALE_IDS);
  });

  it("has a non-empty native picker label for every house locale", () => {
    for (const id of HOUSE_LOCALE_IDS) {
      const label = NATIVE_LANGUAGE_LABELS[id];
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
