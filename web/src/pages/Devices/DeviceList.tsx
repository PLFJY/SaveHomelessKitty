import React, { useEffect, useMemo, useState } from "react";
import { Empty, Input, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import DeviceCard from "../../components/cards/DeviceCard";
import { getDevices } from "../../services/deviceService";
import { getFeedLogs } from "../../services/feedLogService";
import type { DeviceSummary, FeedLogItem } from "../../types/api";
import { getTodayRangeUtc } from "../../utils/date";

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [logs, setLogs] = useState<FeedLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

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
          Devices
        </Typography.Title>
        <Typography.Paragraph>
          Monitor device health, heartbeat, and daily feed counts.
        </Typography.Paragraph>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Input.Search
          placeholder="Search by code, name, location"
          allowClear
          onSearch={setQuery}
          onChange={(event) => setQuery(event.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>
      <Spin spinning={loading}>
        {filtered.length === 0 ? (
          <Empty description="No devices found" />
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
    </div>
  );
};

export default DeviceList;
