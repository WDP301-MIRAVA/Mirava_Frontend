import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LogOut, ChevronRight } from "react-feather";
import "./DoctorLayout.css";
import logo from "../../assets/mirava-logo.png";
import { userServ } from "@/services/userServie";
interface DoctorLayoutProps {
  children: React.ReactNode;
}

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định active menu dựa trên URL hiện tại
  const getActiveMenuItem = () => {
    const path = location.pathname;
    if (path === "/doctor" || path === "/doctor/") return "Trang chủ";
    if (path.includes("/doctor/patients")) return "Bệnh nhân";
    if (path.includes("/doctor/treatment-plans")) return "Kế hoạch điều trị";
    if (path.includes("/doctor/prescriptions")) return "Kê đơn thuốc";
    // if (path.includes("/doctor/medicalrecord")) return "Hồ sơ y tế";
    if (path.includes("/doctor/schedule")) return "Lịch làm việc";
    if (path.includes("/doctor/contact")) return "Liên hệ";
    if (path.includes("/doctor/reports")) return "Báo cáo";
    if (path.includes("/doctor/profile")) return "Hồ sơ";
    if (path.includes("/doctor/medical-history")) return "Tiền sử y tế";
    if (path.includes("/doctor/test-results")) return "Kết quả xét nghiệm";
    return "Trang chủ";
  };

  const [activeMenuItem, setActiveMenuItem] = useState(getActiveMenuItem());

  const menuItems = [
    { id: 1, name: "Trang chủ", label: "Trang chủ", path: "/doctor" },
    { id: 3, name: "Bệnh nhân", label: "Bệnh nhân", path: "/doctor/patients" },

    // {
    //   id: 5,
    //   name: "Kế hoạch điều trị",
    //   label: "Tạo kế hoạch điều trị",
    //   path: "/doctor/treatment-plans",
    // },
    // {
    //   id: 7,
    //   name: "Hồ sơ y tế",
    //   label: "Hồ sơ y tế",
    //   path: "/doctor/medicalrecord",
    // },
    {
      id: 8,
      name: "Lịch làm việc",
      label: "Lịch làm việc",
      path: "/doctor/schedules",
    },
    {
      id: 9,
      name: "Tiền sử y tế",
      label: "Tiền sử y tế",
      path: "/doctor/medical-history",
    },
    {
      id: 10,
      name: "Liên hệ",
      label: "Liên hệ",
      path: "/doctor/contact",
    },
    {
      id: 11,
      name: "Kết quả xét nghiệm",
      label: "Kết quả xét nghiệm",
      path: "/doctor/test-results",
    },

    { id: 2, name: "Hồ sơ", label: "Hồ sơ", path: "/doctor/profile" },
  ];

  // Tạo breadcrumb dựa trên active menu
  const getBreadcrumb = () => {
    return ["Trang chủ", activeMenuItem].filter(
      (item, index, arr) =>
        item !== "Trang chủ" || index === 0 || arr.length === 1
    );
  };

  const breadcrumb = getBreadcrumb();

  const handleMenuClick = (itemId: number, itemLabel: string) => {
    const selectedItem = menuItems.find((item) => item.id === itemId);
    if (selectedItem) {
      setActiveMenuItem(itemLabel);
      navigate(selectedItem.path);
    }
  };

  const handleLogout = () => {
    // Gọi API logout
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      userServ
        .postLogout(localStorage.getItem("refreshToken") || "", accessToken)
        .then(() => {
          console.log("Đăng xuất thành công");
        })
        .catch((error) => {
          console.error("Lỗi khi đăng xuất:", error);
        });
    }
    // Xóa thông tin đăng nhập khỏi localStorage
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userInfo");
    // Xóa thông tin đăng nhập khỏi sessionStorage
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userInfo");
    // Chuyển về trang home
    navigate("/");
  };

  return (
    <div className="doctor-layout">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src={logo} alt="Mirava Logo" className="logo-image" />
          </div>
          <span className="logo-text">Mirava</span>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => {
              const isActive = activeMenuItem === item.label;

              return (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${isActive ? "active" : ""}`}
                    onClick={() => handleMenuClick(item.id, item.label)}
                  >
                    <span className="nav-text">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut className="logout-icon" size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <div className="breadcrumb">
            {breadcrumb.map((crumb, index) => (
              <span key={index} className="breadcrumb-item">
                {crumb}
                {index < breadcrumb.length - 1 && (
                  <ChevronRight className="breadcrumb-separator" size={16} />
                )}
              </span>
            ))}
          </div>
          <div className="topbar-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">5</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default DoctorLayout;
