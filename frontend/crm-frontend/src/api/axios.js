import axios from "axios";

// ✅ Domain-specific token key (Conflict rokne ke liye)
export const TOKEN_KEY = window.location.hostname === "localhost" 
  ? "crm_token_local" 
  : "crm_token_live";

const API = axios.create({
  baseURL: window.location.hostname === "localhost" 
    ? "http://localhost:5000/api" 
    : "https://crm-real-estate-k6cj.onrender.com/api", 
});

API.defaults.headers.common['Content-Type'] = 'application/json';

// Request Interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(` [${window.location.hostname}] Requesting: ${config.url}`);
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Auto-Logout logic
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY); 
      if (!window.location.pathname.includes('/login')) {
         window.location.href = "/login?reason=session_expired";
      }
    }
    return Promise.reject(error);
  }
);

export default API;