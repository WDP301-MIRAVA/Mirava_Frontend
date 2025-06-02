import React, { useState, useEffect } from 'react';
import './homepage.css';
import Header from '../../components/Header/index';
import Footer from '../../components/Footer';
import { DoctorService, type Doctor } from '../../services/doctor.service';

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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(prev => (prev + 1) % bgImages.length);
    }, 5000); // đổi ảnh mỗi 5s

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await DoctorService.getDoctors();
      // Chỉ lấy 3 bác sĩ đầu tiên để hiển thị
      setDoctors(response.data.slice(0, 3));
      setError(null);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Không thể tải thông tin bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const navigateToDoctorDetail = (doctorId: string) => {
    window.location.href = `/detaildoctor/${doctorId}`;
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
          {loading ? (
            <div className="loading-message">Đang tải thông tin bác sĩ...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            doctors.map((doctor, index) => (
              <div key={doctor._id} className="doctor-card">
                <div 
                  className={`doctor-img doctor-${String.fromCharCode(97 + index)}`}
                  style={{
                    backgroundImage: `url(${doctor.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                ></div>
                <h3>{doctor.user.userName}</h3>
                <p>{doctor.specialty}</p>
                <button 
                  className="view-more"
                  onClick={() => navigateToDoctorDetail(doctor._id)}
                >
                  Xem thêm
                </button>
              </div>
            ))
          )}
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