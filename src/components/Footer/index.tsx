import React from 'react';
import './Footer.css';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import MiravaLogo from '../../assets/mirava-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <motion.div
          className="footer-column logo-section"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={MiravaLogo} alt="Mirava Logo" className="footer-logo" />
          <p className="slogan">ĐỒNG HÀNH CÙNG HÀNH TRÌNH<br />LÀM CHA MẸ</p>
        </motion.div>

        <motion.div
          className="footer-column contact-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3>LIÊN HỆ</h3>
          <p><FaMapMarkerAlt className="icon" /> 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh</p>
          <p><FaPhone className="icon" /> 0909 1234 56</p>
          <p><FaEnvelope className="icon" /> support@mirava.vn</p>
        </motion.div>

        <motion.div
          className="footer-column map-section"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.609941530484!2d106.80730807451786!3d10.841132857997916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1747848039980!5m2!1svi!2s"
            width="100%"
            height="180"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </motion.div>
      </div>
      <div className="footer-bottom">
        <p>Copyright: © 2025 MIRAVA</p>
      </div>
    </footer>
  );
};

export default Footer;
