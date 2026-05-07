import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
// Remove trailing slash if present
const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

// Handle case where user accidentally included /api/v1 in VITE_API_URL
export const finalBaseUrl = cleanBaseUrl.endsWith('/api/v1') ? cleanBaseUrl.replace('/api/v1', '') : cleanBaseUrl;

export const API_URL = `${finalBaseUrl}/api/v1`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const usersApi = {
  getUsers: (params?: { location?: string; skill?: string; name?: string; lat?: number; lon?: number }) => api.get('/users/', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
};

export const githubApi = {
  getProfile: (username: string) => api.get(`/github/${username}`),
};

export const linkedinApi = {
  getProfile: (token?: string) => token ? api.get(`/linkedin/profile?token=${token}`) : api.get('/linkedin/me'),
};

export const projectsApi = {
  getProjects: () => api.get('/projects'),
  createProject: (data: any) => api.post('/projects', data),
  applyToProject: (data: any) => api.post('/projects/contracts', data),
};

export const chatApi = {
  sendMessage: (data: { room_id: string; sender_id: string; message: string }) => api.post('/chat/send', data),
  getHistory: (roomId: string) => api.get(`/chat/history/${roomId}`),
};

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/users/me/profile'),
};

export default api;
