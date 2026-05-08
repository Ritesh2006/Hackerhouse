import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
// Remove trailing slash if present
const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

// Handle case where user accidentally included /api/v1 in VITE_API_URL
export const finalBaseUrl = cleanBaseUrl.endsWith('/api/v1') ? cleanBaseUrl.replace('/api/v1', '') : cleanBaseUrl;

export const API_URL = `${finalBaseUrl}/api/v1`;

console.log("🚀 HackerHouse API Initialized at:", API_URL);
if (finalBaseUrl.includes('127.0.0.1') || finalBaseUrl.includes('localhost')) {
  console.warn("⚠️ Warning: Frontend is connecting to LOCAL backend. If this is production, please set VITE_API_URL in your environment.");
}

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
  getProfile: () => api.get('/auth/me'),
  hireDeveloper: (data: any) => api.post('/hire', data),
  getMyProjects: () => api.get('/projects/me'),
  getMyContracts: () => api.get('/contracts/me'),
};

export const githubApi = {
  getProfile: (username: string) => api.get(`/github/${username}`),
};

export const authApi = {
  login: (data: any) => {
    const formData = new FormData();
    formData.append('username', data.email);
    formData.append('password', data.password);
    return api.post('/auth/login', formData);
  },
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'), // Updated path
};

export const chatApi = {
  getHistory: (contractId: string) => api.get(`/chat/contract/${contractId}`),
};

export default api;
