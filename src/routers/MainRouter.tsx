import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/Login/login";
import RegisterPage from "../pages/Register/register";
import Homepage from "../pages/Homepage/homepage";
import SearchResult from "../pages/SearchResult/searchresult";
import DetailDoctor from "@/pages/DetailDoctor/detailDoctorPage";
import PrivateRoute from "../utils/PrivateRoute";

// Layouts
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
import CustomerLayout from "@/layouts/CustomerLayout/CustomerLayout";
import DoctorLayout from "@/layouts/DoctorLayout/DoctorLayout";
import ManagerLayout from "@/layouts/ManagerLayout/ManagerLayout";

// Public pages
import BlogList from "@/pages/BlogList/BlogList";
import DetailBlog from "@/pages/DetailBlog/DetailBlog";
import IUIIVFServices from "@/pages/IVFIUIService/IUIIVFServices";
import CheckoutPage from "@/pages/IVFIUIService/CheckOutPage";
import PaymentConfirmation from "@/pages/IVFIUIService/PaymentConfirmation";
import PaymentSuccess from "@/pages/Payment/PaymentSuccess";
import PaymentFailed from "@/pages/Payment/PaymentFailed";
import DetailServices from "@/pages/IVFIUIService/DetailServices";
import TestPackageDetail from "@/pages/ReproductiveHealthTesting/TestPackageDetail";
import CheckOutPage from "@/pages/ReproductiveHealthTesting/CheckOutPage";
import CartPage from "@/pages/Cart/CartPage";
import UnifiedCheckOutPage from "@/pages/UnifiedCheckOutPage/UnifiedCheckOutPage";

// Customer pages
import ResultTest from "@/pages/Customer/ResultTest/ResultTest";
import PersonalInfoPage from "@/pages/Users/PersonalInfoPage";
import AppointmentPage from "@/pages/Users/AppointmentPage";
import TreatmentPlan from "@/pages/Customer/TreatmentPlan/TreatmentPlan";
import ContactDoctor from "@/pages/Customer/ContactDoctor/ContactDoctor";
import ReproductiveHealthTesting from "@/pages/ReproductiveHealthTesting/ReproductiveHealthTesting";
import MedicalHistoryCustomer from "@/pages/Customer/MedicalHistory/MedicalHistory";
import OrderHistory from "@/pages/Customer/Orders/OrderHistory";

// Admin pages
import UserManagement from "@/pages/Admin/UserManagement/UserManagement";
import DoctorManagement from "@/pages/Admin/DoctorManagement/DoctorManagement";

// Doctor pages
import DoctorAppoitment from "@/pages/Doctor/ViewAppoitment";
import TreatmentPlans from "@/pages/Doctor/TreatmentPlans/TreatmentPlans";
import Schedules from "@/pages/Doctor/Schedules/Schedules";
import PatientList from "@/pages/Doctor/Patients/PatientList";
import IVFTreatmentTracker from "@/pages/Doctor/Patients/IVFTreatmentTracker";
import ViewAppointment from "@/pages/Doctor/ViewAppoitment";
import MedicalRecordManagement from "@/pages/Doctor/MedicalRecordManagement/MedicalRecordManagement";
import ContactPatient from "@/pages/Doctor/Patients/ContactPatient/ContactPatient";
import TestResults from "@/pages/Doctor/ResultTest/ResultTest";
import MedicalHistoryDoctor from "@/pages/Doctor/MedicalHistory/MedicalHistory";

// Manager pages
import OrderManagement from "@/pages/Manager/OrderManagement/OrderManagement";
import ManagerDashboard from "@/pages/Manager/ManagerDashboard/ManagerDashboard";
import DoctorScheduleManagement from "@/pages/Manager/DoctorScheduleManagement/DoctorScheduleManagement";
import ManagerDoctor from "@/pages/Manager/ManagerDoctor/ManagerDoctor";
import CreateFeedback from "@/pages/Customer/Feedback/CreateFeedback/CreateFeedback";
import ListFeedback from "@/pages/Customer/Feedback/ListFeedback/ListFeedback";
import FeedbackManagement from "@/pages/Admin/Feedback/FeedbackManagement/FeedbackManagement";
import ManagerTreatment from "@/pages/Manager/ManagerTreatment/ManagerTreatment";
import ManagerTestRegister from "@/pages/Manager/ManagerTestRegister/ManagerTestRegister";
import AdminBlogManagement from "@/pages/Admin/BlogManagement/BlogManagement";
import DoctorScheduleManager from "@/pages/Manager/DoctorScheduleManager";
import AdviseManagement from "@/pages/Manager/AdviseManagement/AdviseManagement";
import Dashboard from "@/pages/Admin/Dashboard/Dashboard";
import TestPackagePage from "@/pages/Admin/TestPackage/TestPackage";
const MainRouter = () => {
  return (
    <Routes>
      {/* 🌐 Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/searchresult" element={<SearchResult />} />
      <Route path="/detaildoctor/:id" element={<DetailDoctor />} />
      <Route path="/bloglist" element={<BlogList />} />
      <Route path="/blog/:id" element={<DetailBlog />} />
      <Route path="/user/appointment" element={<AppointmentPage />} />
      <Route path="/profile" element={<PersonalInfoPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/checkout/failed" element={<PaymentFailed />} />
      <Route path="/iui-ivf-services" element={<IUIIVFServices />} />
      <Route path="/detail-services/:id" element={<DetailServices />} />
      <Route path="/checkout/:serviceId" element={<CheckoutPage />} />
      <Route path="/test-services" element={<ReproductiveHealthTesting />} />
      <Route
        path="/doctor-schedule-management"
        element={<DoctorScheduleManagement />}
      />
      <Route path="/manager-dashboard" element={<ManagerDashboard />} />

      <Route
        path="/checkout/paymentConfirm"
        element={<PaymentConfirmation />}
      />
      <Route path="/test-package-detail/:id" element={<TestPackageDetail />} />
      <Route path="/checkout-page" element={<CheckOutPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/unified-checkout" element={<UnifiedCheckOutPage />} />

      {/* 🏥 Protected Routes */}
      {/* 👤 Customer Protected Routes */}
      <Route
        element={
          <PrivateRoute allowedRole="Customer" layout={CustomerLayout} />
        }
      >
        <Route path="/customer" element={<ResultTest />} />
        <Route path="/customer/profile" element={<PersonalInfoPage />} />
        <Route path="/customer/treatmentplan" element={<TreatmentPlan />} />
        <Route path="/customer/contact" element={<ContactDoctor />} />
        <Route path="/customer/orders" element={<OrderHistory />} />
        <Route path="/customer/feedback" element={<CreateFeedback />} />
        <Route path="/customer/list-feedback" element={<ListFeedback />} />
        <Route
          path="/customer/medical-history"
          element={<MedicalHistoryCustomer />}
        />
      </Route>

      {/* 🛠 Admin Protected Routes */}
      <Route
        element={<PrivateRoute allowedRole="Admin" layout={AdminLayout} />}
      >
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/profile" element={<PersonalInfoPage />} />
        <Route path="/admin/usermanagement" element={<UserManagement />} />
        <Route path="/admin/doctors" element={<DoctorManagement />} />
        <Route path="/admin/admin-feedback" element={<FeedbackManagement />} />
        <Route path="/admin/blog" element={<AdminBlogManagement />} />
        <Route path="/admin/test-package" element={<TestPackagePage />} />
      </Route>

      {/* 🩺 Doctor Protected Routes */}
      <Route
        element={<PrivateRoute allowedRole="Doctor" layout={DoctorLayout} />}
      >
        <Route path="/doctor" element={<DoctorAppoitment />} />
        <Route path="/doctor/profile" element={<PersonalInfoPage />} />
        <Route path="/doctor/treatment-plans" element={<TreatmentPlans />} />
        <Route path="/doctor/schedules/:id?" element={<Schedules />} />
        <Route path="/doctor/patients" element={<PatientList />} />
        <Route path="/doctor/patients/:id" element={<PatientList />} />
        <Route
          path="/doctor/medical-history"
          element={<MedicalHistoryDoctor />}
        />
        <Route
          path="/doctor/patients/ivf-tracker"
          element={<IVFTreatmentTracker />}
        />
        <Route path="/doctor/appointments" element={<ViewAppointment />} />
        <Route
          path="/doctor/medicalrecord"
          element={<MedicalRecordManagement />}
        />
        <Route path="/doctor/test-results" element={<TestResults />} />
        <Route path="/doctor/contact" element={<ContactPatient />} />
      </Route>

      {/* 🧑‍💼 Manager Protected Routes */}
      <Route
        element={<PrivateRoute allowedRole="Manager" layout={ManagerLayout} />}
      >
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/profile" element={<PersonalInfoPage />} />
        <Route
          path="/manager/doctor-schedule-management"
          element={<DoctorScheduleManager />}
        />
        <Route path="/manager/orders" element={<OrderManagement />} />
        <Route path="/manager/doctors" element={<ManagerDoctor />} />
        <Route path="/manager/treatments" element={<ManagerTreatment />} />
        {/* <Route
          path="/manager/test-register"
          element={<ManagerTestRegister />}
        /> */}
        <Route path="/manager/advise" element={<AdviseManagement />} />
      </Route>

      {/* Not Found */}
      <Route path="*" element={<Homepage />} />
    </Routes>
  );
};

export default MainRouter;
