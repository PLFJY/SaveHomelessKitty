import type { MessageInstance } from "antd/es/message/interface";

let messageApi: MessageInstance | null = null;

export const setMessageApi = (api: MessageInstance) => {
  messageApi = api;
};

export const notifyError = (content: string) => {
  if (messageApi) {
    messageApi.error(content);
    return;
  }
  // Fallback for early boot errors.
  console.error(content);
};
