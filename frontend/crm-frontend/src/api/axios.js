import axios from "axios";

const API = axios.create({
  // 127.0.0.1 bilkul sahi hai Node v17+ ke liye
  baseURL: "http://127.0.0.1:5000/api", 
});

// 👇 YE PART BOOT ZAROORI HAI 👇
// Iske bina backend ko pata nahi chalega ki kaun login hai
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Browser se token uthao
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Backend ko token bhejo
  }
  return config;
});

export default API;