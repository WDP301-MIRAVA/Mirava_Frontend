import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";
import MiravaLogo from "../../assets/mirava-logo.png";
import { Avatar, Dropdown, Menu } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
// Define the navigation items
const navigationItems = [
  { name: "Trang chủ", path: "/home" },
  { name: "Giới thiệu", path: "/intro" },
  { name: "Dịch vụ IUI / IVF", path: "/iui-ivf-services" },
  { name: "Blog", path: "/bloglist" },
  { name: "Đặt lịch tư vấn", path: "/appointment" },

  { name: "Tra cứu kết quả", path: "/searchresult" },
];

// The primary header component
const Header: React.FC = () => {
  const [activeItem, setActiveItem] = useState("/");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  // const user = decodeToken(token ?? "");
  // Handle scroll effect to change header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Update active item based on current path
    setActiveItem(window.location.pathname);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleConsultClick = () => {
    navigate("/register");
  };
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    toast.success("Đăng xuất thành công");
  };
  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleScheduleClick = () => {
    navigate("/user/appointment");
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<InfoCircleOutlined />}
        onClick={handleProfileClick}
      >
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item
        key="schedule"
        icon={<CalendarOutlined />}
        onClick={handleScheduleClick}
      >
        Xem lịch hẹn
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );
  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <div className="header-content">
        <motion.div
          className="logo-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/">
            <img
              src={MiravaLogo}
              alt="Mirava Healthcare Logo"
              className="logo"
            />
          </Link>
        </motion.div>

        <nav className="nav-container">
          <ul className="nav-menu">
            {navigationItems.map((item, index) => (
              <motion.li
                key={item.path}
                className="nav-item"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`nav-link ${
                    activeItem === item.path ? "active" : ""
                  }`}
                >
                  {item.name}
                </Link>
              </motion.li>
            ))}
          </ul>
          {token ? (
            <Dropdown overlay={menu} placement="bottomRight" arrow>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ cursor: "pointer", display: "inline-block" }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1890ff", marginLeft: 24 }}
                />
              </motion.div>
            </Dropdown>
          ) : (
            <motion.button
              className="consult-button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConsultClick}
            >
              Đăng ký tài khoản
            </motion.button>
          )}

          <button className="mobile-menu-button" aria-label="Menu">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12H21"
                stroke="#4A5568"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 6H21"
                stroke="#4A5568"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 18H21"
                stroke="#4A5568"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
