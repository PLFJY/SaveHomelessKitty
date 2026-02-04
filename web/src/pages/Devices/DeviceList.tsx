import React, { useEffect, useMemo, useState } from "react";
import { Button, Empty, Form, Input, Modal, Spin, Switch, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import DeviceCard from "../../components/cards/DeviceCard";
import { createDevice, getDevices } from "../../services/deviceService";
import { getFeedLogs } from "../../services/feedLogService";
import type { DeviceSummary, FeedLogItem } from "../../types/api";
import { getTodayRangeUtc } from "../../utils/date";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [logs, setLogs] = useState<FeedLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { t } = useI18n();
  const [form] = Form.useForm();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { fromUtc, toUtc } = getTodayRangeUtc();
        const [deviceData, logData] = await Promise.all([
          getDevices(),
          getFeedLogs({ fromUtc, toUtc })
        ]);
        setDevices(deviceData);
        setLogs(logData);
      } catch {
        setDevices([]);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reload = async () => {
    const { fromUtc, toUtc } = getTodayRangeUtc();
    const [deviceData, logData] = await Promise.all([
      getDevices(),
      getFeedLogs({ fromUtc, toUtc })
    ]);
    setDevices(deviceData);
    setLogs(logData);
  };

  const todayCounts = useMemo(() => {
    return logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.deviceId] = (acc[log.deviceId] || 0) + 1;
      return acc;
    }, {});
  }, [logs]);

  const filtered = devices.filter((device) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return (
      device.deviceCode.toLowerCase().includes(keyword) ||
      device.name.toLowerCase().includes(keyword) ||
      device.location.toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      <div className="page-title">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {t("feeders.title")}
        </Typography.Title>
        <Typography.Paragraph>
          {t("feeders.subtitle")}
        </Typography.Paragraph>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Input.Search
          placeholder={t("feeders.searchPlaceholder")}
          allowClear
          onSearch={setQuery}
          onChange={(event) => setQuery(event.target.value)}
          style={{ maxWidth: 320 }}
        />
        {hasPermission("devices.write") ? (
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            {t("feeders.new")}
          </Button>
        ) : null}
      </div>
      <Spin spinning={loading}>
        {filtered.length === 0 ? (
          <Empty description={t("feeders.empty")} />
        ) : (
          <div className="card-grid">
            {filtered.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                todayFeedCount={todayCounts[device.id] || 0}
                onClick={() => navigate(`/devices/${device.id}`)}
              />
            ))}
          </div>
        )}
      </Spin>

      <Modal
        title={t("feeders.new")}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={creating}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={async (values: { deviceCode: string; name?: string; location?: string; isActive: boolean }) => {
            setCreating(true);
            try {
              await createDevice({
                deviceCode: values.deviceCode,
                name: values.name,
                location: values.location,
                isActive: values.isActive,
                note: ""
              });
              await reload();
              form.resetFields();
              setCreateOpen(false);
            } finally {
              setCreating(false);
            }
          }}
          initialValues={{ isActive: true }}
        >
          <Form.Item label={t("feeders.deviceCode")} name="deviceCode" rules={[{ required: true }]}>
            <Input placeholder="RPI-001" />
          </Form.Item>
          <Form.Item label={t("feeders.name")} name="name">
            <Input placeholder={t("feeders.name")} />
          </Form.Item>
          <Form.Item label={t("feeders.location")} name="location">
            <Input placeholder={t("feeders.location")} />
          </Form.Item>
          <Form.Item label={t("common.active")} name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceList;
