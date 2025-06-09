import axiosInstance from "./MainService";
import { BASE_URL } from "./config";

export const userServ = {
  postLogin: (loginForm: { email: string; password: string }) =>
    axiosInstance.post(`${BASE_URL}/api/auth/login`, loginForm, {
      headers: { "Content-Type": "application/json" },
    }),

  postSignUp: (signUpForm: {
    userName: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }) =>
    axiosInstance.post(`${BASE_URL}/api/auth/register`, signUpForm, {
      headers: { "Content-Type": "application/json" },
    }),

  postLogout: (refreshToken: string, accessToken: string) =>
    axiosInstance.post(
      `${BASE_URL}/api/auth/logout`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    ),
};
