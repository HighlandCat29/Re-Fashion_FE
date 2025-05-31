import axios from "axios";

const customFetch = axios.create({
  baseURL:
    "https://refashion-fqe8c7bfcgg5h0e7.southeastasia-01.azurewebsites.net/api",
});
customFetch.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default customFetch;
