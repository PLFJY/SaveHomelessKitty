import React from "react";
import { Card, Tag, Typography } from "antd";
import type { CatSummary } from "../../types/api";
import ImageWithFallback from "../common/ImageWithFallback";
import { formatUtc, daysSince } from "../../utils/date";
import { getMediaUrl } from "../../services/mediaService";
import { useI18n } from "../../context/I18nContext";

interface CatCardProps {
  cat: CatSummary;
  onClick?: () => void;
}

const CatCard: React.FC<CatCardProps> = ({ cat, onClick }) => {
  const { t } = useI18n();
  const lastSeen = formatUtc(cat.lastSeenAtUtc);
  const absentDays = daysSince(cat.lastSeenAtUtc);
  const isLongAbsent = !cat.isActive || (absentDays !== null && absentDays > 30);
  const statusColor = isLongAbsent ? "red" : "green";
  const statusLabel = isLongAbsent ? t("cats.longAbsent") : t("cats.active");
  const imageUrl = getMediaUrl(cat.primaryImageId);

  return (
    <Card
      hoverable
      className="cat-card"
      cover={
        <div className="card-cover">
          <ImageWithFallback src={imageUrl || undefined} alt={cat.alias || cat.code || "cat"} />
        </div>
      }
      onClick={onClick}
    >
      <div className="card-meta">
        <Typography.Title level={5} style={{ margin: 0 }}>
          {cat.alias || cat.code || t("cats.unnamed")}
        </Typography.Title>
        <Typography.Text type="secondary">
          {t("cats.idLabel")}: {cat.code || "-"}
        </Typography.Text>
        <Typography.Text type="secondary">
          {t("cats.lastSeenLabel")}: {lastSeen}
        </Typography.Text>
        <Tag color={statusColor}>{statusLabel}</Tag>
      </div>
    </Card>
  );
};

export default CatCard;
