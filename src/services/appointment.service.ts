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
};
