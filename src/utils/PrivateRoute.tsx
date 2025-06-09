import { Navigate } from "react-router-dom";
import { decodeToken } from "./Decodejwt";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRole: string;
  layout: React.ComponentType<{ children: React.ReactNode }>;
}

const PrivateRoute = ({ children, allowedRole, layout: LayoutComponent }: PrivateRouteProps) => {
  const accessToken = localStorage.getItem("accessToken");
 const role = decodeToken(accessToken ?? "").role

  // Kiểm tra xem user đã đăng nhập và có đúng role không
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/home" replace />;
  }

  // Nếu hợp lệ, render layout với children bên trong
  return (
    <LayoutComponent>
      {children}
    </LayoutComponent>
  );
};

export default PrivateRoute;