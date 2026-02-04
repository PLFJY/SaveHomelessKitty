import api from "./api";
import type { AuthLoginRequest, AuthSession } from "../types/auth";

export const login = async (payload: AuthLoginRequest): Promise<AuthSession> => {
  const response = await api.post<AuthSession>("/api/admin/auth/login", payload);
  return response.data;
};

export const me = async (): Promise<AuthSession["user"]> => {
  const response = await api.get<AuthSession["user"]>("/api/admin/auth/me");
  return response.data;
};
