import React from "react";
import { Button, Card, Form, Input, Select, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "../context/AuthContext";

interface LocationState {
  from?: { pathname: string };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || "/";

  const onFinish = (values: { name: string; role: UserRole }) => {
    login(values.name, values.role);
    navigate(redirectTo, { replace: true });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <Card style={{ width: 380 }} className="section-card">
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Sign in
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Use admin or viewer role. Backend auth can be plugged in later.
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ role: "viewer" }}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: "Enter your name" }]}>
            <Input placeholder="Admin" />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Admin", value: "admin" },
                { label: "Viewer", value: "viewer" }
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Continue
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
