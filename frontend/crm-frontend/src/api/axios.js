import axios from "axios";

const API = axios.create({
  // ✅ Switch between Live Backend and Local Backend automatically
  baseURL: window.location.hostname === "localhost" 
    ? "http://localhost:5000/api" 
    : "https://crm-mohitrealestate-backend.onrender.com/api", // 👈 Replace with your actual LIVE BACKEND URL
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