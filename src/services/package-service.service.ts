import axiosInstance from "./MainService";

const BASE_URL = "/api/service";

export const PackageService = {
  getAll: async () => {
    const res = await axiosInstance.get(BASE_URL);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await axiosInstance.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  create: async (payload: any) => {
    const res = await axiosInstance.post(BASE_URL, payload);
    return res.data;
  },

  update: async (id: string, payload: any) => {
    const res = await axiosInstance.put(`${BASE_URL}/${id}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};
