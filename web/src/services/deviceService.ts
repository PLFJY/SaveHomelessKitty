import api from "./api";
import type { DeviceSummary, DeviceUpdateRequest } from "../types/api";

export const getDevices = async (): Promise<DeviceSummary[]> => {
  const response = await api.get<DeviceSummary[]>("/api/admin/devices");
  return response.data;
};

export const getDevice = async (id: string): Promise<DeviceSummary> => {
  const response = await api.get<DeviceSummary>(`/api/admin/devices/${id}`);
  return response.data;
};

export const updateDevice = async (id: string, payload: DeviceUpdateRequest): Promise<void> => {
  await api.put(`/api/admin/devices/${id}`, payload);
};
