import api from "./api";
import type { FeedRule, FeedRuleUpsertRequest } from "../types/api";

export const getFeedRules = async (): Promise<FeedRule[]> => {
  const response = await api.get<FeedRule[]>("/api/admin/feedrules");
  return response.data;
};

export const upsertDefaultRule = async (payload: FeedRuleUpsertRequest): Promise<void> => {
  await api.put("/api/admin/feedrules/default", payload);
};

export const upsertDeviceRule = async (deviceId: string, payload: FeedRuleUpsertRequest): Promise<void> => {
  await api.put(`/api/admin/feedrules/device/${deviceId}`, payload);
};

export const upsertCatRule = async (catId: string, payload: FeedRuleUpsertRequest): Promise<void> => {
  await api.put(`/api/admin/feedrules/cat/${catId}`, payload);
};
