import { theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";

export const createThemeConfig = (accentColor: string, isDark: boolean): ThemeConfig => ({
  token: {
    colorPrimary: accentColor,
    colorInfo: accentColor,
    borderRadius: 12,
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, Segoe UI, sans-serif",
    fontSize: 14
  },
  algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  components: {
    Layout: {
      headerBg: isDark ? "#121b21" : "rgba(255, 255, 255, 0.9)",
      bodyBg: "transparent"
    },
    Card: {
      headerBg: isDark ? "#141f26" : "#ffffff"
    },
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkItemSelectedBg: "rgba(255, 255, 255, 0.16)",
      darkItemSelectedColor: "#ffffff",
      darkItemColor: "rgba(255, 255, 255, 0.72)",
      darkItemHoverColor: "#ffffff"
    }
  }
});
