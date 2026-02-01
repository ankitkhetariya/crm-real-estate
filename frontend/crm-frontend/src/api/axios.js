import axios from "axios";

const API = axios.create({
  // ✅ Switch between Local and the Correct Render Backend
  baseURL: window.location.hostname === "localhost" 
    ? "http://localhost:5000/api" 
    : "https://crm-real-estate-k6cj.onrender.com/api", 
});

// Interceptor to attach the token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
});

export default API;