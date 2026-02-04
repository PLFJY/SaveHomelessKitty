import api from "./api";
import type { PermissionDefinition } from "../types/admin";

export const getPermissions = async (): Promise<PermissionDefinition[]> => {
  const response = await api.get<PermissionDefinition[]>("/api/admin/permissions");
  return response.data;
};
