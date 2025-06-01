import axios from "axios";
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
    axios.post(`${BASE_URL}/api/appointment`, payload, {
      headers: { "Content-Type": "application/json" },
    }),
};
