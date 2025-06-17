import axios from "axios";
import { BASE_URL } from "./config";

export const userServ = {
  postLogin: (loginForm: { email: string; password: string }) =>
    axios.post(`${BASE_URL}/api/auth/login`, loginForm, {
      headers: { "Content-Type": "application/json" },
    }),

  postSignUp: (signUpForm: {
    userName: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }) =>
    axios.post(`${BASE_URL}/api/auth/register`, signUpForm, {
      headers: { "Content-Type": "application/json" },
    }),

  postLogout: (refreshToken: string, accessToken: string) =>
    axios.post(
      `${BASE_URL}/api/auth/logout`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    ),

  getUserById: (userId: string) => {
    const accessToken = localStorage.getItem("accessToken");

    return axios.get(`${BASE_URL}/api/user/profile/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
