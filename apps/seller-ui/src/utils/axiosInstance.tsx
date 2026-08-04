import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
});
//withCredentials: true ensures cookies (including refresh tokens) are sent with every request.

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// Handle logout and prevent infinite loops
const handleLogout = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Handle adding a new access token to queued requests
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// Execute queued requests after refresh
const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Handle API requests
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Handle expired tokens and refresh logic

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Error Path (Token expired or invalid)

    const originalRequest = error.config;

    // prevent infinit retry loop
    // Check if it's a 401 (Unauthorized) and not already retried
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`,
          {},
          { withCredentials: true }
        );
        isRefreshing = false;
        onRefreshSuccess();

        return axiosInstance(originalRequest);
      } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

/*
User Request → API Call → 401 Unauthorized?
                              ↓
                          YES
                              ↓
                    ┌─────────────────┐
                    │ isRefreshing?   │
                    └─────────────────┘
                      ↓           ↓
                     NO           YES
                      ↓           ↓
              Start Refresh    Queue Request
              Set _retry=true   Wait for token
              Call /refresh
                      ↓
                Refresh Success?
                ↓            ↓
               YES           NO
                ↓            ↓
         Execute Queue    Logout User
         Retry Original
         Request */
