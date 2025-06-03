import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, ChevronRight } from 'react-feather'; 
import './CustomerLayout.css';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ 
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Xác định active menu dựa trên URL hiện tại
  const getActiveMenuItem = () => {
    const path = location.pathname;
    if (path === '/customer' || path === '/customer/') return "Trang chủ";
    if (path.includes('/customer/profile')) return "Hồ sơ";
    if (path.includes('/customer/medical-history')) return "Tiền sử y tế";
    if (path.includes('/customer/treatment-plan')) return "Kế hoạch điều trị";
    if (path.includes('/customer/schedule')) return "Lịch điều trị";
    if (path.includes('/customer/prescription')) return "Đơn thuốc";
    if (path.includes('/customer/reviews')) return "Đánh giá";
    if (path.includes('/customer/contact')) return "Liên hệ bác sĩ";
    return "Trang chủ";
  };

  const [activeMenuItem, setActiveMenuItem] = useState(getActiveMenuItem());

  const menuItems = [
    { id: 1, name: "Trang chủ", label: "Trang chủ", icon: "🏠", path: "/customer" },
    { id: 2, name: "Hồ sơ", label: "Hồ sơ", icon: "👤", path: "/customer/profile" },
    { id: 3, name: "Tiền sử y tế", label: "Tiền sử y tế", icon: "📋", path: "/customer/medical-history" },
    { id: 4, name: "Kế hoạch điều trị", label: "Kế hoạch điều trị", icon: "📅", path: "/customer/treatment-plan" },
    { id: 5, name: "Lịch điều trị", label: "Lịch điều trị", icon: "🗓️", path: "/customer/schedule" },
    { id: 6, name: "Đơn thuốc", label: "Đơn thuốc", icon: "💊", path: "/customer/prescription" },
    { id: 7, name: "Đánh giá", label: "Đánh giá", icon: "⭐", path: "/customer/reviews" },
    { id: 8, name: "Liên hệ bác sĩ", label: "Liên hệ bác sĩ", icon: "📞", path: "/customer/contact" }
  ];

  // Lấy thông tin user từ localStorage
  const getUserData = () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return {
          name: parsed.name || "Nguyễn Thị Lan",
          email: parsed.email || "lan.nguyen@email.com",
          avatar: parsed.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=80&h=80&fit=crop&crop=face&auto=format"
        };
      }
    } catch (error) {
      console.error("Error parsing user info:", error);
    }
    
    return {
      name: "Nguyễn Thị Lan",
      email: "lan.nguyen@email.com", 
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=80&h=80&fit=crop&crop=face&auto=format"
    };
  };

  const userData = getUserData();

  // Tạo breadcrumb dựa trên active menu
  const getBreadcrumb = () => {
    return ["Trang chủ", activeMenuItem].filter((item, index, arr) => 
      item !== "Trang chủ" || index === 0 || arr.length === 1
    );
  };

  const breadcrumb = getBreadcrumb();

  const handleMenuClick = (itemId: number, itemLabel: string) => {
    const selectedItem = menuItems.find(item => item.id === itemId);
    if (selectedItem) {
      setActiveMenuItem(itemLabel);
      navigate(selectedItem.path);
    }
  };

  const handleLogout = () => {
    // Xóa thông tin đăng nhập
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userInfo");
    
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
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#00B4C6"/>
              <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="white"/>
              <circle cx="16" cy="16" r="4" fill="#00B4C6"/>
            </svg>
          </div>
          <span className="logo-text">HealthCare</span>
        </div>

        {/* User Info */}
        <div className="user-info">
          <div className="user-avatar">
            <img 
              src={userData.avatar}
              alt="User Avatar"
            />
          </div>
          <div className="user-details">
            <div className="user-name">{userData.name}</div>
            <div className="user-email">{userData.email}</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => {
              const isActive = activeMenuItem === item.label;
              
              return (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleMenuClick(item.id, item.label)}
                  >
                    <span className="nav-icon">{item.icon}</span>
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

        {/* Page Title */}
        {/* <div className="page-header">
          <h1 className="page-title">{activeMenuItem}</h1>
        </div> */}

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;