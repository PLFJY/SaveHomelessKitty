import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Descriptions, Form, Input, InputNumber, Spin, Switch, Typography, message } from "antd";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDevice, updateDevice } from "../../services/deviceService";
import { getFeedRules, upsertDeviceRule } from "../../services/feedRuleService";
import type { DeviceSummary, FeedRule } from "../../types/api";
import { RuleScope } from "../../types/api";
import { deviceStatusLabel } from "../../utils/status";
import { formatUtc } from "../../utils/date";

const DeviceDetail: React.FC = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [device, setDevice] = useState<DeviceSummary | null>(null);
  const [rules, setRules] = useState<FeedRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deviceForm] = Form.useForm();
  const [ruleForm] = Form.useForm();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [deviceData, ruleData] = await Promise.all([getDevice(id), getFeedRules()]);
        setDevice(deviceData);
        setRules(ruleData);
        deviceForm.setFieldsValue({
          name: deviceData.name,
          location: deviceData.location,
          note: deviceData.note,
          isActive: deviceData.isActive
        });
        const deviceRule = ruleData.find(
          (rule) => rule.scopeType === RuleScope.Device && rule.scopeId === id
        );
        const globalRule = ruleData.find((rule) => rule.scopeType === RuleScope.Global);
        const fallback = deviceRule || globalRule;
        ruleForm.setFieldsValue({
          name: deviceRule?.name || deviceData.name || "Device Rule",
          dailyLimitCount: fallback?.dailyLimitCount ?? 10,
          cooldownSeconds: fallback?.cooldownSeconds ?? 900,
          isActive: deviceRule?.isActive ?? true
        });
      } catch {
        setDevice(null);
        setRules([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, deviceForm, ruleForm]);

  const deviceMeta = useMemo(() => {
    if (!device) return [];
    return [
      { label: "Device Code", value: device.deviceCode },
      { label: "Status", value: deviceStatusLabel(device.status) },
      { label: "Last Heartbeat", value: formatUtc(device.lastSeenAtUtc) },
      { label: "Battery", value: device.batteryPercent != null ? `${device.batteryPercent}%` : "-" },
      { label: "Signal", value: device.signalStrength != null ? `${device.signalStrength} dBm` : "-" },
      { label: "IP Address", value: device.ipAddress || "-" }
    ];
  }, [device]);

  const handleDeviceSave = async (values: { name: string; location: string; note: string; isActive: boolean }) => {
    if (!id) return;
    setSaving(true);
    try {
      await updateDevice(id, values);
      message.success("Device updated");
    } finally {
      setSaving(false);
    }
  };

  const handleRuleSave = async (values: { name: string; dailyLimitCount: number; cooldownSeconds: number; isActive: boolean }) => {
    if (!id) return;
    setSaving(true);
    try {
      await upsertDeviceRule(id, {
        scopeType: RuleScope.Device,
        scopeId: id,
        name: values.name,
        dailyLimitCount: values.dailyLimitCount,
        cooldownSeconds: values.cooldownSeconds,
        isActive: values.isActive
      });
      message.success("Feed rule saved");
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return <Typography.Text>Missing device id.</Typography.Text>;
  }

  return (
    <Spin spinning={loading}>
      <div className="page-title">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Device Detail
        </Typography.Title>
        <Typography.Paragraph>Health status and feed rule configuration.</Typography.Paragraph>
      </div>
      {device ? (
        <div style={{ display: "grid", gap: 20 }}>
          <Card className="section-card" title="Device Overview">
            <Descriptions column={3} layout="vertical">
              {deviceMeta.map((item) => (
                <Descriptions.Item key={item.label} label={item.label}>
                  {item.value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>

          <Card className="section-card" title="Device Settings">
            <Form
              layout="vertical"
              form={deviceForm}
              onFinish={handleDeviceSave}
              disabled={!isAdmin}
            >
              <Form.Item label="Device Name" name="name" rules={[{ required: true }]}> 
                <Input placeholder="North Gate Feeder" />
              </Form.Item>
              <Form.Item label="Location" name="location">
                <Input placeholder="Building A, west corner" />
              </Form.Item>
              <Form.Item label="Admin Note" name="note">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item label="Active" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} disabled={!isAdmin}>
                Save Device
              </Button>
              {!isAdmin ? (
                <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
                  Viewer role is read-only.
                </Typography.Text>
              ) : null}
            </Form>
          </Card>

          <Card className="section-card" title="Feed Rule (Device Scope)">
            <Form layout="vertical" form={ruleForm} onFinish={handleRuleSave} disabled={!isAdmin}>
              <Form.Item label="Rule Name" name="name">
                <Input placeholder="Device Rule" />
              </Form.Item>
              <Form.Item label="Daily Limit" name="dailyLimitCount" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Cooldown (seconds)" name="cooldownSeconds" rules={[{ required: true }]}>
                <InputNumber min={60} step={60} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Active" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} disabled={!isAdmin}>
                Save Rule
              </Button>
            </Form>
          </Card>
        </div>
      ) : (
        <Typography.Text>Device not found.</Typography.Text>
      )}
    </Spin>
  );
};

export default DeviceDetail;
