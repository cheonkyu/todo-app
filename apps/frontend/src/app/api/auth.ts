import axios from './axios';
import { LoginForm, SignupForm, AuthResponse, RefreshResponse } from '@todo-app/libs';

export const login = (data: LoginForm) => {
  return axios.post<AuthResponse>('/auth/login', data);
};

export const signup = (data: SignupForm) => {
  return axios.post<AuthResponse>('/auth/signup', data);
};

export const refresh = () => {
  return axios.post<RefreshResponse>('/auth/refresh');
}; 