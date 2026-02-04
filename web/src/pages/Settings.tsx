import React from "react";
import { Button, Card, Input, Segmented, Space, Typography } from "antd";
import { useThemeSettings } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";

const PRESET_COLORS = ["#146c94", "#2f9e44", "#d9480f", "#845ef7", "#0b7285", "#e64980"];

const Settings: React.FC = () => {
  const { mode, accentColor, setMode, setAccentColor, effectiveMode } = useThemeSettings();
  const { localeMode, effectiveLocale, setLocaleMode, t } = useI18n();

  return (
    <div>
      <div className="page-title">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {t("settings.title")}
        </Typography.Title>
        <Typography.Paragraph>{t("settings.subtitle")}</Typography.Paragraph>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <Card className="section-card" title={t("settings.themeMode")}>
          <Space direction="vertical" size="middle">
            <Segmented
              value={mode}
              options={[
                { label: t("common.system"), value: "system" },
                { label: t("common.light"), value: "light" },
                { label: t("common.dark"), value: "dark" }
              ]}
              onChange={(value) => setMode(value as "system" | "light" | "dark")}
            />
          </Space>
        </Card>

        <Card className="section-card" title={t("settings.accentColor")}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Space>
              <Input
                type="color"
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
                style={{ width: 64, padding: 4 }}
              />
              <Typography.Text>{accentColor.toUpperCase()}</Typography.Text>
              <Button onClick={() => setAccentColor("#146c94")}>{t("settings.resetAccent")}</Button>
            </Space>
            <Space wrap>
              {PRESET_COLORS.map((color) => (
                <Button
                  key={color}
                  style={{ backgroundColor: color, borderColor: color, width: 36, height: 36 }}
                  onClick={() => setAccentColor(color)}
                />
              ))}
            </Space>
          </Space>
        </Card>

        <Card className="section-card" title={t("settings.language")}>
          <Space direction="vertical" size="middle">
            <Segmented
              value={localeMode}
              options={[
                { label: t("settings.systemLocale"), value: "system" },
                { label: t("settings.english"), value: "en" },
                { label: t("settings.chinese"), value: "zh" }
              ]}
              onChange={(value) => setLocaleMode(value as "system" | "en" | "zh")}
            />
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
