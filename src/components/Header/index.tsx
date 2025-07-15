import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";
import MiravaLogo from "../../assets/mirava-logo.png";
import { Avatar, Dropdown, Menu, Badge } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import ConsultModal from "../Modal/ConsultModal";
// 🧭 Navigation
const navigationItems = [
  { name: "Trang chủ", path: "/home" },
  { name: "Dịch vụ IUI / IVF", path: "/iui-ivf-services" },
  { name: "Xét Nghiệm", path: "/test-services" },
  { name: "Blog", path: "/bloglist" },
  { name: "Đăng ký tư vấn", action: "openConsultModal" },
  { name: "Tra cứu kết quả", path: "/searchresult" },
];
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
const Header: React.FC = () => {
  const [activeItem, setActiveItem] = useState("/");
  const [scrolled, setScrolled] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  // Load cart
  useEffect(() => {
    const handleStorageChange = () => {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) setCartItems(JSON.parse(storedCart));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Scroll & cart init
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    setActiveItem(window.location.pathname);

    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCartItems(JSON.parse(storedCart));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    toast.success("Đăng xuất thành công");
  };

  const handleProfileClick = () => navigate("/profile");
  const handleScheduleClick = () => navigate("/user/appointment");

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
    <>
      <header
        className={`mirava-header ${scrolled ? "mirava-header-scrolled" : ""}`}
      >
        <div className="mirava-header-content">
          <motion.div
            className="mirava-logo-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/">
              <img
                src={MiravaLogo}
                alt="Mirava Healthcare Logo"
                className="mirava-logo"
              />
            </Link>
          </motion.div>

          <nav className="mirava-nav-container">
            <ul className="mirava-nav-menu">
              {navigationItems.map((item, index) => (
                <motion.li
                  key={item.name}
                  className="mirava-nav-item"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {item.path ? (
                    <Link
                      to={item.path}
                      className={`mirava-nav-link ${
                        activeItem === item.path ? "active" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span
                      className="mirava-nav-link"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (item.action === "openConsultModal")
                          setConsultModalOpen(true);
                      }}
                    >
                      {item.name}
                    </span>
                  )}
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
                className="mirava-consult-button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
              >
                Đăng ký tài khoản
              </motion.button>
            )}

            <div
              className="mirava-cart-button"
              onClick={() => navigate("/cart")}
              style={{ cursor: "pointer" }}
            >
              <Badge count={cartItems.length} showZero>
                <ShoppingCartOutlined
                  style={{ fontSize: 24, color: "#1890ff" }}
                />
              </Badge>
            </div>

            <button className="mirava-mobile-menu-button" aria-label="Menu">
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

      {/* Modal Đăng ký tư vấn */}
      <ConsultModal
        open={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
      />
    </>
  );
};

export default Header;
