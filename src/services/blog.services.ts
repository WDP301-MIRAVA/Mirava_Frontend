import axiosInstance from "./MainService";

export interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  createdAt: string;
  author?: { userName: string };
}
// lấy danh sách blog
export const BlogService = {
  getBlogs: () => axiosInstance.get("/api/blog"),
};
