export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  roles: string[];
  permissions: string[];
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface AuthLoginRequest {
  username: string;
  password: string;
}
