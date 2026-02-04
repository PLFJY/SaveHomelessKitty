import React, { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Spin, Typography } from "antd";
import StatCard from "../components/cards/StatCard";
import { getCats } from "../services/catService";
import { getDevices } from "../services/deviceService";
import { getFeedLogs } from "../services/feedLogService";
import { FeedResult, DeviceStatus } from "../types/api";
import { getTodayRangeUtc } from "../utils/date";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    feedCount: 0,
    feedTotal: 0,
    activeCats: 0,
    onlineDevices: 0
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { fromUtc, toUtc } = getTodayRangeUtc();
        const [cats, devices, logs] = await Promise.all([
          getCats(),
          getDevices(),
          getFeedLogs({ fromUtc, toUtc })
        ]);
        const successLogs = logs.filter((log) => log.result === FeedResult.Success);
        const feedTotal = successLogs.reduce((sum, log) => sum + (log.portionGrams || 0), 0);
        const activeCats = cats.filter((cat) => cat.isActive).length;
        const onlineDevices = devices.filter(
          (device) => device.isActive && device.status === DeviceStatus.Online
        ).length;
        setStats({
          feedCount: successLogs.length,
          feedTotal,
          activeCats,
          onlineDevices
        });
      } catch {
        setStats({
          feedCount: 0,
          feedTotal: 0,
          activeCats: 0,
          onlineDevices: 0
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = useMemo(
    () => [
      {
        title: "Today Feeds",
        value: stats.feedCount,
        helper: "Successful feedings"
      },
      {
        title: "Today Portion",
        value: stats.feedTotal,
        suffix: "g",
        helper: "Total grams delivered"
      },
      {
        title: "Active Cats",
        value: stats.activeCats,
        helper: "Tracked and active"
      },
      {
        title: "Online Devices",
        value: stats.onlineDevices,
        helper: "Healthy + active"
      }
    ],
    [stats]
  );

  return (
    <div>
      <div className="page-title">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Dashboard
        </Typography.Title>
        <Typography.Paragraph>
          Overview for daily operations, teacher reviews, and backup access.
        </Typography.Paragraph>
      </div>
      <Spin spinning={loading}>
        <Row gutter={[20, 20]}>
          {cards.map((card) => (
            <Col xs={24} sm={12} lg={6} key={card.title}>
              <StatCard {...card} />
            </Col>
          ))}
        </Row>
        <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
          <Col xs={24} lg={14}>
            <Card className="section-card" title="System Notes">
              <Typography.Paragraph>
                This console provides a stable view for daily management and on-site demos. Data is
                pulled directly from the ASP.NET Core REST API.
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary">
                Use the left navigation to manage cats, devices, and audit feed logs.
              </Typography.Paragraph>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card className="section-card" title="Operational Focus">
              <Typography.Paragraph>
                Keep devices online and verify daily limits. Review feed logs when devices report
                errors or misses.
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary">
                Configure device-specific feed rules from each device detail page.
              </Typography.Paragraph>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
