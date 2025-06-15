export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm extends LoginForm {
  name: string;
  passwordConfirm: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
} 