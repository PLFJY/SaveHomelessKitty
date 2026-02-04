import api from "./api";
import type { RoleInfo, RoleUpsertRequest } from "../types/admin";

export const getRoles = async (): Promise<RoleInfo[]> => {
  const response = await api.get<RoleInfo[]>("/api/admin/roles");
  return response.data;
};

export const createRole = async (payload: RoleUpsertRequest): Promise<{ id: string }> => {
  const response = await api.post<{ id: string }>("/api/admin/roles", payload);
  return response.data;
};

export const updateRole = async (id: string, payload: RoleUpsertRequest): Promise<void> => {
  await api.put(`/api/admin/roles/${id}`, payload);
};

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/roles/${id}`);
};
