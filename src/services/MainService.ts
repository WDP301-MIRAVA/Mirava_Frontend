import axios, { type AxiosInstance, AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
const baseURL =
  import.meta.env.VITE_API_BASE_URL || "https://mirava-f0rz.onrender.com";
const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10);
const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag để tránh lặp vô hạn khi refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
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
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    if (window.location.pathname === "/login") {
      return Promise.reject(error);
    }
    // Nếu lỗi là 401 và chưa retry
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Nếu đang refresh, chờ refresh xong rồi retry
        return new Promise<string>(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            originalRequest._retry = true;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        console.log("Refreshing token...");
        // Gọi API refresh token
        const res = await axios.post(
          `${baseURL}/api/auth/refreshToken`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const newAccessToken = res.data.accessToken;
        //
        console.log("New access token: ", newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
        }
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Nếu refresh token cũng hết hạn, xóa token và chuyển hướng login
        console.error("Refresh token error: ", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Các lỗi khác
    console.error("Error in response: ", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
