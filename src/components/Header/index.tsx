import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';

// Import your logo image
import MiravaLogo from '../../assets/mirava-logo.png';

// Define the navigation items
const navigationItems = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Giới thiệu', path: '/' },
  { name: 'Dịch vụ IUI / IVF', path: '/' },
  { name: 'Blog', path: '/' },
  { name: 'Đội ngũ bác sĩ', path: '/' },
  { name: 'Liên hệ', path: '/' },
];

// The primary header component
const Header: React.FC = () => {
  const [activeItem, setActiveItem] = useState('/');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Handle scroll effect to change header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Update active item based on current path
    setActiveItem(window.location.pathname);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  
  const handleConsultClick = () => {
    navigate('/register');
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-content">
        <motion.div 
          className="logo-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/">
            <img src={MiravaLogo} alt="Mirava Healthcare Logo" className="logo" />
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
                  className={`nav-link ${activeItem === item.path ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              </motion.li>
            ))}
          </ul>
          
          <motion.button
            className="consult-button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConsultClick}
          >
            Đăng ký tư vấn
          </motion.button>
          
          <button className="mobile-menu-button" aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 18H21" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;