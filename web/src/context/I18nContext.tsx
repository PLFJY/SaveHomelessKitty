import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale, LocaleMode } from "../i18n";
import { getBrowserLocale, translate } from "../i18n";

interface I18nState {
  localeMode: LocaleMode;
  effectiveLocale: Locale;
  setLocaleMode: (mode: LocaleMode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = "shk_locale_mode";

const I18nContext = createContext<I18nState | undefined>(undefined);

const loadLocaleMode = (): LocaleMode => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "en" || raw === "zh" || raw === "system") {
      return raw;
    }
  } catch {
    // ignore
  }
  return "system";
};

export const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [localeMode, setLocaleModeState] = useState<LocaleMode>(loadLocaleMode());
  const [browserLocale, setBrowserLocale] = useState<Locale>(getBrowserLocale());

  useEffect(() => {
    const handler = () => setBrowserLocale(getBrowserLocale());
    window.addEventListener("languagechange", handler);
    return () => window.removeEventListener("languagechange", handler);
  }, []);

  const effectiveLocale = localeMode === "system" ? browserLocale : localeMode;

  useEffect(() => {
    document.documentElement.lang = effectiveLocale;
    try {
      localStorage.setItem(STORAGE_KEY, localeMode);
    } catch {
      // ignore
    }
  }, [effectiveLocale, localeMode]);

  const setLocaleMode = useCallback((mode: LocaleMode) => setLocaleModeState(mode), []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(effectiveLocale, key, params),
    [effectiveLocale]
  );

  const value = useMemo<I18nState>(
    () => ({ localeMode, effectiveLocale, setLocaleMode, t }),
    [localeMode, effectiveLocale, setLocaleMode, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nState => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return ctx;
};
