import React from "react";
import { Button, Card, Form, Input, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as loginRequest } from "../services/authService";
import { useI18n } from "../context/I18nContext";

interface LocationState {
  from?: { pathname: string };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || "/";
  const [loading, setLoading] = React.useState(false);
  const { t } = useI18n();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const session = await loginRequest({
        username: values.username,
        password: values.password
      });
      login(session);
      navigate(redirectTo, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <Card style={{ width: 380 }} className="section-card">
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          {t("auth.signIn")}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {t("auth.signInHint")}
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label={t("auth.username")} name="username" rules={[{ required: true, message: t("auth.username") }]}>
            <Input placeholder="admin" />
          </Form.Item>
          <Form.Item label={t("auth.password")} name="password" rules={[{ required: true, message: t("auth.password") }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t("auth.continue")}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
