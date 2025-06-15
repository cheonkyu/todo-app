import axios from 'axios';
import { message } from 'antd';
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from '../utils/auth';

// 전역 메시지 설정
message.config({
  top: 60,
  duration: 3,
  maxCount: 3,
});

const instance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void; }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    message.error('요청 중 오류가 발생했습니다.');
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('Response interceptor - Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error('Response interceptor - Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message,
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.config?.url === '/auth/login') {
        message.error(error.response?.data?.message ?? '잘못된 요청입니다.');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        try {
          console.log('Waiting for token refresh...');
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          return instance(originalRequest);
        } catch (err) {
          console.error('Error while waiting for token refresh:', err);
          message.error('인증이 만료되었습니다. 다시 로그인해주세요.');
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        console.log('Attempting to refresh token with refresh token:', refreshToken);
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<{ accessToken: string }>('/api/auth/refresh', null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        console.log('Token refresh response:', response.data);

        const { accessToken } = response.data;
        setTokens(accessToken, refreshToken);
        
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        processQueue(null, accessToken);
        
        return instance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        clearAuth();
        message.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 400) {
      message.error(error.response?.data?.message ?? '잘못된 요청입니다.');
    } else if (error.response?.status === 403) {
      message.error('접근 권한이 없습니다.');
    } else if (error.response?.status === 404) {
      message.error('요청한 리소스를 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      message.error('서버 오류가 발생했습니다.');
    } else if (error.response?.data?.message) {
      message.error(error.response.data.message);
    } else if (error.message === 'Network Error') {
      message.error('네트워크 연결을 확인해주세요.');
    } else {
      message.error('오류가 발생했습니다.');
    }

    return Promise.reject(error);
  }
);

export default instance; 