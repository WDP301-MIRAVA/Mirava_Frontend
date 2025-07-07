import React, { useState, useMemo, useEffect } from 'react';
import './FeedbackManagement.css';
import { FeedbackService, FeedbackApiError, FeedbackUtils } from '../../../../services/feedback.service';
import { DoctorService } from '../../../../services/doctor.service';
import { userServ } from '../../../../services/userServie';
import { Service } from '../../../../services/service';
import type { FeedbackResponse } from '../../../../services/feedback.service';
import type { Doctor } from '../../../../services/doctor.service';

// Interfaces
interface Feedback {
  id: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  serviceName: string;
  doctorSpecialty: string;
  rating: number;
  date: string;
  comment: string;
  // Raw data từ API để sử dụng cho edit
  rawData: FeedbackResponse;
}

interface User {
  _id: string;
  userName?: string;
  fullName?: string;
  email?: string;
}

interface ServiceData {
  _id: string;
  name: string;
  description?: string;
  price?: number;
}

const FeedbackManagement: React.FC = () => {
  // State cho API data
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<Feedback | null>(null);
  const [editModal, setEditModal] = useState<Feedback | null>(null);

  // Cache cho external data
  const [doctorCache, setDoctorCache] = useState<Map<string, Doctor>>(new Map());
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map());
  const [serviceCache, setServiceCache] = useState<Map<string, ServiceData>>(new Map());

  // Check authentication khi component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = FeedbackUtils.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        setError('Bạn cần đăng nhập với quyền admin để quản lý phản hồi');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch các thông tin bổ sung từ cache hoặc API
  const getDoctorDetails = async (doctorId: string): Promise<Doctor | null> => {
    try {
      if (doctorCache.has(doctorId)) {
        return doctorCache.get(doctorId)!;
      }

      const response = await DoctorService.getDoctorById(doctorId);
      if (response.data) {
        const doctorData = response.data;
        setDoctorCache(prev => new Map(prev).set(doctorId, doctorData));
        return doctorData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching doctor ${doctorId}:`, error);
      return null;
    }
  };

  const getUserDetails = async (userId: string): Promise<User | null> => {
    try {
      if (userCache.has(userId)) {
        return userCache.get(userId)!;
      }

      const response = await userServ.getUserById(userId);
      if (response.data) {
        const userData = response.data;
        setUserCache(prev => new Map(prev).set(userId, userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  };

  const getServiceDetails = async (serviceId: string): Promise<ServiceData | null> => {
    try {
      if (serviceCache.has(serviceId)) {
        return serviceCache.get(serviceId)!;
      }

      const response = await Service.getServices();
      if (response.data) {
        // Cache tất cả services
        response.data.forEach((service: ServiceData) => {
          setServiceCache(prev => new Map(prev).set(service._id, service));
        });
        
        return serviceCache.get(serviceId) || null;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching services:`, error);
      return null;
    }
  };

  // Fetch feedbacks từ API với pagination
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
        // Xử lý dữ liệu và lấy thông tin bổ sung
        const feedbacksWithDetails = await Promise.all(
          response.feedbacks.map(async (feedback: FeedbackResponse) => {
            let doctorName = 'Bác sĩ không rõ';
            let doctorSpecialty = '';
            let patientName = 'Bệnh nhân ẩn danh';
            let patientEmail = '';
            let serviceName = 'Dịch vụ không rõ';

            // Lấy thông tin bác sĩ
            if (feedback.doctor && feedback.doctor._id) {
              const doctorDetails = await getDoctorDetails(feedback.doctor._id);
              if (doctorDetails) {
                doctorName = doctorDetails.user?.userName || 'Bác sĩ không rõ';
                doctorSpecialty = doctorDetails.specialty || feedback.doctor.specialty || '';
              } else {
                // Fallback từ data có sẵn
                doctorSpecialty = feedback.doctor.specialty || '';
              }
            }

            // Lấy thông tin bệnh nhân
            if (feedback.user) {
              if (typeof feedback.user === 'object' && feedback.user._id) {
                const userDetails = await getUserDetails(feedback.user._id);
                if (userDetails) {
                  patientName = userDetails.fullName || userDetails.userName || 'Bệnh nhân ẩn danh';
                  patientEmail = userDetails.email || feedback.user.email || '';
                } else {
                  patientName = feedback.user.fullName || feedback.user.userName || 'Bệnh nhân ẩn danh';
                  patientEmail = feedback.user.email || '';
                }
              } else if (typeof feedback.user === 'string') {
                const userDetails = await getUserDetails(feedback.user);
                if (userDetails) {
                  patientName = userDetails.fullName || userDetails.userName || 'Bệnh nhân ẩn danh';
                  patientEmail = userDetails.email || '';
                }
              }
            }

            // Lấy thông tin service
            if (feedback.service) {
              if (typeof feedback.service === 'object' && feedback.service._id) {
                serviceName = feedback.service.name || 'Dịch vụ không rõ';
              } else if (typeof feedback.service === 'string') {
                const serviceDetails = await getServiceDetails(feedback.service);
                if (serviceDetails) {
                  serviceName = serviceDetails.name;
                }
              }
            }

            return {
              id: feedback._id,
              doctorName,
              patientName,
              patientEmail,
              serviceName,
              doctorSpecialty,
              rating: feedback.rating,
              date: new Date(feedback.createdAt).toISOString().split('T')[0],
              comment: feedback.comment,
              rawData: feedback
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
          setError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền admin. Vui lòng đăng nhập lại.');
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

  // Effect để load data khi component mount hoặc khi sorting/pagination thay đổi
  useEffect(() => {
    if (isAuthenticated) {
      fetchFeedbacks(currentPage);
    }
  }, [isAuthenticated, currentPage, sortBy, sortOrder]);

  // Filter và sort feedbacks (client-side cho search)
  const filteredAndSortedFeedbacks = useMemo(() => {
    let filtered = feedbacks.filter(
      feedback =>
        feedback.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.doctorSpecialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort đã được handle ở server-side, nhưng cũng apply client-side cho filtered results
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }
    });

    return filtered;
  }, [feedbacks, searchTerm, sortBy, sortOrder]);

  // Event handlers
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await FeedbackService.deleteFeedback(id);
      
      // Refresh data sau khi xóa
      await fetchFeedbacks(currentPage);
      setDeleteConfirm(null);
      
      // Nếu trang hiện tại không còn dữ liệu và không phải trang đầu, chuyển về trang trước
      if (filteredAndSortedFeedbacks.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      if (error instanceof FeedbackApiError) {
        setError(error.message);
      } else {
        setError('Có lỗi xảy ra khi xóa phản hồi');
      }
    } finally {
      setLoading(false);
    }
  };

  // TODO: Thay thế bằng component ViewFeedbackModal khi hoàn thành
  const handleView = (feedback: Feedback) => {
    setViewModal(feedback);
  };

  // TODO: Thay thế bằng component EditFeedbackModal khi hoàn thành  
  const handleEdit = (feedback: Feedback) => {
    setEditModal(feedback);
  };

  const handleSaveEdit = async (updatedData: any) => {
    try {
      setLoading(true);
      if (editModal) {
        await FeedbackService.updateFeedback(editModal.id, updatedData);
        await fetchFeedbacks(currentPage); // Refresh data
        setEditModal(null);
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      if (error instanceof FeedbackApiError) {
        setError(error.message);
      } else {
        setError('Có lỗi xảy ra khi cập nhật phản hồi');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`feedback-star ${index < rating ? 'filled' : 'empty'}`}>
        ⭐
      </span>
    ));
  };

  const toggleSort = (field: 'date' | 'rating') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
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
      // Redirect to login
      window.location.href = '/login';
    }
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
          className={`feedback-pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="feedback-pagination">
        <button
          className="feedback-pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹ Trước
        </button>
        {startPage > 1 && (
          <>
            <button className="feedback-pagination-btn" onClick={() => handlePageChange(1)}>1</button>
            {startPage > 2 && <span className="feedback-pagination-dots">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="feedback-pagination-dots">...</span>}
            <button className="feedback-pagination-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button
          className="feedback-pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau ›
        </button>
      </div>
    );
  };

  // Loading state
  if (loading && feedbacks.length === 0) {
    return (
      <div className="feedback-management-container">
        <div className="feedback-management-header">
          <h1 className="feedback-management-title">Quản Lý Phản Hồi Từ Bệnh Nhân</h1>
          <p className="feedback-management-subtitle">Đang tải dữ liệu...</p>
        </div>
        <div className="feedback-loading-state">
          <div className="feedback-loading-spinner">⏳</div>
          <p>Đang tải danh sách phản hồi...</p>
        </div>
      </div>
    );
  }

  // Error state (khi không có dữ liệu)
  if (error && feedbacks.length === 0) {
    return (
      <div className="feedback-management-container">
        <div className="feedback-management-header">
          <h1 className="feedback-management-title">Quản Lý Phản Hồi Từ Bệnh Nhân</h1>
          <p className="feedback-management-subtitle">Quản lý và đánh giá phản hồi từ bệnh nhân</p>
        </div>
        <div className="feedback-error-state">
          <h3 className="feedback-error-title">Có lỗi xảy ra</h3>
          <p className="feedback-error-message">{error}</p>
          <button className="feedback-retry-btn" onClick={handleRetry}>
            {isAuthenticated ? 'Thử lại' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-management-container">
      <div className="feedback-management-header">
        <h1 className="feedback-management-title">Quản Lý Phản Hồi Từ Bệnh Nhân</h1>
        <p className="feedback-management-subtitle">
          Quản lý và đánh giá phản hồi từ bệnh nhân 
          {feedbacks.length > 0 && ` (${feedbacks.length} phản hồi)`}
        </p>
      </div>

      {/* Error banner khi có lỗi nhưng vẫn có data */}
      {error && feedbacks.length > 0 && (
        <div className="feedback-error-banner">
          <span className="feedback-error-text">{error}</span>
          <button className="feedback-error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="feedback-management-controls">
        <div className="feedback-search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo bác sĩ, bệnh nhân, email, dịch vụ hoặc dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="feedback-search-input"
          />
        </div>

        <div className="feedback-sort-controls">
          <button
            onClick={() => toggleSort('date')}
            className={`feedback-sort-btn ${sortBy === 'date' ? 'active' : ''}`}
            disabled={loading}
          >
            Sắp xếp theo Ngày {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
          </button>
          <button
            onClick={() => toggleSort('rating')}
            className={`feedback-sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
            disabled={loading}
          >
            Sắp xếp theo Đánh giá {sortBy === 'rating' && (sortOrder === 'asc' ? '▲' : '▼')}
          </button>
        </div>
      </div>

      <div className="feedback-table-container">
        {loading && (
          <div className="feedback-loading-overlay">
            <div className="feedback-loading-spinner">⏳</div>
            <span>Đang tải...</span>
          </div>
        )}
        
        <table className="feedback-data-table">
          <thead>
            <tr>
              <th>Bác sĩ</th>
              <th>dịch vụ</th>
              <th>Bệnh nhân</th>
              <th>Dịch vụ</th>
              <th>Đánh giá</th>
              <th>Ngày</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedFeedbacks.map((feedback) => (
              <tr key={feedback.id} className="feedback-table-row">
                <td className="feedback-doctor-name" data-label="Bác sĩ">{feedback.doctorName}</td>
                <td className="feedback-doctor-specialty" data-label="dịch vụ">{feedback.doctorSpecialty || 'N/A'}</td>
                <td className="feedback-patient-info" data-label="Bệnh nhân">
                  <div className="feedback-patient-name">{feedback.patientName}</div>
                  {feedback.patientEmail && (
                    <div className="feedback-patient-email">{feedback.patientEmail}</div>
                  )}
                </td>
                <td className="feedback-service-name" data-label="Dịch vụ">{feedback.serviceName}</td>
                <td className="rating" data-label="Đánh giá">
                  <div className="feedback-stars-container">
                    {renderStars(feedback.rating)}
                    <span className="feedback-rating-text">({feedback.rating}/5)</span>
                  </div>
                </td>
                <td className="feedback-date" data-label="Ngày">{formatDate(feedback.date)}</td>
                <td className="feedback-actions" data-label="Hành động">
                  <button
                    onClick={() => handleView(feedback)}
                    className="feedback-action-btn feedback-view-btn"
                    disabled={loading}
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => handleEdit(feedback)}
                    className="feedback-action-btn feedback-edit-btn"
                    disabled={loading}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(feedback.id)}
                    className="feedback-action-btn feedback-delete-btn"
                    disabled={loading}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedFeedbacks.length === 0 && !loading && (
          <div className="feedback-no-results">
            <div className="feedback-no-results-icon">📋</div>
            <p className="feedback-no-results-text">Không có phản hồi nào</p>
            <p className="feedback-no-results-subtext">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có phản hồi nào từ bệnh nhân'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* TODO: Thay thế bằng ViewFeedbackModal component */}
      {viewModal && (
        <div className="feedback-modal-overlay">
          <div className="feedback-view-modal">
            <div className="feedback-modal-header">
              <h3>Chi tiết phản hồi</h3>
              <button 
                className="feedback-modal-close"
                onClick={() => setViewModal(null)}
              >
                ×
              </button>
            </div>
            <div className="feedback-modal-content">
              <div className="feedback-detail">
                <div className="feedback-detail-row">
                  <span className="feedback-detail-label">Bác sĩ:</span>
                  <span className="feedback-detail-value">{viewModal.doctorName}</span>
                </div>
                <div className="feedback-detail-row">
                  <span className="feedback-detail-label">dịch vụ:</span>
                  <span className="feedback-detail-value">{viewModal.doctorSpecialty || 'N/A'}</span>
                </div>
                <div className="feedback-detail-row">
                  <span className="feedback-detail-label">Bệnh nhân:</span>
                  <span className="feedback-detail-value">{viewModal.patientName}</span>
                </div>
                {viewModal.patientEmail && (
                  <div className="feedback-detail-row">
                    <span className="feedback-detail-label">Email:</span>
                    <span className="feedback-detail-value">{viewModal.patientEmail}</span>
                  </div>
                )}
                <div className="feedback-detail-row">
                  <span className="feedback-detail-label">Dịch vụ:</span>
                  <span className="feedback-detail-value">{viewModal.serviceName}</span>
                </div>
                <div className="feedback-detail-row">
                  <span className="feedback-detail-label">Đánh giá:</span>
                  <div className="feedback-detail-rating">
                    {renderStars(viewModal.rating)}
                    <span>({viewModal.rating}/5)</span>
                  </div>
                </div>
                <div className="feedback-detail-row">
                  <span className="feedback-detail-label">Ngày tạo:</span>
                  <span className="feedback-detail-value">{formatDate(viewModal.date)}</span>
                </div>
                <div className="feedback-detail-row">
                  <span className="feedback-detail-label">Nhận xét:</span>
                  <div className="feedback-detail-comment">{viewModal.comment}</div>
                </div>
              </div>
            </div>
            <div className="feedback-modal-actions">
              <button
                onClick={() => setViewModal(null)}
                className="feedback-cancel-btn"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TODO: Thay thế bằng EditFeedbackModal component */}
      {editModal && (
        <div className="feedback-modal-overlay">
          <div className="feedback-edit-modal">
            <div className="feedback-modal-header">
              <h3>Chỉnh sửa phản hồi</h3>
              <button 
                className="feedback-modal-close"
                onClick={() => setEditModal(null)}
              >
                ×
              </button>
            </div>
            <div className="feedback-modal-content">
              <form onSubmit={(e) => {
                e.preventDefault();
                // TODO: Implement form submission logic
                const formData = new FormData(e.target as HTMLFormElement);
                const updatedData = {
                  rating: parseInt(formData.get('rating') as string),
                  comment: formData.get('comment') as string
                };
                handleSaveEdit(updatedData);
              }}>
                <div className="feedback-form-group">
                  <label>Bác sĩ:</label>
                  <input type="text" value={editModal.doctorName} disabled />
                </div>
                <div className="feedback-form-group">
                  <label>Bệnh nhân:</label>
                  <input type="text" value={editModal.patientName} disabled />
                </div>
                <div className="feedback-form-group">
                  <label>Dịch vụ:</label>
                  <input type="text" value={editModal.serviceName} disabled />
                </div>
                <div className="feedback-form-group">
                  <label htmlFor="rating">Đánh giá:</label>
                  <select name="rating" defaultValue={editModal.rating} required>
                    <option value={1}>1 sao</option>
                    <option value={2}>2 sao</option>
                    <option value={3}>3 sao</option>
                    <option value={4}>4 sao</option>
                    <option value={5}>5 sao</option>
                  </select>
                </div>
                <div className="feedback-form-group">
                  <label htmlFor="comment">Nhận xét:</label>
                  <textarea 
                    name="comment" 
                    defaultValue={editModal.comment}
                    rows={4}
                    required
                  />
                </div>
                <div className="feedback-modal-actions">
                  <button
                    type="button"
                    onClick={() => setEditModal(null)}
                    className="feedback-cancel-btn"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="feedback-save-btn"
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="feedback-modal-overlay">
          <div className="feedback-confirm-modal">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa phản hồi này? Hành động này không thể hoàn tác.</p>
            <div className="feedback-modal-actions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="feedback-cancel-btn"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="feedback-confirm-delete-btn"
                disabled={loading}
              >
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;