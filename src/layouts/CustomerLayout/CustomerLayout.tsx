import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LogOut, ChevronRight } from "react-feather";
import "./CustomerLayout.css";
import logo from "../../assets/mirava-logo.png";
import { userServ } from "@/services/userServie";
import { Outlet } from "react-router-dom";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Notification state
  const [notifications, setNotifications] = useState<
    { id: string; message: string; read: boolean; time: string }[]
  >([]);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);

  // Lắng nghe sự kiện thông báo từ các trang con
  useEffect(() => {
    const handler = (e: any) => {
      setNotifications((prev) => [e.detail, ...prev]);
    };
    window.addEventListener("mirava-notification", handler);
    return () => window.removeEventListener("mirava-notification", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenNotifications = () => {
    setShowNotificationDropdown((open) => !open);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Xác định active menu dựa trên URL hiện tại
  const getActiveMenuItem = () => {
    const path = location.pathname;
    if (path === "/customer" || path === "/customer/")
      return "Kết quả xét nghiệm";
    if (path.includes("/customer/profile")) return "Hồ sơ";
    if (path.includes("/customer/medical-history")) return "Tiền sử y tế";
    if (path.includes("/customer/treatmentplan")) return "Kế hoạch điều trị";
    if (path.includes("/customer/schedule")) return "Lịch điều trị";
    if (path.includes("/customer/prescription")) return "Đơn thuốc";
    if (path.includes("/customer/list-feedback")) return "Đánh giá";
    if (path.includes("/customer/contact")) return "Liên hệ bác sĩ";
    if (path.includes("/customer/orders")) return "Đơn hàng";
    return "Trang chủ";
  };

  const [activeMenuItem, setActiveMenuItem] = useState(getActiveMenuItem());

  const menuItems = [
    {
      id: 1,
      name: "Kết quả xét nghiệm",
      label: "Kết quả xét nghiệm",
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
      path: "/customer/list-feedback",
    },
    {
      id: 6,
      name: "Liên hệ bác sĩ",
      label: "Liên hệ bác sĩ",
      path: "/customer/contact",
    },

    {
      id: 7,
      name: "Đơn hàng",
      label: "Đơn hàng",
      path: "/customer/orders",
    },
    {
      id: 8,
      name: "Tiền sư y tế",
      label: "Tiền sử y tế",
      path: "/customer/medical-history",
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
          <div className="topbar-actions" style={{ position: "relative" }}>
            <button
              className="notification-btn"
              onClick={handleOpenNotifications}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {showNotificationDropdown && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 36,
                  width: 320,
                  background: "white",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  borderRadius: 8,
                  zIndex: 100,
                  maxHeight: 350,
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #eee",
                    fontWeight: 600,
                  }}
                >
                  Thông báo nhắc nhở
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: 16, color: "#888" }}>
                    Không có thông báo mới
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        background: n.read ? "#fff" : "#f0f9ff",
                        fontSize: 15,
                      }}
                    >
                      <div style={{ marginBottom: 4 }}>{n.message}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {n.time}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {" "}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
