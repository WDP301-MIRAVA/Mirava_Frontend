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

// Interface cho request body đăng ký bác sĩ
export interface DoctorRegisterRequest {
  userName: string;
  email: string;
  password: string;
  phone: string;
  degree: string;
  specialty: string;
  workSchedule: string[];
  description: string;
  imageUrl: string;
}

// Interface cho response đăng ký bác sĩ
export interface DoctorRegisterResponse {
  doctor: {
    userName: string;
    email: string;
    phone: string;
    role: string;
    degree: string;
    specialty: string;
    description: string;
    imageUrl: string;
  };
  message: string;
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

  // API mới: Đăng ký tài khoản bác sĩ
  registerDoctor: (doctorData: DoctorRegisterRequest) =>
    axiosInstance.post<DoctorRegisterResponse>(
      `${BASE_URL}/api/auth/doctor/register`,
      doctorData,
      {
        headers: { "Content-Type": "application/json" },
      }
    ),
};