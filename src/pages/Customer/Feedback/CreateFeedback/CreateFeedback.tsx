import React, { useState, useEffect } from 'react';
import { FeedbackService, FeedbackApiError } from '../../../../services/feedback.service';
import { DoctorService } from '../../../../services/doctor.service';
import { Service } from '../../../../services/service';
import type { Doctor } from '../../../../services/doctor.service';
import './CreateFeedback.css';

interface ServiceItem {
  _id: string;
  name: string;
  description?: string;
  price?: number;
}

interface CreateFeedbackProps {
  doctorId?: string;
  serviceId?: string;
}

const CreateFeedback: React.FC<CreateFeedbackProps> = ({ 
  doctorId: propDoctorId, 
  serviceId: propServiceId 
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Form states
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState<boolean>(false);
  const [servicesLoading, setServicesLoading] = useState<boolean>(false);

  const ratingLabels = {
    1: 'Rất không hài lòng',
    2: 'Không hài lòng', 
    3: 'Bình thường',
    4: 'Hài lòng',
    5: 'Rất hài lòng'
  };

  // Debug function to check what's available in storage
  const debugStorageInfo = () => {
    console.log('=== DEBUG STORAGE INFO ===');
    console.log('localStorage.userId:', localStorage.getItem('userId'));
    console.log('sessionStorage.userId:', sessionStorage.getItem('userId'));
    console.log('localStorage.accessToken:', !!localStorage.getItem('accessToken'));
    console.log('localStorage.userInfo:', localStorage.getItem('userInfo'));
    console.log('sessionStorage.userInfo:', sessionStorage.getItem('userInfo'));
    
    // Check all localStorage keys
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('All sessionStorage keys:', Object.keys(sessionStorage));
  };

  // Get userId from localStorage/sessionStorage or decode from token
  const getCurrentUserId = (): string | null => {
    // Try to get userId directly from localStorage first
    let userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    
    if (!userId) {
      // Try to get from token payload (decode JWT token)
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (token) {
        try {
          // Decode JWT token to get user info
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const decodedToken = JSON.parse(jsonPayload);
          userId = decodedToken.userId || decodedToken.id || decodedToken.sub;
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }
    
    if (!userId) {
      // Try to get from URL params as fallback
      const urlParams = new URLSearchParams(window.location.search);
      userId = urlParams.get('userId');
    }
    
    return userId;
  };

  // Check authentication (following TreatmentPlan pattern)
  const checkAuthentication = (): boolean => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    return !!token;
  };

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug storage info
        debugStorageInfo();

        // Check authentication
        const authenticated = checkAuthentication();
        if (!authenticated) {
          setError('Bạn cần đăng nhập để tạo đánh giá');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        setIsAuthenticated(true);

        // Get current user ID
        const currentUserId = getCurrentUserId();
        if (!currentUserId) {
          // Try alternative methods to get userId
          const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          console.log('Debug - Token exists:', !!token);
          console.log('Debug - Token length:', token?.length);
          
          // Also check if user info is stored differently
          const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
          if (userInfo) {
            try {
              const parsedUserInfo = JSON.parse(userInfo);
              const userIdFromInfo = parsedUserInfo.id || parsedUserInfo._id || parsedUserInfo.userId;
              if (userIdFromInfo) {
                setUserId(userIdFromInfo);
              } else {
                setError('Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.');
                setLoading(false);
                return;
              }
            } catch (e) {
              setError('Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.');
              setLoading(false);
              return;
            }
          } else {
            setError('Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.');
            setLoading(false);
            return;
          }
        } else {
          setUserId(currentUserId);
        }

        // Set initial values from props or URL params if available
        if (propDoctorId) {
          setSelectedDoctorId(propDoctorId);
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          const urlDoctorId = urlParams.get('doctorId');
          if (urlDoctorId) {
            setSelectedDoctorId(urlDoctorId);
          }
        }

        if (propServiceId) {
          setSelectedServiceId(propServiceId);
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          const urlServiceId = urlParams.get('serviceId');
          if (urlServiceId) {
            setSelectedServiceId(urlServiceId);
          }
        }

        // Load doctors and services list
        await Promise.all([loadDoctors(), loadServices()]);

      } catch (err) {
        console.error('Error initializing component:', err);
        setError('Có lỗi xảy ra khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [propDoctorId, propServiceId]);

  // Load doctors list
  const loadDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const response = await DoctorService.getDoctors();
      
      if (response.data && Array.isArray(response.data)) {
        setDoctors(response.data);
      } else {
        console.warn('Invalid doctors data format:', response.data);
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Không thể tải danh sách bác sĩ');
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Load services list
  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const response = await Service.getServices();
      
      if (response.data && Array.isArray(response.data)) {
        setServices(response.data);
      } else {
        console.warn('Invalid services data format:', response.data);
        setServices([]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Không thể tải danh sách dịch vụ');
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      background: ${type === 'success' ? '#22c55e' : '#ef4444'};
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedDoctorId) {
      showToast('Vui lòng chọn bác sĩ', 'error');
      return;
    }

    if (!selectedServiceId) {
      showToast('Vui lòng chọn dịch vụ', 'error');
      return;
    }

    if (rating === 0) {
      showToast('Vui lòng chọn số sao đánh giá', 'error');
      return;
    }

    if (!userId) {
      showToast('Thiếu thông tin người dùng', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        userId,
        doctorId: selectedDoctorId,
        serviceId: selectedServiceId,
        rating,
        comment: comment.trim() || ''
      };

      const response = await FeedbackService.createFeedback(feedbackData);

      if (response.success) {
        showToast('Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được ghi nhận thành công.');
        
        // Reset form
        setRating(0);
        setComment('');
        setSelectedDoctorId('');
        setSelectedServiceId('');
        
        // Redirect to feedback list after 1.5 seconds
        setTimeout(() => {
          window.location.href = '/customer/list-feedback';
        }, 1500);
      } else {
        throw new Error('Phản hồi từ server không thành công');
      }

    } catch (error) {
      console.error('Error creating feedback:', error);
      
      if (error instanceof FeedbackApiError) {
        if (error.status === 401) {
          showToast('Phiên đăng nhập đã hết hạn. Đang chuyển đến trang đăng nhập...', 'error');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          showToast(error.message, 'error');
        }
      } else {
        showToast('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToList = () => {
    window.location.href = '/customer/list-feedback';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const displayRating = hoveredRating || rating;

  // Get selected doctor and service info
  const selectedDoctor = doctors.find(doctor => doctor._id === selectedDoctorId);
  const selectedService = services.find(service => service._id === selectedServiceId);

  // Loading state
  if (loading) {
    return (
      <div className="feedback-container">
        <div className="feedback-card">
          <div className="loading-state">
            {/* <div className="loading-spinner">⏳</div> */}
            <h3>Đang tải thông tin...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !isAuthenticated) {
    return (
      <div className="feedback-container">
        <div className="feedback-card">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Có lỗi xảy ra</h3>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              {!isAuthenticated ? (
                <button className="error-btn primary" onClick={handleLogin}>
                  Đăng nhập
                </button>
              ) : (
                <button className="error-btn secondary" onClick={handleBackToList}>
                  Quay lại danh sách
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header-section">
          <button className="back-button" onClick={handleBackToList}>
            ← Quay lại
          </button>
          <h1 className="feedback-title">Đánh giá dịch vụ</h1>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Doctor Selection */}
          <div className="form-group">
            <label htmlFor="doctor-select" className="form-label">
              Chọn bác sĩ: <span className="required">*</span>
            </label>
            {doctorsLoading ? (
              <div className="loading-select">Đang tải danh sách bác sĩ...</div>
            ) : (
              <select
                id="doctor-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="form-select"
                required
                disabled={isSubmitting}
              >
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.user?.userName || 'Bác sĩ không rõ tên'} 
                    {doctor.specialty && ` - ${doctor.specialty}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Service Selection */}
          <div className="form-group">
            <label htmlFor="service-select" className="form-label">
              Chọn dịch vụ: <span className="required">*</span>
            </label>
            {servicesLoading ? (
              <div className="loading-select">Đang tải danh sách dịch vụ...</div>
            ) : (
              <select
                id="service-select"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="form-select"
                required
                disabled={isSubmitting}
              >
                <option value="">-- Chọn dịch vụ --</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                    {service.price && ` - ${service.price.toLocaleString('vi-VN')} VNĐ`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Info Display */}
          {(selectedDoctor || selectedService) && (
            <div className="selected-info">
              <h3>Thông tin đánh giá:</h3>
              {selectedDoctor && (
                <div className="doctor-info">
                  <div className="doctor-avatar">
                    {selectedDoctor.imageUrl ? (
                      <img src={selectedDoctor.imageUrl} alt={selectedDoctor.user?.userName} />
                    ) : (
                      <div className="avatar-placeholder">
                        <span>👨‍⚕️</span>
                      </div>
                    )}
                  </div>
                  <div className="doctor-details">
                    <h4 className="doctor-name">
                      Bác sĩ: {selectedDoctor.user?.userName || 'Không rõ tên'}
                    </h4>
                    {selectedDoctor.specialty && (
                      <p className="doctor-specialty">{selectedDoctor.specialty}</p>
                    )}
                    {selectedDoctor.degree && (
                      <p className="doctor-degree">{selectedDoctor.degree}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedService && (
                <div className="service-info">
                  <div className="service-item">
                    <span className="service-icon">📋</span>
                    <span className="service-text">Dịch vụ: {selectedService.name}</span>
                  </div>
                  {selectedService.description && (
                    <div className="service-item">
                      <span className="service-icon">📝</span>
                      <span className="service-text">Mô tả: {selectedService.description}</span>
                    </div>
                  )}
                  {selectedService.price && (
                    <div className="service-item">
                      <span className="service-icon">💰</span>
                      <span className="service-text">Giá: {selectedService.price.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                  <div className="service-item">
                    <span className="service-icon">📅</span>
                    <span className="service-text">Ngày đánh giá: {new Date().toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rating Section */}
          <div className="rating-section">
            <h3 className="rating-title">
              Bạn đánh giá trải nghiệm của mình như thế nào? <span className="required">*</span>
            </h3>
            
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= displayRating ? 'active' : ''}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  title={ratingLabels[star as keyof typeof ratingLabels]}
                  disabled={isSubmitting}
                >
                  ⭐
                </button>
              ))}
            </div>

            {displayRating > 0 && (
              <p className="rating-label">
                {ratingLabels[displayRating as keyof typeof ratingLabels]}
              </p>
            )}
          </div>

          {/* Comment Section */}
          <div className="comment-section">
            <label htmlFor="comment" className="comment-label">
              Nhận xét thêm (không bắt buộc):
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Dịch vụ rất tốt, tôi hài lòng..."
              className="comment-textarea"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="character-count">
              {comment.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || !selectedDoctorId || !selectedServiceId}
            className={`submit-button ${isSubmitting ? 'submitting' : ''} ${
              rating === 0 || !selectedDoctorId || !selectedServiceId ? 'disabled' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Đang gửi...
              </>
            ) : (
              'Gửi đánh giá'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFeedback;