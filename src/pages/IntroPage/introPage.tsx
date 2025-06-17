import React, { useState, useEffect } from "react";
import "./introPage.css";
import Header from "../../components/Header/index";
import Footer from "../../components/Footer/index";
import { BASE_URL } from "../../services/config";
interface Service {
  _id: string;
  name: string;
  shortDescription: string;
  price: number;
  method: string;
  imageUrl: string;
  successRate: number;
}
const IntroPage = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/service`) // Đổi thành endpoint thực tế của bạn
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(() => setServices([]));
  }, []);
  const handleConsultationClick = () => {
    alert("Chức năng đăng ký tư vấn sẽ được triển khai sớm!");
  };

  return (
    <>
      <Header />
      <div className="intro-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                Giới thiệu dịch vụ điều trị hiếm muộn
              </h1>
              <p className="hero-subtitle">
                Chúng tôi cung cấp các giải pháp IUI, IVF hiện đại, an toàn và
                cá nhân hóa.
              </p>
              <button
                className="cta-button"
                onClick={handleConsultationClick}
                onMouseEnter={() => setIsHovered("cta")}
                onMouseLeave={() => setIsHovered(null)}
              >
                <span className="cta-icon">💙</span>
                Đăng ký tư vấn miễn phí
              </button>
            </div>
            <div className="hero-decoration">
              <div className="floating-circle circle-1"></div>
              <div className="floating-circle circle-2"></div>
              <div className="floating-circle circle-3"></div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section">
          <div className="services-container">
            <h2 className="section-title">Dịch vụ chuyên khoa của chúng tôi</h2>
            <div className="services-grid">
              {services.map((service) => (
                <div
                  key={service._id}
                  className={`service-card ${
                    isHovered === service.method.toLowerCase() ? "hovered" : ""
                  }`}
                  onMouseEnter={() =>
                    setIsHovered(service.method.toLowerCase())
                  }
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <div className="service-icon">
                    <div className="icon-circle">
                      <span className="icon-text">{service.method}</span>
                    </div>
                  </div>
                  <h3 className="service-title">{service.name}</h3>
                  <p className="service-description">
                    {service.shortDescription}
                  </p>
                  <div className="service-badge">
                    Tỷ lệ thành công {service.successRate}%
                  </div>

                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="service-image"
                  />
                  <div className="service-price">
                    Giá: {service.price.toLocaleString()}đ
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="features-section">
          <div className="features-container">
            <h2 className="section-title">Tại sao chọn chúng tôi?</h2>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="feature-text">Theo dõi lịch điều trị</span>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="feature-text">
                  Hỗ trợ bởi bác sĩ chuyên môn
                </span>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="feature-text">
                  Cập nhật kết quả nhanh chóng
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="contact-section">
          <div className="contact-container">
            <div className="contact-content">
              <h2 className="contact-title">
                Sẵn sàng bắt đầu hành trình của bạn?
              </h2>

              <button
                className="contact-button"
                onClick={handleConsultationClick}
              >
                Liên hệ ngay hôm nay
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default IntroPage;
