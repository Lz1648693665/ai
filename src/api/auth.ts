import { request } from "../utils/request";

import type { UserProfile } from "../types/user";

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  nickname: string;
}

export interface LoginResponse {
  token: string;
  user?: UserProfile;
}

export type RegisterResponse = LoginResponse | { message?: string };

export function loginApi(data: LoginParams) {
  return request.post<unknown, LoginResponse, LoginParams>("/auth/login", data);
}

export function registerApi(data: RegisterParams) {
  return request.post<unknown, RegisterResponse, RegisterParams>("/auth/register", data);
}
