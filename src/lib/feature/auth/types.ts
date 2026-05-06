// src\lib\feature\auth\types.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface changePasswordRequest {
  newPassword: string;
  confirmPassword: string;
}
