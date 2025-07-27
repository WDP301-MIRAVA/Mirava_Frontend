import axiosInstance from "./MainService";

const BASE_URL = "/api/test-packages";

export const TestPackageService = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching test packages:", error);
      throw error;
    }
  },

  create: async (payload: any) => {
    try {
      const response = await axiosInstance.post(BASE_URL, payload);
      return response.data;
    } catch (error) {
      console.error("Error creating test package:", error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching test package by ID:", error);
      throw error;
    }
  },

  update: async (id: string, payload: any) => {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating test package:", error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting test package:", error);
      throw error;
    }
  },
};
