import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ThemeConfig } from "antd";
import { createThemeConfig } from "../theme";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  accentColor: string;
  effectiveMode: "light" | "dark";
  themeConfig: ThemeConfig;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
}

const STORAGE_KEY = "shk_theme";
const DEFAULT_ACCENT = "#146c94";

const ThemeContext = createContext<ThemeState | undefined>(undefined);

const getSystemMode = (): "light" | "dark" => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const loadSettings = (): { mode: ThemeMode; accentColor: string } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { mode: "system", accentColor: DEFAULT_ACCENT };
    }
    const parsed = JSON.parse(raw) as { mode?: ThemeMode; accentColor?: string };
    return {
      mode: parsed.mode ?? "system",
      accentColor: parsed.accentColor ?? DEFAULT_ACCENT
    };
  } catch {
    return { mode: "system", accentColor: DEFAULT_ACCENT };
  }
};

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const initial = loadSettings();
  const [mode, setModeState] = useState<ThemeMode>(initial.mode);
  const [accentColor, setAccentColorState] = useState<string>(initial.accentColor);
  const [systemMode, setSystemMode] = useState<"light" | "dark">(getSystemMode());
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemMode(media.matches ? "dark" : "light");
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const effectiveMode = mode === "system" ? systemMode : mode;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, accentColor }));
    } catch {
      // ignore
    }
  }, [mode, accentColor]);

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveMode;
    document.documentElement.style.setProperty("--accent-500", accentColor);
    document.documentElement.classList.add("theme-transition");
    if (transitionTimer.current) {
      window.clearTimeout(transitionTimer.current);
    }
    transitionTimer.current = window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
      transitionTimer.current = null;
    }, 420);
  }, [effectiveMode, accentColor]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);
  const setAccentColor = useCallback((color: string) => setAccentColorState(color), []);

  const themeConfig = useMemo(
    () => createThemeConfig(accentColor, effectiveMode === "dark"),
    [accentColor, effectiveMode]
  );

  const value = useMemo<ThemeState>(
    () => ({
      mode,
      accentColor,
      effectiveMode,
      themeConfig,
      setMode,
      setAccentColor
    }),
    [mode, accentColor, effectiveMode, themeConfig, setMode, setAccentColor]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeSettings = (): ThemeState => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeSettings must be used inside ThemeProvider");
  }
  return ctx;
};
