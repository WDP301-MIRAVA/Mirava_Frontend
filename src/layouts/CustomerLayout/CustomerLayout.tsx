import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LogOut, ChevronRight } from "react-feather";
import "./CustomerLayout.css";
import logo from "../../assets/mirava-logo.png";
import { userServ } from "@/services/userServie";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định active menu dựa trên URL hiện tại
  const getActiveMenuItem = () => {
    const path = location.pathname;
    if (path === "/customer" || path === "/customer/") return "Trang chủ";
    if (path.includes("/customer/profile")) return "Hồ sơ";
    if (path.includes("/customer/medical-history")) return "Tiền sử y tế";
    if (path.includes("/customer/treatmentplan")) return "Kế hoạch điều trị";
    if (path.includes("/customer/schedule")) return "Lịch điều trị";
    if (path.includes("/customer/prescription")) return "Đơn thuốc";
    if (path.includes("/customer/reviews")) return "Đánh giá";
    if (path.includes("/customer/contact")) return "Liên hệ bác sĩ";
    return "Trang chủ";
  };

  const [activeMenuItem, setActiveMenuItem] = useState(getActiveMenuItem());

  const menuItems = [
    {
      id: 1,
      name: "Trang chủ",
      label: "Trang chủ",
      path: "/customer",
    },
    {
      id: 2,
      name: "Hồ sơ Bệnh nhân",
      label: "Hồ sơ Bệnh nhân",
      path: "/customer/profile",
    },

    {
      id: 3,
      name: "Kế hoạch điều trị",
      label: "Kế hoạch điều trị",
      path: "/customer/treatmentplan",
    },
    {
      id: 4,
      name: "Lịch điều trị",
      label: "Lịch điều trị",
      path: "/customer/schedule",
    },

    {
      id: 5,
      name: "Đánh giá",
      label: "Đánh giá",
      path: "/customer/reviews",
    },
    {
      id: 6,
      name: "Liên hệ bác sĩ",
      label: "Liên hệ bác sĩ",
      path: "/customer/contact",
    },
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
    localStorage.removeItem("patientId");
    // Xóa thông tin đăng nhập khỏi sessionStorage
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userInfo");
    // Chuyển về trang home
    navigate("/home");
  };

  return (
    <div className="customer-layout">
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
              <span className="notification-badge">3</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default CustomerLayout;
