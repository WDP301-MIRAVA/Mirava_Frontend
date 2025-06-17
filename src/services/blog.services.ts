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

// IDs của 2 blog cần hiển thị trên homepage
const FEATURED_BLOG_IDS = [
  "68357399a30931e1d7dae6d6",
  "6835737fa30931e1d7dae6d1"
];

export const BlogService = {
  // Lấy tất cả blog
  getBlogs: () => axiosInstance.get("/api/blog"),
  
  // Lấy 2 blog featured cho homepage
  getFeaturedBlogs: async (): Promise<Blog[]> => {
    try {
      const response = await axiosInstance.get("/api/blog");
      console.log("API Response:", response.data); // Debug log
      
      if (response.data?.data?.blogs) {
        // Lọc ra 2 blog theo ID cụ thể
        const featuredBlogs = response.data.data.blogs.filter((blog: Blog) => 
          FEATURED_BLOG_IDS.includes(blog._id)
        );
        
        console.log("Featured blogs found:", featuredBlogs); // Debug log
        
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
  
  // Lấy blog theo ID (cho trang chi tiết)
  getBlogById: (id: string) => axiosInstance.get(`/api/blog/${id}`),
};