import axios from "axios";
import { BASE_URL } from "./config";

export const DoctorService = {
  getDoctors: () =>
    axios.get(`${BASE_URL}/api/doctor`, {
      headers: { "Content-Type": "application/json" },
    }),
};
