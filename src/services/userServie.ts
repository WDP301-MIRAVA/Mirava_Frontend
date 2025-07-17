import axiosInstance from "./MainService";
import { BASE_URL } from "./config";

export interface User {
  _id: string;
  userName: string;
  email: string;
  phone: string;
  gender?: string;
  address?: string;
  role: 'Customer' | 'Doctor' | 'Admin' | 'Manager';
  accessToken?: string[];
  createdAt: string;
  updatedAt: string;
  patientCode?: string;
}

export interface UserDetail {
  data: any;
  _id: string;
  userName: string;
  email: string;
  phone: string;
  gender?: string;
  address?: string;
  role: 'Customer' | 'Doctor' | 'Admin' | 'Manager';
  accessToken?: string[];
  createdAt: string;
  updatedAt: string;
  patientCode?: string;
  // Doctor specific fields (if role is Doctor)
  degree?: string;
  specialty?: string;
  description?: string;
  imageUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  phone: string;
  role: 'Customer' | 'Admin' | 'Manager';
}

export interface CreateDoctorRequest {
  userName: string;
  email: string;
  password: string;
  phone: string;
  degree: string;
  specialty: string;
  workSchedule: string[];
  description: string;
  imageUrl?: string;
}

export interface CreateUserResponse {
  user: {
    userName: string;
    email: string;
    phone: string;
    role: string;
  };
  message: string;
}

export interface UpdateUserRequest {
  password?: string;
  phone?: string;
  address?: string;
  gender?: string;
  userName?: string;
  email?: string;
}

export interface ToggleUserStatusResponse {
  message: string;
  user: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
    gender?: string;
    address?: string;
    role: string;
    accessToken?: string[];
    createdAt: string;
    updatedAt: string;
    patientCode?: string;
    status: 'active' | 'inactive';
    deletedAt?: string | null;
  };
}

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

  // Create user for Customer/Admin/Manager
  createUser: (userData: CreateUserRequest): Promise<CreateUserResponse> => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      throw new Error("Access token not found. Please login first.");
    }
    
    return axiosInstance.post(`${BASE_URL}/api/auth/register`, userData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(response => response.data);
  },

  // Create doctor account
  createDoctor: (doctorData: CreateDoctorRequest): Promise<CreateDoctorResponse> => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      throw new Error("Access token not found. Please login first.");
    }
    
    return axiosInstance.post(`${BASE_URL}/api/auth/doctor/register`, doctorData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(response => response.data);
  },
  
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
  
  getUserById: (userId: string): Promise<UserDetail> => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      throw new Error("Access token not found. Please login first.");
    }
    
    return axiosInstance.get(`${BASE_URL}/api/user/profile/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(response => {
      // Handle different response formats
      if (response.data && response.data._id) {
        return response.data;
      } else if (response.data.data && response.data.data._id) {
        return response.data.data;
      } else {
        throw new Error("Invalid response format");
      }
    });
  },
  
  updateUser: (data: UpdateUserRequest, userId: string): Promise<UpdateUserResponse> => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      throw new Error("Access token not found. Please login first.");
    }
    
    return axiosInstance.put(
      `${BASE_URL}/api/user/profileUser/${userId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    ).then(response => response.data);
  },
  
  // Soft delete user (block/deactivate)
  softDeleteUser: (userId: string): Promise<ToggleUserStatusResponse> => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      throw new Error("Access token not found. Please login first.");
    }
    
    return axiosInstance.patch(`${BASE_URL}/api/user/${userId}/soft-delete`, {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(response => response.data);
  },

  // Restore user (unblock/activate)
  restoreUser: (userId: string): Promise<ToggleUserStatusResponse> => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      throw new Error("Access token not found. Please login first.");
    }
    
    return axiosInstance.patch(`${BASE_URL}/api/user/${userId}/restore`, {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(response => response.data);
  },
  getAllUsers: (): Promise<User[]> => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      throw new Error("Access token not found. Please login first.");
    }
    
    return axiosInstance.get(`${BASE_URL}/api/user`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(response => {
      // Handle both response formats: direct array or wrapped in ApiResponse
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        return response.data;
      }
    });
  },
};