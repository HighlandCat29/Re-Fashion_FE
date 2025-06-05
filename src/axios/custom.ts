import axios from "axios";
import { handleTokenExpiration, isTokenExpired } from "../utils/auth";

const customFetch = axios.create({
  baseURL:
    "https://refashion-fqe8c7bfcgg5h0e7.southeastasia-01.azurewebsites.net/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
customFetch.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  // Check if token exists and is not expired
  if (token) {
    if (isTokenExpired(token)) {
      handleTokenExpiration();
      return Promise.reject(new Error("Token expired"));
    }

    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Response interceptor
customFetch.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      handleTokenExpiration();
      return Promise.reject(error);
    }

    // Handle other errors
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default customFetch;
