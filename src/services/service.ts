import axiosInstance from "./MainService";
import { BASE_URL } from "./config";

export const Service = {
  getServices: () =>
    axiosInstance.get(`${BASE_URL}/api/service`, {
      headers: { "Content-Type": "application/json" },
    }),
};
