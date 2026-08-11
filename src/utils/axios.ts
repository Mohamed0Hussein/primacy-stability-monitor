import axios from "axios";
import { auth } from "../services/firebaseConfig";

const axiosInstance = axios.create({
  baseURL: "https://primacy-backend.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Firebase session must be torn down too — otherwise ProtectedRoute still
      // sees a logged-in Firebase user, Login redirects straight back to the
      // dashboard, and the query 401s again in a loop.
      auth.signOut();
      window.location.hash = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
