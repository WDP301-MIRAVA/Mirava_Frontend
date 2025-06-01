import axios from "axios";
import { BASE_URL } from "./config";

export const Service = {
  getServices: () =>
    axios.get(`${BASE_URL}/api/service`, {
      headers: { "Content-Type": "application/json" },
    }),
};
