import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          role: role
        });
      } catch (error) {
        console.error("Error parsing user info:", error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = (token: string, userRole: string, userInfo: unknown) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("role", userRole);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    
    const typedUserInfo = userInfo as User;
    setUser({
      id: typedUserInfo.id,
      name: typedUserInfo.name,
      email: typedUserInfo.email,
      role: userRole
    });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";

  return {
    user,
    isAuthenticated,
    isAdmin,
    isCustomer,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };
};