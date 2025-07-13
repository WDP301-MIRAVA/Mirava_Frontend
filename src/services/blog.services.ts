import axiosInstance from "./MainService";

export interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  createdAt: string;
  author?: { 
    _id: string;
    userName: string; 
  };
  content?: string;
  category?: string;
  status?: string;
  viewCount?: number;
  updatedAt?: string;
  __v?: number;
}

export interface BlogResponse {
  success: boolean;
  data: {
    count: number;
    totalPages: number;
    currentPage: number;
    blogs: Blog[];
  };
}

// Interface cho response của getBlogById
export interface BlogDetailResponse {
  success: boolean;
  data: Blog;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  category?: string;
}

// Interface cho tạo blog mới
export interface CreateBlogRequest {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  status: string;
  featuredImage?: string;
}

// Interface cho cập nhật blog
export interface UpdateBlogRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  status?: string;
  featuredImage?: string;
}

// Interface cho response tạo/sửa blog
export interface BlogActionResponse {
  success: boolean;
  message: string;
  data: Blog;
}

// Interface cho response xóa blog
export interface DeleteBlogResponse {
  success: boolean;
  message: string;
}

// IDs của 2 blog cần hiển thị trên homepage
const FEATURED_BLOG_IDS = [
  "68357399a30931e1d7dae6d6",
  "6835737fa30931e1d7dae6d1"
];

export const BlogService = {
  // Lấy tất cả blog với phân trang và lọc
  getBlogs: (params?: BlogListParams) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.category && params.category !== 'all') {
      queryParams.append('category', params.category);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/blog?${queryString}` : "/api/blog";
    
    return axiosInstance.get(url);
  },
  
  // Lấy 2 blog featured cho homepage
  getFeaturedBlogs: async (): Promise<Blog[]> => {
    try {
      const response = await axiosInstance.get("/api/blog");
      console.log("API Response:", response.data);
      
      if (response.data?.data?.blogs) {
        // Lọc ra 2 blog theo ID cụ thể
        const featuredBlogs = response.data.data.blogs.filter((blog: Blog) => 
          FEATURED_BLOG_IDS.includes(blog._id)
        );
        
        console.log("Featured blogs found:", featuredBlogs);
        
        // Sắp xếp theo thứ tự ID trong mảng FEATURED_BLOG_IDS
        return featuredBlogs.sort((a: Blog, b: Blog) => {
          const indexA = FEATURED_BLOG_IDS.indexOf(a._id);
          const indexB = FEATURED_BLOG_IDS.indexOf(b._id);
          return indexA - indexB;
        });
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching featured blogs:", error);
      if (typeof error === "object" && error !== null && "response" in error && typeof (error as any).response === "object") {
        console.error("Error details:", (error as any).response?.data || (error as any).message);
      } else {
        console.error("Error details:", (error as any).message || error);
      }
      throw error;
    }
  },
  
  // Lấy danh sách blog với phân trang và lọc (method riêng để dễ sử dụng)
  getBlogList: async (page: number = 1, limit: number = 10, category?: string): Promise<BlogResponse> => {
    try {
      const response = await BlogService.getBlogs({ page, limit, category });
      return response.data;
    } catch (error) {
      console.error("Error fetching blog list:", error);
      throw error;
    }
  },
  
  // Lấy blog theo ID (cho trang chi tiết)
  getBlogById: async (id: string): Promise<BlogDetailResponse> => {
    try {
      const response = await axiosInstance.get(`/api/blog/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blog with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Lấy danh sách categories từ API
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await axiosInstance.get("/api/blog");
      if (response.data?.data?.blogs) {
        const categories = [...new Set(response.data.data.blogs.map((blog: Blog) => blog.category).filter(Boolean))];
        return categories as string[];
      }
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  // Tạo blog mới (Admin/Doctor/Manager)
  createBlog: async (blogData: CreateBlogRequest): Promise<BlogActionResponse> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await axiosInstance.post("/api/blog", blogData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating blog:", error);
      throw error;
    }
  },

  // Cập nhật blog (Admin/Doctor/Manager)
  updateBlog: async (id: string, blogData: UpdateBlogRequest): Promise<BlogActionResponse> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await axiosInstance.put(`/api/blog/${id}`, blogData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating blog with ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa blog (Admin/Manager)
  deleteBlog: async (id: string): Promise<DeleteBlogResponse> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await axiosInstance.delete(`/api/blog/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting blog with ID ${id}:`, error);
      throw error;
    }
  },
};