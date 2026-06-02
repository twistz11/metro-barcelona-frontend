import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

$api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

$api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    const url: string = original?.url || '';

    if (url.includes('/auth/refresh')) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.get(`${API_URL}/auth/refresh`, { withCredentials: true });
        localStorage.setItem('token', res.data.accessToken);
        original.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return $api(original);
      } catch {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(err);
  }
);

export default $api;
