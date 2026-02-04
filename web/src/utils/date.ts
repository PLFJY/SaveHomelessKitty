import dayjs from "dayjs";

export const formatUtc = (value?: string | null): string => {
  if (!value) {
    return "-";
  }
  return dayjs(value).local().format("YYYY-MM-DD HH:mm");
};

export const getTodayRangeUtc = (): { fromUtc: string; toUtc: string } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    fromUtc: start.toISOString(),
    toUtc: now.toISOString()
  };
};

export const daysSince = (value?: string | null): number | null => {
  if (!value) {
    return null;
  }
  const diffMs = Date.now() - new Date(value).getTime();
  return Math.floor(diffMs / 86400000);
};
