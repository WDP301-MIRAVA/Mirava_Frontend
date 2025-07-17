import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/services/MainService";
import { toast } from "@/hooks/useToast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const REFRESH_INTERVAL_MS = 55 * 60 * 1000; // 55 phút

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkAuthStatus = React.useCallback(() => {
    const accessToken = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const userInfo = localStorage.getItem("userInfo");

    if (accessToken && role) {
      try {
        const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
        setUser({
          id: parsedUserInfo?.id || "unknown",
          name: parsedUserInfo?.name || "User",
          email: parsedUserInfo?.email || "",
          role: role,
        });
      } catch (error) {
        console.error("Error parsing user info:", error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  // Hàm tự động refresh accessToken
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      const response = await axiosInstance.post("/api/auth/refreshToken", {
        refreshToken,
      });
      if (response.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        toast({ title: "Tự động gia hạn phiên đăng nhập thành công." });
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userInfo");
        setUser(null);
        window.location.href = "/login";
      }
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userInfo");
      setUser(null);
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Thiết lập interval tự động refresh token
  useEffect(() => {
    intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const login = (token: string, userRole: string, userInfo: unknown) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("role", userRole);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));

    const typedUserInfo = userInfo as User;
    setUser({
      id: typedUserInfo.id,
      name: typedUserInfo.name,
      email: typedUserInfo.email,
      role: userRole,
    });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";
  const isManager = user?.role === "manager";

  return {
    user,
    isAuthenticated,
    isAdmin,
    isCustomer,
    isManager,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };
};

// import React, { useState, useEffect } from "react";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// export const useAuth = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const checkAuthStatus = React.useCallback(() => {
//     const accessToken = localStorage.getItem("accessToken");
//     const role = localStorage.getItem("role");
//     const userInfo = localStorage.getItem("userInfo");

//     if (accessToken && role) {
//       try {
//         const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
//         setUser({
//           id: parsedUserInfo?.id || "unknown",
//           name: parsedUserInfo?.name || "User",
//           email: parsedUserInfo?.email || "",
//           role: role,
//         });
//       } catch (error) {
//         console.error("Error parsing user info:", error);
//         logout();
//       }
//     }
//     setIsLoading(false);
//   }, []);

//   useEffect(() => {
//     checkAuthStatus();
//   }, [checkAuthStatus]);

//   const login = (token: string, userRole: string, userInfo: unknown) => {
//     localStorage.setItem("accessToken", token);
//     localStorage.setItem("role", userRole);
//     localStorage.setItem("userInfo", JSON.stringify(userInfo));

//     const typedUserInfo = userInfo as User;
//     setUser({
//       id: typedUserInfo.id,
//       name: typedUserInfo.name,
//       email: typedUserInfo.email,
//       role: userRole,
//     });
//   };

//   const logout = () => {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("role");
//     localStorage.removeItem("userInfo");
//     setUser(null);
//   };

//   const isAuthenticated = !!user;
//   const isAdmin = user?.role === "admin";
//   const isCustomer = user?.role === "customer";
//   const isManager = user?.role === "manager";

//   return {
//     user,
//     isAuthenticated,
//     isAdmin,
//     isCustomer,
//     isManager,
//     isLoading,
//     login,
//     logout,
//     checkAuthStatus,
//   };
// };
