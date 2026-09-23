import axios from 'axios';

const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://bookingplatfrom-backend-gyq1rh-a97459-2-24-82-111.sslip.io/api';

const api = axios.create({
  baseURL: DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        const userStr = localStorage.getItem('user_data');
        if (refreshToken && userStr) {
          try {
            const user = JSON.parse(userStr);
            const { data } = await axios.post(
              `${DEFAULT_API_URL}/auth/refresh`,
              { refreshToken, userId: user.id || user._id },
            );
            if (data.accessToken) {
              localStorage.setItem('access_token', data.accessToken);
              if (data.refreshToken) {
                localStorage.setItem('refresh_token', data.refreshToken);
              }
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              return api(originalRequest);
            }
          } catch (refreshErr) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            window.location.href = '/admin/login';
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
