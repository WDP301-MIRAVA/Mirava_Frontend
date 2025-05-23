import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const isAuthenticated = localStorage.getItem("accessToken") !== null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/home" />;
};

export default PrivateRoute;
