import React, { useMemo, useState } from "react";
import { Layout, Menu, Typography, Button, Space } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  RobotOutlined,
  FileSearchOutlined
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Sider, Header, Content } = Layout;

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith("/cats")) return "/cats";
    if (location.pathname.startsWith("/devices")) return "/devices";
    if (location.pathname.startsWith("/logs")) return "/logs";
    if (location.pathname.startsWith("/dashboard")) return "/dashboard";
    return "/dashboard";
  }, [location.pathname]);

  return (
    <Layout className="app-shell">
      <Sider
        width={240}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="app-sider"
      >
        <div className="app-logo">
          Save Homeless Kitty
          <span>Campus Feeding Console</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            {
              key: "/dashboard",
              icon: <DashboardOutlined />,
              label: <Link to="/dashboard">Dashboard</Link>
            },
            {
              key: "/cats",
              icon: <TeamOutlined />,
              label: <Link to="/cats">Cats</Link>
            },
            {
              key: "/devices",
              icon: <RobotOutlined />,
              label: <Link to="/devices">Devices</Link>
            },
            {
              key: "/logs",
              icon: <FileSearchOutlined />,
              label: <Link to="/logs">Feed Logs</Link>
            }
          ]}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div>
            <Typography.Text strong style={{ fontSize: 16 }}>
              Campus Stray Cat Feeding
            </Typography.Text>
          </div>
          <Space>
            <Typography.Text type="secondary">
              {user ? `${user.name} (${user.role})` : "Guest"}
            </Typography.Text>
            <Button onClick={logout}>Sign out</Button>
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
