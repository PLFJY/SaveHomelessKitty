import React, { useEffect, useMemo, useState } from "react";
import { Card, Descriptions, Empty, Spin, Table, Tag, Typography } from "antd";
import { useParams } from "react-router-dom";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import { getCat } from "../../services/catService";
import { getFeedLogs } from "../../services/feedLogService";
import { getMediaUrl } from "../../services/mediaService";
import type { CatSummary, FeedLogItem } from "../../types/api";
import { formatUtc } from "../../utils/date";
import { decisionLabel, feedResultLabel } from "../../utils/status";

const CatDetail: React.FC = () => {
  const { id } = useParams();
  const [cat, setCat] = useState<CatSummary | null>(null);
  const [logs, setLogs] = useState<FeedLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [catData, logData] = await Promise.all([getCat(id), getFeedLogs()]);
        setCat(catData);
        setLogs(logData.filter((log) => log.catId === id));
      } catch {
        setCat(null);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const images = useMemo(() => {
    const list = logs
      .map((log) => getMediaUrl(log.snapshotImageId))
      .filter((src): src is string => Boolean(src));
    const primary = cat?.primaryImageId ? getMediaUrl(cat.primaryImageId) : null;
    return [primary, ...list].filter((src): src is string => Boolean(src)).slice(0, 8);
  }, [logs, cat]);

  if (!id) {
    return <Empty description="Missing cat id" />;
  }

  return (
    <Spin spinning={loading}>
      <div className="page-title">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Cat Detail
        </Typography.Title>
        <Typography.Paragraph>Profile, feed history, and related images.</Typography.Paragraph>
      </div>
      {cat ? (
        <div style={{ display: "grid", gap: 20 }}>
          <Card className="section-card">
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "240px 1fr" }}>
              <div style={{ borderRadius: 16, overflow: "hidden" }}>
                <ImageWithFallback
                  src={getMediaUrl(cat.primaryImageId) || undefined}
                  alt={cat.alias || cat.code}
                  style={{ width: "100%", height: "240px", objectFit: "cover" }}
                />
              </div>
              <Descriptions title="Basic Info" column={2} layout="vertical">
                <Descriptions.Item label="Code">{cat.code || "-"}</Descriptions.Item>
                <Descriptions.Item label="Alias">{cat.alias || "-"}</Descriptions.Item>
                <Descriptions.Item label="First Seen">{formatUtc(cat.firstSeenAtUtc)}</Descriptions.Item>
                <Descriptions.Item label="Last Seen">{formatUtc(cat.lastSeenAtUtc)}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={cat.isActive ? "green" : "red"}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Description">{cat.description || "-"}</Descriptions.Item>
              </Descriptions>
            </div>
          </Card>

          <Card className="section-card" title="Related Photos">
            {images.length === 0 ? (
              <Empty description="No images yet" />
            ) : (
              <div className="image-grid">
                {images.map((src) => (
                  <ImageWithFallback key={src} src={src} alt="cat" />
                ))}
              </div>
            )}
          </Card>

          <Card className="section-card" title="Feed History">
            <Table
              rowKey="id"
              dataSource={logs}
              pagination={{ pageSize: 6 }}
              columns={[
                {
                  title: "Requested",
                  dataIndex: "requestedAtUtc",
                  render: (value: string) => formatUtc(value)
                },
                {
                  title: "Decision",
                  dataIndex: "decision",
                  render: (value: number) => decisionLabel(value)
                },
                {
                  title: "Result",
                  dataIndex: "result",
                  render: (value: number) => feedResultLabel(value)
                },
                {
                  title: "Portion (g)",
                  dataIndex: "portionGrams",
                  render: (value: number | null) => value ?? "-"
                }
              ]}
            />
          </Card>
        </div>
      ) : (
        <Empty description="Cat not found" />
      )}
    </Spin>
  );
};

export default CatDetail;
