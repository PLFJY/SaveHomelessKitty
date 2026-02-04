import api from "./api";
import type { DeviceCreateRequest, DeviceSummary, DeviceUpdateRequest, PairingCodeResponse } from "../types/api";

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

export const createDevice = async (payload: DeviceCreateRequest): Promise<{ id: string }> => {
  const response = await api.post<{ id: string }>("/api/admin/devices", payload);
  return response.data;
};

export const deleteDevice = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/devices/${id}`);
};

export const generatePairingCode = async (id: string): Promise<PairingCodeResponse> => {
  const response = await api.post<PairingCodeResponse>(`/api/admin/devices/${id}/pairing-code`);
  return response.data;
};
