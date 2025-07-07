import axiosInstance from "./MainService";

export const MedicalHistoryService = {
  findUserByKeyword: async (keyword: string) => {
    try {
      const response = await axiosInstance.get(
        "/api/medical-history/find-user",
        {
          params: { keyword },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user by keyword:", error);
      throw error;
    }
  },
  createMedicalHistory: async (data: {
    user: string;
    diseases: string[];
    allergies?: string;
    note?: string;
  }) => {
    try {
      const response = await axiosInstance.post("/api/medical-history", data);
      return response.data;
    } catch (error) {
      console.error("Error creating medical history:", error);
      throw error;
    }
  },
  getMedicalHistoryByUserId: async (userId: string) => {
    try {
      const response = await axiosInstance.get(
        `/api/medical-history/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching medical history by userId:", error);
      throw error;
    }
  },
  updateMedicalHistory: async (
    userId: string,
    data: {
      user: string;
      diseases: string[];
      allergies?: string;
      note?: string;
    }
  ) => {
    const res = await axiosInstance.put(`/api/medical-history/${userId}`, data);
    return res.data;
  },

  deleteMedicalHistory: async (userId: string) => {
    const res = await axiosInstance.delete(`/api/medical-history/${userId}`);
    return res.data;
  },
};
