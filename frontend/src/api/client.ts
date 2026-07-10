import axios from "axios";

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080";

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("oeps_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const onAuthPage = window.location.pathname === "/login" || window.location.pathname === "/register";
    if ((status === 401 || status === 403) && !onAuthPage) {
      // Token is stale/invalid (e.g. backend restarted and its in-memory
      // database no longer has this user). Clear it and send the person
      // back to log in again instead of leaving the app silently broken.
      localStorage.removeItem("oeps_token");
      localStorage.removeItem("oeps_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;
