import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home/home";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/Login/login";
import RegisterPage from "../pages/Register/register";
import PrivateRoute from "../utils/PrivateRoute";
import Homepage from "../pages/Homepage/homepage";
import Intropage from "../pages/IntroPage/introPage";
import SearchResult from "../pages/SearchResult/searchresult";
import Appointment from "@/pages/Appointment/appointment";
import AppointmentPage from "@/pages/Users/AppointmentPage";
import PersonalInfoPage from "@/pages/Users/PersonalInfoPage";

const MainRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/home" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/intro" element={<Intropage />} />
      <Route path="/searchresult" element={<SearchResult />} />

      {/* Protected Routes */}
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/user/appointment" element={<AppointmentPage />} />
      <Route path="/profile" element={<PersonalInfoPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          {/* Thêm các route khác cần bảo vệ ở đây */}
        </Route>
      </Route>
    </Routes>
  );
};

export default MainRouter;
