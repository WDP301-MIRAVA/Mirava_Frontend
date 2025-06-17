import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DoctorService, type Doctor } from '../../services/doctor.service';
import './detailDoctorPage.css';
import Header from '../../components/Header/index';
import Footer from '../../components/Footer';

const DetailDoctorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDoctorDetail(id);
    }
  }, [id]);

  const fetchDoctorDetail = async (doctorId: string) => {
    try {
      setLoading(true);
      const response = await DoctorService.getDoctorById(doctorId);
      setDoctorData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching doctor detail:', err);
      setError('Không thể tải thông tin bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const translateGender = (gender: string): string => {
    switch (gender.toLowerCase()) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      default:
        return 'Khác';
    }
  };

  const translateWorkSchedule = (schedule: string): string => {
    return schedule
      .replace('Monday', 'Thứ Hai')
      .replace('Tuesday', 'Thứ Ba')
      .replace('Wednesday', 'Thứ Tư')
      .replace('Thursday', 'Thứ Năm')
      .replace('Friday', 'Thứ Sáu')
      .replace('Saturday', 'Thứ Bảy')
      .replace('Sunday', 'Chủ Nhật');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleBookAppointment = () => {
    // Navigate to appointment booking page or login
    window.location.href = '/appointment';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="doctor-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin bác sĩ...</p>
        </div>
      </div>
    );
  }

  if (error || !doctorData) {
    return (
      <div className="doctor-detail-container">
        <div className="error-container">
          <p className="error-message">{error || 'Không tìm thấy thông tin bác sĩ'}</p>
          <button className="btn-secondary" onClick={handleGoBack}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Header />
    <div className="doctor-detail-container">
      <div className="doctor-detail-card">
        {/* Back Button */}
        {/* <div className="back-button-container">
          <button className="btn-back" onClick={handleGoBack}>
            ← Quay lại
          </button>
        </div> */}

        {/* Header Section */}
        <div className="doctor-header">
          <div className="doctor-avatar">
            <img 
              src={doctorData.imageUrl || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop&crop=face"} 
              alt={doctorData.user.userName}
              className="avatar-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop&crop=face";
              }}
            />
          </div>
          <div className="doctor-basic-info">
            <h1 className="doctor-name">{doctorData.user.userName}</h1>
            <p className="doctor-degree">{doctorData.degree}</p>
            <p className="doctor-specialty">Chuyên khoa: {doctorData.specialty}</p>
          </div>
        </div>

        {/* Description Section */}
        <div className="section">
          <h2 className="section-title">Giới thiệu</h2>
          <p className="description">{doctorData.description}</p>
        </div>

        {/* Contact Information */}
        <div className="section">
          <h2 className="section-title">Thông tin liên hệ</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon email-icon">✉</div>
              <div className="contact-details">
                <span className="contact-label">Email</span>
                <span className="contact-value">{doctorData.user.email}</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon phone-icon">📞</div>
              <div className="contact-details">
                <span className="contact-label">Điện thoại</span>
                <span className="contact-value">{doctorData.user.phone}</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon address-icon">📍</div>
              <div className="contact-details">
                <span className="contact-label">Địa chỉ</span>
                <span className="contact-value">{doctorData.user.address}</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon gender-icon">👤</div>
              <div className="contact-details">
                <span className="contact-label">Giới tính</span>
                <span className="contact-value">{translateGender(doctorData.user.gender)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Work Schedule */}
        <div className="section">
          <h2 className="section-title">Lịch làm việc</h2>
          <div className="schedule-list">
            {doctorData.workSchedule.map((schedule, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-icon">📅</div>
                <span className="schedule-text">{translateWorkSchedule(schedule)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Section */}
        <div className="section">
          <h2 className="section-title">Đánh giá</h2>
          <div className="rating-container">
            <div className="stars-container">
              {renderStars(doctorData.rating)}
              <span className="rating-text">
                {doctorData.rating > 0 ? `${doctorData.rating}/5` : ''}
              </span>
            </div>
            {doctorData.feedbacks.length === 0 && (
              <p className="no-reviews">Chưa có đánh giá nào</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-primary" onClick={handleBookAppointment}>
            Đặt lịch hẹn
          </button>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default DetailDoctorPage;