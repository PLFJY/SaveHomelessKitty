import api from "./api";

export const getMediaUrl = (id?: string | null): string | null => {
  if (!id) {
    return null;
  }
  const base = api.defaults.baseURL?.replace(/\/$/, "") ?? "";
  return `${base}/api/admin/media/${id}`;
};
