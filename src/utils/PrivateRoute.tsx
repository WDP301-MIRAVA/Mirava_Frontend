import { Navigate, Outlet } from "react-router-dom";
import { decodeToken } from "./Decodejwt";

interface PrivateRouteProps {
  allowedRole: string;
  layout: React.ComponentType<{ children: React.ReactNode }>;
}

const PrivateRoute = ({
  allowedRole,
  layout: LayoutComponent,
}: PrivateRouteProps) => {
  const accessToken = localStorage.getItem("accessToken");
  const role = decodeToken(accessToken ?? "").role;

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
      <Outlet />
    </LayoutComponent>
  );
};

export default PrivateRoute;
