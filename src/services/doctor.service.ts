import axiosInstance from "./MainService";
import { BASE_URL } from "./config";

// Types
export interface User {
  _id: string;
  userName: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  _id: string;
  user: User;
  degree: string;
  specialty: string;
  workSchedule: string[];
  description: string;
  imageUrl: string;
  rating: number;
  feedbacks: unknown[];
  createdAt: string;
  updatedAt: string;
}

export const DoctorService = {
  getDoctors: () =>
    axiosInstance.get(`${BASE_URL}/api/doctor`, {
      headers: { "Content-Type": "application/json" },
    }),

  getDoctorById: (id: string) =>
    axiosInstance.get(`${BASE_URL}/api/doctor/${id}`, {
      headers: { "Content-Type": "application/json" },
    }),

  // Lấy danh sách cuộc hẹn của bác sĩ
  getDoctorAppointments: () =>
    axiosInstance.get(`${BASE_URL}/api/appointment/doctor/appointments`),
};
