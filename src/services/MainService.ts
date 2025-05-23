import axios, { type AxiosInstance } from "axios";
const baseURL =
  import.meta.env.VITE_API_BASE_URL || "https://mirava-f0rz.onrender.com";
const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || "5000", 10);
const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("Error in response: ", error);
    return Promise.reject(error.response.data);
  }
);

export default axiosInstance;
