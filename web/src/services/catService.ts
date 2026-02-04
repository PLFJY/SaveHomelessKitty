import api from "./api";
import type { CatSummary, CatUpsertRequest } from "../types/api";

export const getCats = async (): Promise<CatSummary[]> => {
  const response = await api.get<CatSummary[]>("/api/admin/cats");
  return response.data;
};

export const getCat = async (id: string): Promise<CatSummary> => {
  const response = await api.get<CatSummary>(`/api/admin/cats/${id}`);
  return response.data;
};

export const createCat = async (payload: CatUpsertRequest): Promise<{ id: string }> => {
  const response = await api.post<{ id: string }>("/api/admin/cats", payload);
  return response.data;
};

export const updateCat = async (id: string, payload: CatUpsertRequest): Promise<void> => {
  await api.put(`/api/admin/cats/${id}`, payload);
};

export const deleteCat = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/cats/${id}`);
};
