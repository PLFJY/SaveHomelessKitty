import { DeviceStatus, DecisionStatus, FeedResult } from "../types/api";

type Translator = (key: string) => string;

export const deviceStatusLabel = (status: number, t: Translator): string => {
  switch (status) {
    case DeviceStatus.Online:
      return t("status.online");
    case DeviceStatus.Offline:
      return t("status.offline");
    case DeviceStatus.Error:
      return t("status.error");
    default:
      return t("status.unknown");
  }
};

export const deviceStatusColor = (status: number): string => {
  switch (status) {
    case DeviceStatus.Online:
      return "#2f9e44";
    case DeviceStatus.Offline:
      return "#d9480f";
    case DeviceStatus.Error:
      return "#e8590c";
    default:
      return "#868e96";
  }
};

export const decisionLabel = (decision: number, t: Translator): string => {
  switch (decision) {
    case DecisionStatus.Allowed:
      return t("status.allowed");
    case DecisionStatus.Denied:
      return t("status.denied");
    default:
      return t("status.unknown");
  }
};

export const feedResultLabel = (result: number, t: Translator): string => {
  switch (result) {
    case FeedResult.Success:
      return t("status.success");
    case FeedResult.Failure:
      return t("status.failure");
    case FeedResult.None:
      return t("status.pending");
    default:
      return t("status.unknown");
  }
};
