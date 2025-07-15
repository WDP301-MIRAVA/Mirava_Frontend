import axiosInstance from "./MainService";

const BASE_URL = "/api/work-schedules";

export const WorkScheduleService = {
  createSchedule: async (payload: {
    doctorId: string;
    schedules: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      breakStartTime: string;
      breakEndTime: string;
      maxPatients: number;
    }[];
  }) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  },

  getScheduleByDoctor: async (doctorId: string) => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/doctor/${doctorId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching schedule by doctorId:", error);
      throw error;
    }
  },

  checkAvailability: async (payload: {
    doctorId: string;
    date: string;
    time: string;
  }) => {
    try {
      const response = await axiosInstance.post(
        `${BASE_URL}/availability`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error checking availability:", error);
      throw error;
    }
  },

  getAvailableSlots: async (payload: { doctorId: string; date: string }) => {
    try {
      const response = await axiosInstance.post(
        `${BASE_URL}/available-slots`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error getting available slots:", error);
      throw error;
    }
  },

  addSpecialDate: async (
    doctorId: string,
    payload: {
      date: string;
      isWorking: boolean;
      startTime: string;
      endTime: string;
      note: string;
    }
  ) => {
    console.log({ payload });
    try {
      const response = await axiosInstance.post(
        `${BASE_URL}/doctor/${doctorId}/special-date`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error adding special date:", error);
      throw error;
    }
  },
};
