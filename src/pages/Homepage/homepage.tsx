import React, { useState, useEffect } from 'react';
import './homepage.css';
import Header from '../../components/Header/index';
import Footer from '../../components/Footer';

import heroImg1 from '../../assets/HeroSection/1.png';
import heroImg2 from '../../assets/HeroSection/2.png';
import heroImg3 from '../../assets/HeroSection/3.png';

const bgImages = [
  heroImg1,
  heroImg2,
  heroImg3,
];

const HomePage: React.FC = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(prev => (prev + 1) % bgImages.length);
    }, 5000); // đổi ảnh mỗi 5s

    return () => clearInterval(interval);
  }, []);

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="homepage">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${bgImages[currentBgIndex]})` }}
      >
        <div className="hero-overlay" />
        <div className="hero-content ">
          <h1>Hành trình chạm tới thiên chức làm cha mẹ bắt đầu từ đây</h1>
          <p>Giải pháp điều trị hiếm muộn IUI / IVF toàn diện, an toàn và đồng hành bởi đội ngũ chuyên gia.</p>
          <button className="consultation-button" onClick={navigateToLogin}>Đặt lịch tư vấn miễn phí</button>
        </div>
        <div className="hero-dots">
          {bgImages.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentBgIndex ? 'active' : ''}`}
            ></span>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="service-box">
          <div className="service-icon iui-icon"></div>
          <h3>IUI an toàn, hiệu quả cao</h3>
        </div>
        <div className="service-box">
          <div className="service-icon ivf-icon"></div>
          <h3>IVF hiện đại, cá nhân hóa theo từng ca</h3>
        </div>
        <div className="service-box">
          <div className="service-icon doctor-icon"></div>
          <h3>Đồng hành cùng bác sĩ điều trị</h3>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="doctors-section">
        <h2>Đội ngũ bác sĩ</h2>
        <div className="doctors-container">
          <div className="doctor-card">
            <div className="doctor-img doctor-a"></div>
            <h3>Bác sĩ A</h3>
            <p>Chuyên môn 1</p>
            <a href="/bac-si/a" className="view-more">Xem thêm</a>
          </div>
          <div className="doctor-card">
            <div className="doctor-img doctor-b"></div>
            <h3>Bác sĩ B</h3>
            <p>Chuyên môn 2</p>
            <a href="/bac-si/b" className="view-more">Xem thêm</a>
          </div>
          <div className="doctor-card">
            <div className="doctor-img doctor-c"></div>
            <h3>Bác sĩ C</h3>
            <p>Chuyên môn 3</p>
            <a href="/bac-si/c" className="view-more">Xem thêm</a>
          </div>
        </div>
      </section>

      {/* Treatment Process Section */}
      <section className="treatment-process-section">
        <h2>Quy trình điều trị</h2>
        <div className="process-container">
          <div className="process-step">
            <div className="process-icon register-icon"></div>
            <p>Đăng ký</p>
          </div>
          <div className="process-line"></div>
          <div className="process-step">
            <div className="process-icon consultation-icon"></div>
            <p>Tư vấn</p>
          </div>
          <div className="process-line"></div>
          <div className="process-step">
            <div className="process-icon examination-icon"></div>
            <p>Xét nghiệm</p>
          </div>
          <div className="process-line"></div>
          <div className="process-step">
            <div className="process-icon treatment-icon"></div>
            <p>Điều trị</p>
          </div>
          <div className="process-line"></div>
          <div className="process-step">
            <div className="process-icon follow-up-icon"></div>
            <p>Theo dõi kết quả</p>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="blog-section">
        <h2>Blog chia sẻ</h2>
        <div className="blog-container">
          <div className="blog-card">
            <div className="blog-img"></div>
            <div className="blog-content">
              <h3>Tiêu đề</h3>
              <p>Trích đoạn bài viết...</p>
              <a href="/blog/1" className="view-more">Xem thêm</a>
            </div>
          </div>
          <div className="blog-card">
            <div className="blog-img"></div>
            <div className="blog-content">
              <h3>Tiêu đề</h3>
              <p>Trích đoạn bài viết...</p>
              <a href="/blog/2" className="view-more">Xem thêm</a>
            </div>
          </div>
        </div>
      </section>

      {/* Health Safety Section */}
      <section className="health-safety-section">
        <div className="safety-icon"></div>
        <h3>Cam kết y tế an toàn</h3>
        <button className="consultation-button-secondary" onClick={navigateToLogin}>Nhận tư vấn từ chuyên gia</button>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
