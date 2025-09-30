import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { 
  LoginCredentials, 
  RegisterData, 
  Employee, 
  ChangePasswordData
} from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api' 
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const userSession = sessionStorage.getItem('currentUser');
  
  if (userSession) {
    try {
      const sessionData = JSON.parse(userSession);
      
      if (sessionData?.token) {
        config.headers.Authorization = `Bearer ${sessionData.token}`;
      }
    } catch (error) {
      console.error('Error parsing user session:', error);
      sessionStorage.removeItem('currentUser');
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized error - invalid/expired token:', error.response?.data);
      
      // Clear session for 401 errors (definitely means auth failed)
      sessionStorage.removeItem('currentUser');
      
      // Only redirect if not already on login or change-password page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/change-password') {
        console.log('Redirecting to login due to 401 error');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('403 Forbidden error - insufficient permissions:', error.response?.data);
      
      // Check if this is a password change required error
      if (error.response?.data?.requiresPasswordChange === true) {
        // Update the session to mark that password change is required
        const userSession = sessionStorage.getItem('currentUser');
        if (userSession) {
          try {
            const sessionData = JSON.parse(userSession);
            if (sessionData.user) {
              sessionData.user.isInitialPassword = true;
              sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
            }
          } catch (e) {
            console.error('Error updating session data:', e);
          }
        }
        
        const currentPath = window.location.pathname;
        if (currentPath !== '/changepassword') {
          window.location.href = '/changepassword';
        }
      }
      // For other 403 errors, don't automatically clear session or redirect
      // This could be due to insufficient permissions, not invalid auth
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials: LoginCredentials) => 
  api.post<{ success: boolean; message: string; data: { user: Employee; token: string } }>('/auth/v1/login', credentials);

export const register = (data: RegisterData) => 
  api.post<{ success: boolean; message: string; data: Employee }>('/users/v1/add', data);

export const changePassword = (data: ChangePasswordData) =>
  api.put<{ success: boolean; message: string }>('/auth/v1/change-password', data);

export const getMe = () => 
  api.get<{ success: boolean; message: string; data: Employee }>('/auth/v1/me');

export const logout = () => 
  api.post<{ success: boolean; message: string }>('/auth/v1/logout');





export default api;