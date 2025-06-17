import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, ChevronRight } from 'react-feather'; 
import './AdminLayout.css';
import logo from '../../assets/mirava-logo.png'; 

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Xác định active menu dựa trên URL hiện tại
  const getActiveMenuItem = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return "Dashboard";
    if (path.includes('/admin/users')) return "Quản lý người dùng";
    if (path.includes('/admin/doctors')) return "Quản lý bác sĩ";
    if (path.includes('/admin/appointments')) return "Quản lý lịch hẹn";
    if (path.includes('/admin/treatments')) return "Quản lý điều trị";
    if (path.includes('/admin/prescriptions')) return "Quản lý đơn thuốc";
    if (path.includes('/admin/reports')) return "Báo cáo thống kê";
    if (path.includes('/admin/settings')) return "Cài đặt hệ thống";
    if (path.includes('/admin/audit')) return "Nhật ký hệ thống";
    return "Dashboard";
  };

  const [activeMenuItem, setActiveMenuItem] = useState(getActiveMenuItem());

  const menuItems = [
    { id: 1, name: "Dashboard", label: "Dashboard", icon: "📊", path: "/admin" },
    { id: 2, name: "Quản lý người dùng", label: "Quản lý người dùng", icon: "👥", path: "/admin/users" },
    { id: 3, name: "Quản lý bác sĩ", label: "Quản lý bác sĩ", icon: "👨‍⚕️", path: "/admin/doctors" },
    { id: 4, name: "Quản lý lịch hẹn", label: "Quản lý lịch hẹn", icon: "📅", path: "/admin/appointments" },
    { id: 5, name: "Quản lý điều trị", label: "Quản lý điều trị", icon: "🏥", path: "/admin/treatments" },
    { id: 6, name: "Quản lý đơn thuốc", label: "Quản lý đơn thuốc", icon: "💊", path: "/admin/prescriptions" },
    { id: 7, name: "Báo cáo thống kê", label: "Báo cáo thống kê", icon: "📈", path: "/admin/reports" },
    { id: 8, name: "Cài đặt hệ thống", label: "Cài đặt hệ thống", icon: "⚙️", path: "/admin/settings" },
    { id: 9, name: "Hồ sơ", label: "Hồ sơ", icon: "👤", path: "/admin/profile" }
  ];

  // Tạo breadcrumb dựa trên active menu
  const getBreadcrumb = () => {
    return ["Dashboard", activeMenuItem].filter((item, index, arr) => 
      item !== "Dashboard" || index === 0 || arr.length === 1
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
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src={logo} alt="Mirava Logo" className="logo-image" />
          </div>
          <span className="logo-text">Mirava Admin</span>
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
              <span className="notification-badge">5</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;