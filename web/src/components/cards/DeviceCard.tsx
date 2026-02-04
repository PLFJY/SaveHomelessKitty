import React from "react";
import { Card, Tag, Typography } from "antd";
import type { DeviceSummary } from "../../types/api";
import { deviceStatusColor, deviceStatusLabel } from "../../utils/status";
import { formatUtc } from "../../utils/date";
import { useI18n } from "../../context/I18nContext";

interface DeviceCardProps {
  device: DeviceSummary;
  todayFeedCount?: number;
  onClick?: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, todayFeedCount = 0, onClick }) => {
  const { t } = useI18n();
  const statusLabel = deviceStatusLabel(device.status, t);
  const statusColor = deviceStatusColor(device.status);
  const lastHeartbeat = formatUtc(device.lastSeenAtUtc);
  const remaining = device.foodRemainingGrams != null ? `${device.foodRemainingGrams} g` : "-";

  return (
    <Card className="device-card" hoverable onClick={onClick}>
      <div className="card-meta">
        <Typography.Title level={5} style={{ margin: 0 }}>
          {device.name || device.deviceCode || t("feeders.unnamed")}
        </Typography.Title>
        <Typography.Text type="secondary">
          {t("feeders.location")}: {device.location || "-"}
        </Typography.Text>
        <div className="badge-dot">
          <span style={{ backgroundColor: statusColor }} />
          <span>{statusLabel}</span>
        </div>
        <Typography.Text type="secondary">
          {t("feeders.lastHeartbeat")}: {lastHeartbeat}
        </Typography.Text>
        <Typography.Text type="secondary">
          {t("feeders.foodRemaining")}: {remaining}
        </Typography.Text>
        <Tag color={device.isActive ? "blue" : "default"}>
          {device.isActive ? t("common.active") : t("common.inactive")}
        </Tag>
        <Typography.Text>
          {t("feeders.todayFeeds")}: {todayFeedCount}
        </Typography.Text>
      </div>
    </Card>
  );
};

export default DeviceCard;
