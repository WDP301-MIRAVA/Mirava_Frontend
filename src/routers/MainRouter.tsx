import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/Login/login";
import RegisterPage from "../pages/Register/register";
import Homepage from "../pages/Homepage/homepage";
import Intropage from "../pages/IntroPage/introPage";
import SearchResult from "../pages/SearchResult/searchresult";
import Appointment from "@/pages/Appointment/appointment";
import DetailDoctor from "@/pages/DetailDoctor/detailDoctorPage";
import PrivateRoute from "../utils/PrivateRoute";
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
import CustomerLayout from "@/layouts/CustomerLayout/CustomerLayout";
import CustomerHome from "@/pages/Customer/Home/Home";
import TreatmentPlan from "@/pages/Customer/TreatmentPlan/TreatmentPlan";
import DoctorLayout from "@/layouts/DoctorLayout/DoctorLayout";
import DoctorAppoitment from "../pages/Doctor/ViewAppoitment";
import BlogList from "@/pages/BlogList/BlogList";
import DetailBlog from "@/pages/DetailBlog/DetailBlog";
import IUIIVFServices from "@/pages/IVFIUIService/IUIIVFServices";
import TreatmentPlans from "../pages/Doctor/TreatmentPlans/TreatmentPlans";
import Schedules from "@/pages/Doctor/Schedules/Schedules";
import AppointmentPage from "@/pages/Users/AppointmentPage";
import PersonalInfoPage from "@/pages/Users/PersonalInfoPage";
import PatientList from "@/pages/Doctor/Patients/PatientList";
import IVFTreatmentTracker from "@/pages/Doctor/Patients/IVFTreatmentTracker";

import UserManagement from "@/pages/Admin/UserManagement/UserManagement";
import DoctorManagement from "@/pages/Admin/DoctorManagement/DoctorManagement";
import CheckoutPage from "@/pages/IVFIUIService/CheckOutPage";
import ViewAppointment from "../pages/Doctor/ViewAppoitment";
import DetailServices from "@/pages/IVFIUIService/DetailServices";
import MedicalRecordManagement from "@/pages/Doctor/MedicalRecordManagement/MedicalRecordManagement";
import DoctorScheduleManagement from "@/pages/Manager/DoctorScheduleManagement/DoctorScheduleManagement";
import ManagerDashboard from "@/pages/Manager/ManagerDashboard/ManagerDashboard";
import PaymentConfirmation from "@/pages/IVFIUIService/PaymentConfirmation";
import PaymentSuccess from "@/pages/Payment/PaymentSuccess";
import PaymentFailed from "@/pages/Payment/PaymentFailed";
import ContactDoctor from "@/pages/Customer/ContactDoctor/ContactDoctor";
import ContactPatient from "@/pages/Doctor/Patients/ContactPatient/ContactPatient";
import MedicalHistory from "@/pages/Customer/MedicalHistory/MedicalHistory";
import TreatmentSchedule from "@/pages/Customer/TreatmentSchedule/TreatmentSchedule";
const MainRouter = () => {
  return (
    <Routes>
      {/* Public Routes - Các route công khai, ai cũng truy cập được */}
      <Route path="/" element={<Homepage />} />
      <Route path="/home" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/intro" element={<Intropage />} />
      <Route path="/searchresult" element={<SearchResult />} />
      <Route path="/detaildoctor/:id" element={<DetailDoctor />} />
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/bloglist" element={<BlogList />} />
      <Route path="/blog/:id" element={<DetailBlog />} />
      <Route path="/user/appointment" element={<AppointmentPage />} />
      <Route path="/profile" element={<PersonalInfoPage />} />
      <Route path="/checkout/success" element={<PaymentSuccess />} />
      <Route path="/checkout/failed" element={<PaymentFailed />} />

      <Route path="/iui-ivf-services" element={<IUIIVFServices />} />
      <Route path="/detail-services/:id" element={<DetailServices />} />
      <Route path="/checkout/:serviceId" element={<CheckoutPage />} />

      <Route
        path="/doctor-schedule-management"
        element={<DoctorScheduleManagement />}
      />
      <Route path="/manager-dashboard" element={<ManagerDashboard />} />

      <Route
        path="/checkout/paymentConfirm"
        element={<PaymentConfirmation />}
      />
      {/* Customer Public Routes - Các route công khai dành cho customer */}

      {/* Customer Protected Routes - Chỉ customer mới truy cập được */}
      <Route
        path="/customer/*"
        element={
          <PrivateRoute allowedRole="Customer" layout={CustomerLayout}>
            <Routes>
              <Route index element={<CustomerHome />} />
              <Route path="/profile" element={<PersonalInfoPage />} />
              {/* Thêm các route khác cho customer ở đây */}
              <Route path="/treatmentplan" element={<TreatmentPlan />} />
              <Route path="/contact" element={<ContactDoctor />} />
              <Route path="/schedule" element={<TreatmentSchedule />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Admin Protected Routes - Chỉ admin mới truy cập được */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRole="Admin" layout={AdminLayout}>
            <Routes>
              <Route index element={<div>Admin Dashboard</div>} />
              <Route path="/profile" element={<PersonalInfoPage />} />
              <Route path="/usermanagement" element={<UserManagement />} />
              <Route path="/doctors" element={<DoctorManagement />} />

              {/* <Route path="users" element={<ManageUsers />} /> */}
              {/* <Route path="doctors" element={<ManageDoctors />} /> */}
              {/* Thêm các route khác cho admin ở đây */}
            </Routes>
          </PrivateRoute>
        }
      />

      <Route
        path="/doctor/*"
        element={
          <PrivateRoute allowedRole="Doctor" layout={DoctorLayout}>
            <Routes>
              <Route index element={<DoctorAppoitment />} />
              <Route path="/profile" element={<PersonalInfoPage />} />
              <Route path="/treatment-plans" element={<TreatmentPlans />} />
              <Route path="/schedules/:id?" element={<Schedules />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/:id" element={<PatientList />} />

              <Route
                path="/patients/ivf-tracker"
                element={<IVFTreatmentTracker />}
              />

              <Route path="/appointments" element={<ViewAppointment />} />
              <Route
                path="/medicalrecord"
                element={<MedicalRecordManagement />}
              />
              <Route path="contact" element={<ContactPatient />} />
              {/* Thêm các route khác cho doctor ở đây */}
            </Routes>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Homepage />} />
    </Routes>
  );
};

export default MainRouter;
