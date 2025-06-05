import axios from "axios";

const customFetch = axios.create({
  baseURL:
    "https://refashion-fqe8c7bfcgg5h0e7.southeastasia-01.azurewebsites.net/api",
  headers: {
    "Content-Type": "application/json",
  },
});

customFetch.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

customFetch.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default customFetch;
