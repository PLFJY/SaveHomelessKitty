export interface CatSummary {
  id: string;
  code: string;
  alias: string;
  description: string;
  firstSeenAtUtc?: string | null;
  lastSeenAtUtc?: string | null;
  primaryImageId?: string | null;
  isActive: boolean;
}

export interface DeviceSummary {
  id: string;
  deviceCode: string;
  name: string;
  location: string;
  isActive: boolean;
  status: number;
  batteryPercent?: number | null;
  signalStrength?: number | null;
  ipAddress?: string | null;
  firmwareVersion?: string | null;
  lastSeenAtUtc?: string | null;
  foodRemainingGrams?: number | null;
  foodDispensedTodayGrams?: number | null;
  foodDispensedTotalGrams?: number | null;
  pairingCodeExpiresAtUtc?: string | null;
  hasPairingCode?: boolean;
  note?: string | null;
}

export interface FeedLogItem {
  id: string;
  deviceId: string;
  deviceCode: string;
  catId?: string | null;
  decision: number;
  denyReason?: string | null;
  result: number;
  requestedAtUtc: string;
  triggeredAtUtc?: string | null;
  reportedAtUtc?: string | null;
  dailyLimitCountSnapshot: number;
  cooldownSecondsSnapshot: number;
  portionGrams?: number | null;
  note?: string | null;
  recognized: boolean;
  confidence?: number | null;
  snapshotImageId?: string | null;
}

export interface FeedRule {
  id: string;
  scopeType: number;
  scopeId?: string | null;
  name?: string | null;
  dailyLimitCount: number;
  cooldownSeconds: number;
  isActive: boolean;
}

export interface FeedRuleUpsertRequest {
  scopeType: number;
  scopeId?: string | null;
  name?: string | null;
  dailyLimitCount: number;
  cooldownSeconds: number;
  isActive: boolean;
}

export interface CatUpsertRequest {
  code?: string | null;
  alias?: string | null;
  description?: string | null;
  firstSeenAtUtc?: string | null;
  lastSeenAtUtc?: string | null;
  primaryImageId?: string | null;
  isActive: boolean;
}

export interface DeviceUpdateRequest {
  name?: string | null;
  location?: string | null;
  isActive: boolean;
  note?: string | null;
}

export interface DeviceCreateRequest {
  deviceCode: string;
  name?: string | null;
  location?: string | null;
  isActive: boolean;
  note?: string | null;
}

export interface PairingCodeResponse {
  code: string;
  expiresAtUtc?: string | null;
}

export enum DeviceStatus {
  Unknown = 0,
  Online = 1,
  Offline = 2,
  Error = 3
}

export enum DecisionStatus {
  Allowed = 0,
  Denied = 1
}

export enum FeedResult {
  None = 0,
  Success = 1,
  Failure = 2
}

export enum RuleScope {
  Global = 0,
  Device = 1,
  Cat = 2
}
