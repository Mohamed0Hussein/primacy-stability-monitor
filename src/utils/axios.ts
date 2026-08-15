import axios from "axios";
import { auth } from "../services/firebaseConfig";

const BASE_URL = "https://primacy-backend.vercel.app/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // Required for the browser/Electron to send the httpOnly refreshToken
  // cookie on this cross-origin request at all.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function forceLogout() {
  localStorage.removeItem("token");
  // Firebase session must be torn down too — otherwise ProtectedRoute still
  // sees a logged-in Firebase user, Login redirects straight back to the
  // dashboard, and the query 401s again in a loop.
  auth.signOut();
  window.location.hash = "/login";
}

let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    // Plain axios (not axiosInstance) — going through the instance would
    // re-enter this same response interceptor on a 401.
    refreshPromise = axios
      .get(`${BASE_URL}/auth/refresh`, { withCredentials: true })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        return res.data.token as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      forceLogout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
