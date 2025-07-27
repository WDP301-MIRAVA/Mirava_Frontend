import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LogOut, ChevronRight } from "react-feather";
import "./AdminLayout.css";
import logo from "../../assets/mirava-logo.png";
import { userServ } from "@/services/userServie";
interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định active menu dựa trên URL hiện tại
  const getActiveMenuItem = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") return "Dashboard";
    if (path.includes("/admin/usermanagement")) return "Quản lý người dùng";
    if (path.includes("/admin/order")) return "Quản lý đơn hàng";
    if (path.includes("/admin/appointments")) return "Quản lý lịch hẹn";
    if (path.includes("/admin/test-package")) return "Quản lý gói điều trị";
    if (path.includes("/admin/prescriptions")) return "Danh sách đăng ký khám";
    if (path.includes("/admin/blog")) return "Quản lý bài viết";
    if (path.includes("/admin/admin-feedback")) return "Quản lý đánh giá";
    if (path.includes("/admin/profile")) return "Hồ sơ";
    return "Dashboard";
  };

  const [activeMenuItem, setActiveMenuItem] = useState(getActiveMenuItem());

  const menuItems = [
    { id: 1, name: "Dashboard", label: "Dashboard", path: "/admin" },
    {
      id: 2,
      name: "Quản lý người dùng",
      label: "Quản lý người dùng",
      path: "/admin/usermanagement",
    },

    {
      id: 5,
      name: "Quản lý gói điều trị",
      label: "Quản lý gói điều trị",
      path: "/admin/test-package",
    },

    {
      id: 7,
      name: "Quản lý bài viết",
      label: "Quản lý bài viết",
      path: "/admin/blog",
    },
    {
      id: 8,
      name: "Quản lý đánh giá",
      label: "Quản lý đánh giá",
      path: "/admin/admin-feedback",
    },
    { id: 9, name: "Hồ sơ", label: "Hồ sơ", path: "/admin/profile" },
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
    console.log({ selectedItem });
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

export default AdminLayout;
