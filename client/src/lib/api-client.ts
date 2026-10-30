import axios from 'axios';
import { supabase } from './supabase';

/** 统一 API 客户端：自动附带 Supabase 登录凭证，401 时跳回登录页 */
export const apiClient = axios.create({ baseURL: '/api' });

apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 登录失效，回登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
