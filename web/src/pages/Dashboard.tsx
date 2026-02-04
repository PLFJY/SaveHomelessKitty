import React, { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Spin, Typography } from "antd";
import StatCard from "../components/cards/StatCard";
import { getCats } from "../services/catService";
import { getDevices } from "../services/deviceService";
import { getFeedLogs } from "../services/feedLogService";
import { FeedResult, DeviceStatus } from "../types/api";
import { getTodayRangeUtc } from "../utils/date";
import { useI18n } from "../context/I18nContext";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    feedCount: 0,
    feedTotal: 0,
    activeCats: 0,
    onlineDevices: 0
  });
  const { t } = useI18n();

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
        title: t("dashboard.todayFeeds"),
        value: stats.feedCount,
        helper: t("dashboard.feedsHelper")
      },
      {
        title: t("dashboard.todayPortion"),
        value: stats.feedTotal,
        suffix: "g",
        helper: t("dashboard.portionHelper")
      },
      {
        title: t("dashboard.activeCats"),
        value: stats.activeCats,
        helper: t("dashboard.activeHelper")
      },
      {
        title: t("dashboard.onlineFeeders"),
        value: stats.onlineDevices,
        helper: t("dashboard.onlineHelper")
      }
    ],
    [stats, t]
  );

  return (
    <div>
      <div className="page-title">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {t("dashboard.title")}
        </Typography.Title>
        <Typography.Paragraph>
          {t("dashboard.subtitle")}
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
            <Card className="section-card" title={t("dashboard.systemNotes")}>
              <Typography.Paragraph>
                {t("dashboard.systemNotesBody")}
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary">
                {t("dashboard.systemNotesHint")}
              </Typography.Paragraph>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card className="section-card" title={t("dashboard.operationalFocus")}>
              <Typography.Paragraph>
                {t("dashboard.operationalBody")}
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary">
                {t("dashboard.operationalHint")}
              </Typography.Paragraph>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
