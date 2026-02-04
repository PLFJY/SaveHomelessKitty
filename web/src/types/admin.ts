export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
}

export interface RoleInfo {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleBrief {
  id: string;
  name: string;
}

export interface UserInfo {
  id: string;
  username: string;
  displayName: string;
  isActive: boolean;
  roles: RoleBrief[];
}

export interface UserCreateRequest {
  username: string;
  displayName?: string;
  password: string;
  isActive: boolean;
  roleIds: string[];
}

export interface UserUpdateRequest {
  displayName?: string;
  password?: string;
  isActive: boolean;
  roleIds: string[];
}

export interface RoleUpsertRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}
