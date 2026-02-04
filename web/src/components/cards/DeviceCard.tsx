import React from "react";
import { Card, Tag, Typography } from "antd";
import type { DeviceSummary } from "../../types/api";
import { deviceStatusColor, deviceStatusLabel } from "../../utils/status";
import { formatUtc } from "../../utils/date";

interface DeviceCardProps {
  device: DeviceSummary;
  todayFeedCount?: number;
  onClick?: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, todayFeedCount = 0, onClick }) => {
  const statusLabel = deviceStatusLabel(device.status);
  const statusColor = deviceStatusColor(device.status);
  const lastHeartbeat = formatUtc(device.lastSeenAtUtc);

  return (
    <Card className="device-card" hoverable onClick={onClick}>
      <div className="card-meta">
        <Typography.Title level={5} style={{ margin: 0 }}>
          {device.name || device.deviceCode || "Unnamed Device"}
        </Typography.Title>
        <Typography.Text type="secondary">Location: {device.location || "-"}</Typography.Text>
        <div className="badge-dot">
          <span style={{ backgroundColor: statusColor }} />
          <span>{statusLabel}</span>
        </div>
        <Typography.Text type="secondary">Last heartbeat: {lastHeartbeat}</Typography.Text>
        <Tag color={device.isActive ? "blue" : "default"}>
          {device.isActive ? "Active" : "Inactive"}
        </Tag>
        <Typography.Text>Today feeds: {todayFeedCount}</Typography.Text>
      </div>
    </Card>
  );
};

export default DeviceCard;
