import axiosInstance from './MainService';
import { BASE_URL } from './config';

// Type definitions dựa trên response thực tế từ API
export interface User {
  fullName: string;
  _id: string;
  userName: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  _id: string;
  specialty: string;
  user?: User;
  degree?: string;
  workSchedule?: string[];
  description?: string;
  imageUrl?: string;
  rating?: number;
  feedbacks?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  _id: string;
  name: string;
  description?: string;
  price?: number;
}

export interface FeedbackResponse {
  _id: string;
  user: string | User | null;
  doctor: Doctor | null;
  service: string | Service | null;
  rating: number;
  comment: string;
  createdAt: string;
}

// Request interfaces - Updated to match API
export interface CreateFeedbackRequest {
  userId: string;
  doctorId: string;
  serviceId: string;
  rating: number;
  comment: string;
}

export interface UpdateFeedbackRequest {
  userId?: string;
  doctorId?: string;
  serviceId?: string;
  rating?: number;
  comment?: string;
}

// Response interfaces - Updated to match actual API response
export interface CreateFeedbackResponse {
  success: boolean;
  message: string;
  feedback: {
    user: string;
    doctor: string;
    service: string;
    rating: number;
    comment: string;
    _id: string;
    createdAt: string;
  };
}

export interface GetFeedbacksResponse {
  success: boolean;
  feedbacks: FeedbackResponse[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
}

export interface GetFeedbackByIdResponse {
  success: boolean;
  feedback: FeedbackResponse;
}

export interface UpdateFeedbackResponse {
  success: boolean;
  message: string;
  feedback: FeedbackResponse;
}

export interface DeleteFeedbackResponse {
  success: boolean;
  message: string;
}

export interface UnauthorizedResponse {
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterBy?: string;
  filterValue?: string;
}

// Custom error class for API errors
export class FeedbackApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'FeedbackApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Feedback Service sử dụng axiosInstance chung
 */
export const FeedbackService = {
  /**
   * Tạo feedback mới (Customer/Admin only) - Updated to match API
   */
/**
   * Tạo feedback mới (Customer/Admin only) - Updated to match API
   */
  createFeedback: async (feedbackData: CreateFeedbackRequest): Promise<CreateFeedbackResponse> => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      if (!token) {
        throw new FeedbackApiError('Vui lòng đăng nhập để tạo đánh giá', 401, null);
      }

      const response = await axiosInstance.post(`${BASE_URL}/api/feedback`, feedbackData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new FeedbackApiError(
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          401,
          error.response.data
        );
      }
      if (error.response?.status === 409) {
        throw new FeedbackApiError(
          'Bạn đã đánh giá dịch vụ này rồi.',
          409,
          error.response.data
        );
      }
      if (error.response?.status === 400) {
        throw new FeedbackApiError(
          error.response?.data?.message || 'Dữ liệu không hợp lệ',
          400,
          error.response.data
        );
      }
      throw new FeedbackApiError(
        error.response?.data?.message || 'Có lỗi xảy ra khi tạo đánh giá',
        error.response?.status || 500,
        error.response?.data
      );
    }
  },

  /**
   * Lấy danh sách tất cả feedbacks với phân trang (Customer/Admin only)
   */
  getFeedbacks: async (params: PaginationParams = {}): Promise<GetFeedbacksResponse> => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      if (!token) {
        throw new FeedbackApiError('Vui lòng đăng nhập để xem danh sách phản hồi', 401, null);
      }

      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.filterBy) queryParams.append('filterBy', params.filterBy);
      if (params.filterValue) queryParams.append('filterValue', params.filterValue);

      const url = `${BASE_URL}/api/feedback${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axiosInstance.get(url, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new FeedbackApiError(
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          401,
          error.response.data
        );
      }
      throw new FeedbackApiError(
        error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách phản hồi',
        error.response?.status || 500,
        error.response?.data
      );
    }
  },

  /**
   * Lấy feedback theo ID (Admin only)
   */
  getFeedbackById: async (feedbackId: string): Promise<GetFeedbackByIdResponse> => {
    try {
      if (!feedbackId) {
        throw new FeedbackApiError('Feedback ID is required', 400, null);
      }

      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await axiosInstance.get(`${BASE_URL}/api/feedback/${feedbackId}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error: any) {
      if (error instanceof FeedbackApiError) {
        throw error;
      }
      throw new FeedbackApiError(
        error.response?.data?.message || 'Failed to fetch feedback',
        error.response?.status || 500,
        error.response?.data
      );
    }
  },

  /**
   * Cập nhật feedback (Admin only)
   */
  updateFeedback: async (
    feedbackId: string,
    updateData: UpdateFeedbackRequest
  ): Promise<UpdateFeedbackResponse> => {
    try {
      if (!feedbackId) {
        throw new FeedbackApiError('Feedback ID is required', 400, null);
      }

      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

      const response = await axiosInstance.put(`${BASE_URL}/api/feedback/${feedbackId}`, updateData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error: any) {
      if (error instanceof FeedbackApiError) {
        throw error;
      }
      throw new FeedbackApiError(
        error.response?.data?.message || 'Failed to update feedback',
        error.response?.status || 500,
        error.response?.data
      );
    }
  },

  /**
   * Xóa feedback (Admin only)
   */
  deleteFeedback: async (feedbackId: string): Promise<DeleteFeedbackResponse> => {
    try {
      if (!feedbackId) {
        throw new FeedbackApiError('Feedback ID is required', 400, null);
      }

      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

      const response = await axiosInstance.delete(`${BASE_URL}/api/feedback/${feedbackId}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error: any) {
      if (error instanceof FeedbackApiError) {
        throw error;
      }
      throw new FeedbackApiError(
        error.response?.data?.message || 'Failed to delete feedback',
        error.response?.status || 500,
        error.response?.data
      );
    }
  },
};

/**
 * Utility functions
 */
export const FeedbackUtils = {
  /**
   * Kiểm tra xem user có đăng nhập không
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    return !!token;
  },

  /**
   * Lấy user ID từ token hoặc localStorage
   */
  getCurrentUserId: (): string | null => {
    // Thử lấy từ localStorage trước
    let userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    
    if (!userId) {
      // Nếu không có, thử lấy từ URL params
      const urlParams = new URLSearchParams(window.location.search);
      userId = urlParams.get('userId');
    }
    
    return userId;
  },

  /**
   * Lấy feedbacks với pagination mặc định
   */
  getFeedbacksWithPagination: async (
    page: number = 1,
    limit: number = 10
  ): Promise<GetFeedbacksResponse> => {
    return FeedbackService.getFeedbacks({ page, limit });
  },

  /**
   * Lấy feedbacks theo rating
   */
  getFeedbacksByRating: async (
    rating: number,
    page: number = 1,
    limit: number = 10
  ): Promise<GetFeedbacksResponse> => {
    return FeedbackService.getFeedbacks({
      page,
      limit,
      filterBy: 'rating',
      filterValue: rating.toString()
    });
  },

  /**
   * Lấy feedbacks được sắp xếp theo ngày tạo
   */
  getFeedbacksSortedByDate: async (
    order: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 10
  ): Promise<GetFeedbacksResponse> => {
    return FeedbackService.getFeedbacks({
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: order
    });
  },
};

export default FeedbackService;