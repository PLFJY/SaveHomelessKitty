import api from "./api";

export const getMediaUrl = (id?: string | null): string | null => {
  if (!id) {
    return null;
  }
  const base = api.defaults.baseURL?.replace(/\/$/, "") ?? "";
  try {
    const raw = localStorage.getItem("shk_session");
    if (raw) {
      const session = JSON.parse(raw) as { token?: string };
      if (session.token) {
        return `${base}/api/admin/media/${id}?access_token=${encodeURIComponent(session.token)}`;
      }
    }
  } catch {
    // ignore
  }
  return `${base}/api/admin/media/${id}`;
};
