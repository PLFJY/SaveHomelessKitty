import React from "react";
import { Card, Statistic, Typography } from "antd";

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  helper?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, suffix, helper }) => {
  return (
    <Card className="stat-card" variant="borderless">
      <Statistic title={title} value={value} suffix={suffix} />
      {helper ? (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {helper}
        </Typography.Text>
      ) : null}
    </Card>
  );
};

export default StatCard;
