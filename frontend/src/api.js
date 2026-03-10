// NOTE: Agar file ka naam 'axiosInstance.js' rakha tha toh wahi likhein
import API from "./axiosInstance"; 

// REGISTER
export const registerUser = async (userData) => {
  // Correction: JSON.stringify ki zaroorat nahi hoti, direct object bhejein
  const response = await API.post("/auth/register", userData);
  return response.data;
};

// LOGIN (Is function ko add karna zaroori hai!)
export const loginUser = async (userData) => {
  const response = await API.post("/auth/login", userData);
  return response.data;
};