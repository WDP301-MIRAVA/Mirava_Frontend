import axiosInstance from "./MainService";
import { BASE_URL } from "./config";

export const AppointmentService = {
  createBooking: (payload: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    doctorId: string;
    specialty: string;
    gender: string;
    date: string;
    note: string;
  }) =>
    axiosInstance.post(`${BASE_URL}/api/appointment`, payload, {
      headers: { "Content-Type": "application/json" },
    }),

  // Lấy khung giờ trống của bác sĩ
  getAvailableTimeSlots: async (doctorId: string, date: string) => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/api/work-schedules/available-slots`,
        {
          params: { doctorId, date },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting available time slots:", error);
      throw error;
    }
  },
};
