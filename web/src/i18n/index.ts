export type Locale = "en" | "zh";
export type LocaleMode = "system" | Locale;

import en from "./translations/en";
import zh from "./translations/zh";

const dictionaries = { en, zh };

export const getBrowserLocale = (): Locale => {
  if (typeof navigator === "undefined") {
    return "en";
  }
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
};

export const translate = (
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string => {
  const dict = dictionaries[locale];
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);

  if (typeof value !== "string") {
    return key;
  }

  if (!params) {
    return value;
  }

  return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
    return result.replace(new RegExp(`{{${paramKey}}}`, "g"), String(paramValue));
  }, value);
};
