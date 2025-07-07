import React, { useState, useEffect, useMemo } from 'react';
import './ListFeedback.css';
import { FeedbackService, FeedbackApiError, FeedbackUtils } from '../../../../services/feedback.service';
import { DoctorService } from '../../../../services/doctor.service';
import { userServ } from '../../../../services/userServie';
import type { FeedbackResponse } from '../../../../services/feedback.service';
import type { Doctor } from '../../../../services/doctor.service';

interface Feedback {
  id: string;
  doctorName: string;
  patientName: string;
  rating: number;
  date: string;
  comment?: string;
  doctorSpecialty?: string;
}

interface User {
  _id: string;
  userName?: string;
  fullName?: string;
  email?: string;
}

const ListFeedback: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // API states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Pagination
  const ITEMS_PER_PAGE = 10;

  // Cache cho doctor data và user data
  const [doctorCache, setDoctorCache] = useState<Map<string, Doctor>>(new Map());
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map());

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = FeedbackUtils.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        setError('Bạn cần đăng nhập để xem danh sách phản hồi');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Hàm lấy thông tin bác sĩ chi tiết
  const getDoctorDetails = async (doctorId: string): Promise<Doctor | null> => {
    try {
      // Kiểm tra cache trước
      if (doctorCache.has(doctorId)) {
        return doctorCache.get(doctorId)!;
      }

      const response = await DoctorService.getDoctorById(doctorId);
      if (response.data) {
        const doctorData = response.data;
        // Lưu vào cache
        setDoctorCache(prev => new Map(prev).set(doctorId, doctorData));
        return doctorData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching doctor ${doctorId}:`, error);
      return null;
    }
  };

  // Hàm lấy thông tin user/bệnh nhân chi tiết
  const getUserDetails = async (userId: string): Promise<User | null> => {
    try {
      // Kiểm tra cache trước
      if (userCache.has(userId)) {
        return userCache.get(userId)!;
      }

      const response = await userServ.getUserById(userId);
      if (response.data) {
        const userData = response.data;
        // Lưu vào cache
        setUserCache(prev => new Map(prev).set(userId, userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  };

  // Fetch feedbacks từ API
  const fetchFeedbacks = async (page: number = 1) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await FeedbackService.getFeedbacks({
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: sortBy === 'date' ? 'createdAt' : 'rating',
        sortOrder
      });

      if (response.success && response.feedbacks) {
        // Lấy thông tin bác sĩ và bệnh nhân chi tiết cho từng feedback
        const feedbacksWithDetails = await Promise.all(
          response.feedbacks.map(async (feedback: FeedbackResponse) => {
            let doctorName = 'Bác sĩ không rõ';
            let doctorSpecialty = '';
            let patientName = 'Bệnh nhân ẩn danh';

            // Lấy thông tin bác sĩ
            if (feedback.doctor && feedback.doctor._id) {
              const doctorDetails = await getDoctorDetails(feedback.doctor._id);
              if (doctorDetails) {
                doctorName = doctorDetails.user?.userName || 'Bác sĩ không rõ';
                doctorSpecialty = doctorDetails.specialty || '';
              }
            }

            // Lấy thông tin bệnh nhân
            if (feedback.user) {
              // Nếu feedback.user là object với thông tin đầy đủ
              if (typeof feedback.user === 'object' && feedback.user._id) {
                const userDetails = await getUserDetails(feedback.user._id);
                if (userDetails) {
                  patientName = userDetails.fullName || userDetails.userName || 'Bệnh nhân ẩn danh';
                } else {
                  // Fallback nếu không lấy được từ API
                  patientName = feedback.user.fullName || feedback.user.userName || 'Bệnh nhân ẩn danh';
                }
              }
              // Nếu feedback.user chỉ là string (userId)
              else if (typeof feedback.user === 'string') {
                const userDetails = await getUserDetails(feedback.user);
                if (userDetails) {
                  patientName = userDetails.fullName || userDetails.userName || 'Bệnh nhân ẩn danh';
                }
              }
            }

            return {
              id: feedback._id,
              doctorName,
              patientName,
              rating: feedback.rating,
              date: new Date(feedback.createdAt).toISOString().split('T')[0],
              comment: feedback.comment,
              doctorSpecialty
            };
          })
        );

        setFeedbacks(feedbacksWithDetails);
        
        // Calculate total pages
        const totalItems = response.totalCount || feedbacksWithDetails.length;
        setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
      } else {
        setFeedbacks([]);
        setError('Không thể tải danh sách phản hồi');
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      
      if (err instanceof FeedbackApiError) {
        if (err.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          setIsAuthenticated(false);
        } else {
          setError(err.message);
        }
      } else {
        setError('Có lỗi xảy ra khi tải danh sách phản hồi');
      }
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect để load data khi component mount hoặc khi sorting thay đổi
  useEffect(() => {
    if (isAuthenticated) {
      fetchFeedbacks(currentPage);
    }
  }, [isAuthenticated, currentPage, sortBy, sortOrder]);

  // Filtered feedbacks (client-side search)
  const filteredFeedbacks = useMemo(() => {
  const filtered = feedbacks.filter(feedback =>
    feedback.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (feedback.doctorSpecialty && feedback.doctorSpecialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Áp dụng sắp xếp cho kết quả đã filter
  return filtered.sort((a, b) => {
    let compareValue = 0;
    
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      compareValue = dateA - dateB;
    } else if (sortBy === 'rating') {
      compareValue = a.rating - b.rating;
    }
    
    // Áp dụng thứ tự sắp xếp (asc/desc)
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });
}, [feedbacks, searchTerm, sortBy, sortOrder]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`lf-star ${index < rating ? 'lf-star-filled' : 'lf-star-empty'}`}
      >
        ⭐
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSortChange = (value: string) => {
    if (value === 'date-asc' || value === 'date-desc') {
      setSortBy('date');
      setSortOrder(value === 'date-asc' ? 'asc' : 'desc');
    } else if (value === 'rating-asc' || value === 'rating-desc') {
      setSortBy('rating');
      setSortOrder(value === 'rating-asc' ? 'asc' : 'desc');
    }
    setCurrentPage(1); // Reset về trang đầu khi sort
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRetry = () => {
    if (isAuthenticated) {
      fetchFeedbacks(currentPage);
    } else {
      // Redirect to login hoặc hiển thị modal login
      window.location.href = '/login';
    }
  };

  // Handle create feedback button click
  const handleCreateFeedback = () => {
     if (!isAuthenticated) {
      setError('Bạn cần đăng nhập để tạo đánh giá');
      return;
    }
    window.location.href = '/customer/feedback';
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`lf-pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="lf-pagination">
        <button
          className="lf-pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹ Trước
        </button>
        {startPage > 1 && (
          <>
            <button className="lf-pagination-btn" onClick={() => handlePageChange(1)}>1</button>
            {startPage > 2 && <span className="lf-pagination-dots">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="lf-pagination-dots">...</span>}
            <button className="lf-pagination-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button
          className="lf-pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau ›
        </button>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="lf-feedback-container">
        <div className="lf-feedback-header">
          <h1 className="lf-page-title">Phản Hồi Từ Bệnh Nhân</h1>
          <p className="lf-page-subtitle">Đang tải dữ liệu...</p>
        </div>
        <div className="lf-loading">
          <div className="lf-loading-spinner">⏳</div>
          <p>Đang tải danh sách phản hồi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="lf-feedback-container">
        <div className="lf-feedback-header">
          <h1 className="lf-page-title">Phản Hồi Từ Bệnh Nhân</h1>
          <p className="lf-page-subtitle">Đánh giá và nhận xét về dịch vụ khám chữa bệnh</p>
        </div>
        <div className="lf-error-state">
          <h3 className="lf-error-title">Có lỗi xảy ra</h3>
          <p className="lf-error-message">{error}</p>
          <button className="lf-retry-btn" onClick={handleRetry}>
            {isAuthenticated ? 'Thử lại' : 'Đăng nhập'}
          </button>
        </div>
      </div>        
    );
  }

  return (
    <div className="lf-feedback-container">
      <div className="lf-feedback-header">
        <div className="lf-header-content">
          <div className="lf-header-text">
            <h1 className="lf-page-title">Phản Hồi Từ Bệnh Nhân</h1>
            <p className="lf-page-subtitle">
              Đánh giá và nhận xét về dịch vụ khám chữa bệnh 
              {feedbacks.length > 0 && ` (${feedbacks.length} phản hồi)`}
            </p>
          </div>
          <button className="lf-create-btn" onClick={handleCreateFeedback}>
             Tạo đánh giá
          </button>
        </div>
      </div>

      <div className="lf-controls-section">
        <div className="lf-search-container">
          <input
            type="text"
            className="lf-search-input"
            placeholder="Tìm kiếm theo tên bác sĩ, bệnh nhân hoặc chuyên khoa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="lf-sort-container">
          <select
            className="lf-sort-select"
            onChange={(e) => handleSortChange(e.target.value)}
            value={`${sortBy}-${sortOrder}`}
          >
            <option value="date-desc">Ngày mới nhất</option>
            <option value="date-asc">Ngày cũ nhất</option>
            <option value="rating-desc">Đánh giá cao nhất</option>
            <option value="rating-asc">Đánh giá thấp nhất</option>
          </select>
        </div>

        
      </div>

      <div className="lf-feedback-list">
        {filteredFeedbacks.length === 0 ? (
          <div className="lf-no-results">
            <div className="lf-no-results-icon">📋</div>
            <p className="lf-no-results-text">Không có phản hồi nào</p>
            <p className="lf-no-results-subtext">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có phản hồi nào từ bệnh nhân'}
            </p>
          </div>
        ) : (
          <>
            <div className="lf-feedback-grid">
              {filteredFeedbacks.map((feedback) => (
                <div key={feedback.id} className="lf-feedback-card">
                  <div className="lf-feedback-header-card">
                    <div className="lf-doctor-info">
                      
                      <div>
                        <span className="lf-doctor-name">{feedback.doctorName}</span>
                        {feedback.doctorSpecialty && (
                          <span className="lf-doctor-specialty">({feedback.doctorSpecialty})</span>
                        )}
                      </div>
                    </div>
                    <div className="lf-rating-section">
                      <div className="lf-stars-container">
                        {renderStars(feedback.rating)}
                      </div>
                      <span className="lf-rating-text">({feedback.rating}/5)</span>
                    </div>
                  </div>

                  <div className="lf-patient-info">
                    <span className="lf-patient-name">Bệnh nhân: {feedback.patientName}</span>
                  </div>

                  <div className="lf-date-info">
                    
                    <span className="lf-date-text">Ngày đánh giá: {formatDate(feedback.date)}</span>
                  </div>

                  {feedback.comment && (
                    <div className="lf-comment-section">
                      
                      <p className="lf-comment-text">"{feedback.comment}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default ListFeedback;