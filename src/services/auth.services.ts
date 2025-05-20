import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export const login = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_URL}/login`,
    credentials
  );

  // Lưu token vào localStorage để sử dụng sau này
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);

  return response.data;
};

export const logout = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refreshToken");
  const accessToken = localStorage.getItem("accessToken");

  if (!refreshToken) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return "Đã đăng xuất";
  }

  try {
    const response = await axios.post(
      `${API_URL}/logout`,
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // Xóa token khỏi localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Trả về message từ backend
    return response.data.message;
  } catch (error) {
    console.error("Logout error:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw error;
  }
};

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

export const register = async (
  data: RegisterRequest
): Promise<{ message: string }> => {
  const response = await axios.post<{ message: string }>(
    `${API_URL}/register`,
    data
  );
  return response.data;
};
