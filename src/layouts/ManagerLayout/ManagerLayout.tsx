import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LogOut, ChevronRight } from "react-feather";
import "./ManagerLayout.css";
import logo from "../../assets/mirava-logo.png";
import { userServ } from "@/services/userServie";
interface ManagerLayoutProps {
  children: React.ReactNode;
}

const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định active menu dựa trên URL hiện tại
  const getActiveMenuItem = () => {
    const path = location.pathname;
    if (path === "/manager" || path === "/manager/") return "Dashboard";
    if (path.includes("/manager/doctors")) return "Quản lý bác sĩ";
    if (path.includes("/manager/doctor-schedule-management"))
      return "Quản lý lịch làm việc";
    if (path.includes("/manager/treatments")) return "Quản lý điều trị";
    if (path.includes("/manager/orders")) return "Quản lý đơn hàng";
    if (path.includes("/manager/reports")) return "Báo cáo thống kê";
    return "Dashboard";
  };

  const [activeMenuItem, setActiveMenuItem] = useState(getActiveMenuItem());

  const menuItems = [
    { id: 1, name: "Dashboard", label: "Dashboard", path: "/manager" },
    {
      id: 2,
      name: "Quản lý bác sĩ",
      label: "Quản lý bác sĩ",
      path: "/manager/doctors",
    },
    {
      id: 3,
      name: "Quản lý lịch làm việc",
      label: "Quản lý lịch làm việc",
      path: "/manager/doctor-schedule-management",
    },
    {
      id: 4,
      name: "Quản lý điều trị",
      label: "Quản lý điều trị",
      path: "/manager/treatments",
    },
    {
      id: 5,
      name: "Quản lý đơn hàng",
      label: "Quản lý đơn hàng",
      path: "/manager/orders",
    },
    {
      id: 6,
      name: "Báo cáo thống kê",
      label: "Báo cáo thống kê",
      path: "/manager/reports",
    },
    {
      id: 7,
      name: "Quản lý đăng ký xét nghiệm",
      label: "Quản lý xét nghiệm",
      path: "/manager/test-register",
    },

    {
      id: 8,
      name: "Quản lý Tư Vấn",
      label: "Quản lý tư vấn",
      path: "/manager/advise",
    },
    { id: 9, name: "Hồ sơ", label: "Hồ sơ", path: "/manager/profile" },
  ];

  // Tạo breadcrumb dựa trên active menu
  const getBreadcrumb = () => {
    return ["Dashboard", activeMenuItem].filter(
      (item, index, arr) =>
        item !== "Dashboard" || index === 0 || arr.length === 1
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
    <div className="admin-layout">
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

export default ManagerLayout;
// Đổi tên file thành ManagerLayout.tsx khi sử dụng cho manager
