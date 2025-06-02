import axios from "axios";
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
    axios.get(`${BASE_URL}/api/doctor`, {
      headers: { "Content-Type": "application/json" },
    }),
  
  getDoctorById: (id: string) =>
    axios.get(`${BASE_URL}/api/doctor/${id}`, {
      headers: { "Content-Type": "application/json" },
    }),
};