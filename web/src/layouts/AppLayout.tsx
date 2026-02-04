import React, { useMemo, useState } from "react";
import { Layout, Menu, Typography, Button, Space, Segmented } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  RobotOutlined,
  FileSearchOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeSettings } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";

const { Sider, Header, Content } = Layout;

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const { mode, setMode } = useThemeSettings();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith("/cats")) return "/cats";
    if (location.pathname.startsWith("/devices")) return "/devices";
    if (location.pathname.startsWith("/logs")) return "/logs";
    if (location.pathname.startsWith("/settings")) return "/settings";
    if (location.pathname.startsWith("/access")) return "/access";
    if (location.pathname.startsWith("/dashboard")) return "/dashboard";
    return "/dashboard";
  }, [location.pathname]);

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">{t("nav.dashboard")}</Link>
    }
  ];

  if (hasPermission("cats.read")) {
    menuItems.push({
      key: "/cats",
      icon: <TeamOutlined />,
      label: <Link to="/cats">{t("nav.cats")}</Link>
    });
  }

  if (hasPermission("devices.read")) {
    menuItems.push({
      key: "/devices",
      icon: <RobotOutlined />,
      label: <Link to="/devices">{t("nav.feeders")}</Link>
    });
  }

  if (hasPermission("feedlogs.read")) {
    menuItems.push({
      key: "/logs",
      icon: <FileSearchOutlined />,
      label: <Link to="/logs">{t("nav.logs")}</Link>
    });
  }

  const bottomMenuItems = [];
  if (hasPermission("users.manage") || hasPermission("roles.manage")) {
    bottomMenuItems.push({
      key: "/access",
      icon: <SettingOutlined />,
      label: <Link to="/access">{t("nav.access")}</Link>
    });
  }
  bottomMenuItems.push({
    key: "/settings",
    icon: <SettingOutlined />,
    label: <Link to="/settings">{t("nav.settings")}</Link>
  });

  return (
    <Layout className="app-shell">
      <Sider
        width={240}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="app-sider"
      >
        <div className="app-sider-inner">
          <div>
            <div className="app-logo">
              {t("app.name")}
              <span>{t("app.subtitle")}</span>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems}
            />
          </div>
          <div className="app-sider-bottom">
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedKey]}
              items={bottomMenuItems}
            />
          </div>
        </div>
      </Sider>
      <Layout>
        <Header className="app-header">
          <div>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {t("app.headerTitle")}
            </Typography.Text>
          </div>
          <Space>
            <Segmented
              size="small"
              value={mode}
              options={[
                { label: t("common.system"), value: "system" },
                { label: t("common.light"), value: "light" },
                { label: t("common.dark"), value: "dark" }
              ]}
              onChange={(value) => setMode(value as "system" | "light" | "dark")}
            />
            <Typography.Text type="secondary">
              {user ? `${user.displayName} (${user.roles.join(", ")})` : ""}
            </Typography.Text>
            <Button onClick={logout}>{t("auth.signOut")}</Button>
          </Space>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
