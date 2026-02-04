import { DeviceStatus, DecisionStatus, FeedResult } from "../types/api";

export const deviceStatusLabel = (status: number): string => {
  switch (status) {
    case DeviceStatus.Online:
      return "Online";
    case DeviceStatus.Offline:
      return "Offline";
    case DeviceStatus.Error:
      return "Error";
    default:
      return "Unknown";
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

export const decisionLabel = (decision: number): string => {
  switch (decision) {
    case DecisionStatus.Allowed:
      return "Allowed";
    case DecisionStatus.Denied:
      return "Denied";
    default:
      return "Unknown";
  }
};

export const feedResultLabel = (result: number): string => {
  switch (result) {
    case FeedResult.Success:
      return "Success";
    case FeedResult.Failure:
      return "Failure";
    case FeedResult.None:
      return "Pending";
    default:
      return "Unknown";
  }
};
