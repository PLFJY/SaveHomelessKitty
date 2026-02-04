import React, { useEffect, useMemo, useState } from "react";
import { App, Button, Card, Descriptions, Form, Input, InputNumber, Modal, Popconfirm, Spin, Switch, Tag, Typography } from "antd";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deleteDevice, generatePairingCode, getDevice, updateDevice } from "../../services/deviceService";
import { getFeedRules, upsertDeviceRule } from "../../services/feedRuleService";
import type { DeviceSummary } from "../../types/api";
import { RuleScope } from "../../types/api";
import { deviceStatusLabel } from "../../utils/status";
import { formatUtc } from "../../utils/date";
import { useI18n } from "../../context/I18nContext";

const DeviceDetail: React.FC = () => {
  const { id } = useParams();
  const { hasPermission } = useAuth();
  const [device, setDevice] = useState<DeviceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deviceForm] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const { message } = App.useApp();
  const [pairingOpen, setPairingOpen] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingExpires, setPairingExpires] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [deviceData, ruleData] = await Promise.all([getDevice(id), getFeedRules()]);
        setDevice(deviceData);
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
          name: deviceRule?.name || deviceData.name || t("feeders.ruleTitle"),
          dailyLimitCount: fallback?.dailyLimitCount ?? 10,
          cooldownSeconds: fallback?.cooldownSeconds ?? 900,
          isActive: deviceRule?.isActive ?? true
        });
      } catch {
        setDevice(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, deviceForm, ruleForm, t]);

  const deviceMeta = useMemo(() => {
    if (!device) return [];
    return [
      { label: t("feeders.deviceCode"), value: device.deviceCode },
      { label: t("common.status"), value: deviceStatusLabel(device.status, t) },
      { label: t("feeders.lastHeartbeat"), value: formatUtc(device.lastSeenAtUtc) },
      { label: t("feeders.battery"), value: device.batteryPercent != null ? `${device.batteryPercent}%` : "-" },
      { label: t("feeders.signal"), value: device.signalStrength != null ? `${device.signalStrength} dBm` : "-" },
      { label: t("feeders.ip"), value: device.ipAddress || "-" },
      {
        label: t("feeders.foodRemainingLabel"),
        value: device.foodRemainingGrams != null ? `${device.foodRemainingGrams} g` : "-"
      },
      {
        label: t("feeders.dispensedToday"),
        value: device.foodDispensedTodayGrams != null ? `${device.foodDispensedTodayGrams} g` : "-"
      },
      {
        label: t("feeders.dispensedTotal"),
        value: device.foodDispensedTotalGrams != null ? `${device.foodDispensedTotalGrams} g` : "-"
      },
      {
        label: t("feeders.pairingTitle"),
        value: device.hasPairingCode
          ? device.pairingCodeExpiresAtUtc
            ? `${t("common.active")} (${t("feeders.pairingExpires")} ${formatUtc(device.pairingCodeExpiresAtUtc)})`
            : t("common.active")
          : t("feeders.notPaired")
      }
    ];
  }, [device, t]);

  const handleDeviceSave = async (values: { name: string; location: string; note: string; isActive: boolean }) => {
    if (!id) return;
    setSaving(true);
    try {
      await updateDevice(id, values);
      message.success(t("common.saved"));
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
      message.success(t("feeders.ruleSaved"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await deleteDevice(id);
      message.success(t("common.deleted"));
      window.location.href = "/devices";
    } finally {
      setSaving(false);
    }
  };

  const handlePairing = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const response = await generatePairingCode(id);
      setPairingCode(response.code);
      setPairingExpires(response.expiresAtUtc ?? null);
      setPairingOpen(true);
      message.success(t("feeders.pairingGenerated"));
      const deviceData = await getDevice(id);
      setDevice(deviceData);
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return <Typography.Text>{t("common.notFound")}</Typography.Text>;
  }

  return (
    <Spin spinning={loading}>
      <div className="page-title">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {t("feeders.detailTitle")}
        </Typography.Title>
        <Typography.Paragraph>{t("feeders.detailSubtitle")}</Typography.Paragraph>
      </div>
      {device ? (
        <div style={{ display: "grid", gap: 20 }}>
          <Card className="section-card" title={t("feeders.overview")}>
            <Descriptions column={3} layout="vertical">
              {deviceMeta.map((item) => (
                <Descriptions.Item key={item.label} label={item.label}>
                  {item.value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>

          <Card className="section-card" title={t("feeders.settings")}>
            <Form
              layout="vertical"
              form={deviceForm}
              onFinish={handleDeviceSave}
              disabled={!hasPermission("devices.write")}
            >
              <Form.Item label={t("feeders.name")} name="name" rules={[{ required: true }]}> 
                <Input placeholder={t("feeders.name")} />
              </Form.Item>
              <Form.Item label={t("feeders.location")} name="location">
                <Input placeholder={t("feeders.location")} />
              </Form.Item>
              <Form.Item label={t("feeders.adminNote")} name="note">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item label={t("common.active")} name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Button type="primary" htmlType="submit" loading={saving} disabled={!hasPermission("devices.write")}>
                  {t("common.save")}
                </Button>
                {hasPermission("devices.write") ? (
                  <Popconfirm
                    title={t("feeders.deleteConfirmTitle")}
                    description={t("feeders.deleteConfirmHint")}
                    onConfirm={handleDelete}
                  >
                    <Button danger loading={saving}>
                      {t("common.delete")}
                    </Button>
                  </Popconfirm>
                ) : null}
                {!hasPermission("devices.write") ? (
                  <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
                    {t("access.noPermission")}
                  </Typography.Text>
                ) : null}
              </div>
            </Form>
          </Card>

          <Card className="section-card" title={t("feeders.pairingTitle")}>
            <Typography.Paragraph type="secondary">
              {t("feeders.pairingHint")}
            </Typography.Paragraph>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Tag color={device.hasPairingCode ? "green" : "default"}>
                {device.hasPairingCode ? t("feeders.paired") : t("feeders.notPaired")}
              </Tag>
              {device.pairingCodeExpiresAtUtc ? (
                <Typography.Text type="secondary">
                  {t("feeders.pairingExpires")}: {formatUtc(device.pairingCodeExpiresAtUtc)}
                </Typography.Text>
              ) : null}
            </div>
            {hasPermission("devices.pair") ? (
              <Button type="primary" onClick={handlePairing} loading={saving} style={{ marginTop: 12 }}>
                {device.hasPairingCode ? t("feeders.pairingRotate") : t("feeders.pairingGenerate")}
              </Button>
            ) : (
              <Typography.Text type="secondary" style={{ display: "block", marginTop: 12 }}>
                {t("access.noPermission")}
              </Typography.Text>
            )}
          </Card>

          <Card className="section-card" title={t("feeders.ruleTitle")}>
            <Form layout="vertical" form={ruleForm} onFinish={handleRuleSave} disabled={!hasPermission("feedrules.write")}>
              <Form.Item label={t("feeders.ruleName")} name="name">
                <Input placeholder={t("feeders.ruleTitle")} />
              </Form.Item>
              <Form.Item label={t("feeders.ruleLimit")} name="dailyLimitCount" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label={t("feeders.ruleCooldown")} name="cooldownSeconds" rules={[{ required: true }]}>
                <InputNumber min={60} step={60} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label={t("common.active")} name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} disabled={!hasPermission("feedrules.write")}>
                {t("common.save")}
              </Button>
            </Form>
          </Card>
        </div>
      ) : (
        <Typography.Text>{t("common.notFound")}</Typography.Text>
      )}

      <Modal
        title={t("feeders.pairingCode")}
        open={pairingOpen}
        onCancel={() => setPairingOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPairingOpen(false)}>
            {t("common.close")}
          </Button>
        ]}
      >
        <Typography.Paragraph>
          {t("feeders.pairingProvide")}
        </Typography.Paragraph>
        <Card className="section-card" style={{ textAlign: "center" }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {pairingCode}
          </Typography.Title>
          {pairingExpires ? (
            <Typography.Text type="secondary">
              {t("feeders.pairingExpires")}: {formatUtc(pairingExpires)}
            </Typography.Text>
          ) : (
            <Typography.Text type="secondary">{t("feeders.pairingNoExpiry")}</Typography.Text>
          )}
        </Card>
      </Modal>
    </Spin>
  );
};

export default DeviceDetail;
