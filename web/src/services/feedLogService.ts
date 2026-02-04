import api from "./api";
import type { FeedLogItem } from "../types/api";

export interface FeedLogQuery {
  deviceId?: string;
  deviceCode?: string;
  fromUtc?: string;
  toUtc?: string;
  result?: number;
  decision?: number;
}

export const getFeedLogs = async (params?: FeedLogQuery): Promise<FeedLogItem[]> => {
  const response = await api.get<FeedLogItem[]>("/api/admin/feedlogs", { params });
  return response.data;
};
