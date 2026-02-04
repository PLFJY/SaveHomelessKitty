import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#146c94",
    colorInfo: "#146c94",
    borderRadius: 12,
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, Segoe UI, sans-serif",
    fontSize: 14
  },
  components: {
    Layout: {
      headerBg: "rgba(255, 255, 255, 0.9)",
      bodyBg: "transparent"
    },
    Card: {
      headerBg: "#ffffff"
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
};
