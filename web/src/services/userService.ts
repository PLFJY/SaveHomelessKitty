import api from "./api";
import type { UserCreateRequest, UserInfo, UserUpdateRequest } from "../types/admin";

export const getUsers = async (): Promise<UserInfo[]> => {
  const response = await api.get<UserInfo[]>("/api/admin/users");
  return response.data;
};

export const createUser = async (payload: UserCreateRequest): Promise<{ id: string }> => {
  const response = await api.post<{ id: string }>("/api/admin/users", payload);
  return response.data;
};

export const updateUser = async (id: string, payload: UserUpdateRequest): Promise<void> => {
  await api.put(`/api/admin/users/${id}`, payload);
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/users/${id}`);
};
