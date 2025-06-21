import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, User, Tag, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Thêm import này
import './BlogList.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BlogService, type Blog, type BlogResponse } from '@/services/blog.services';

const BlogList = () => {
  const navigate = useNavigate(); // Thêm hook navigate
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [error, setError] = useState<string>('');
  
  const postsPerPage = 10;

  // Lấy danh sách categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await BlogService.getCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Lấy danh sách blogs khi page hoặc category thay đổi
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response: BlogResponse = await BlogService.getBlogList(
          currentPage, 
          postsPerPage, 
          selectedCategory === 'all' ? undefined : selectedCategory
        );
        
        if (response.success) {
          setBlogs(response.data.blogs);
          setTotalPages(response.data.totalPages);
          setTotalCount(response.data.count);
        } else {
          setError('Không thể tải danh sách bài viết');
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Có lỗi xảy ra khi tải dữ liệu');
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage, selectedCategory]);

  // Filter blogs dựa trên search term (client-side filtering)
  const filteredBlogs = blogs.filter(blog => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      blog.title.toLowerCase().includes(searchLower) ||
      blog.excerpt.toLowerCase().includes(searchLower) ||
      (blog.category && blog.category.toLowerCase().includes(searchLower))
    );
  });

  // Reset page khi thay đổi category
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Handle read more - Cập nhật logic navigation
  const handleReadMore = (blogId: string) => {
    console.log(`Navigating to blog with ID: ${blogId}`);
    navigate(`/blog/${blogId}`); // Chuyển hướng đến trang chi tiết blog
  };

  return (
    <>
      <Header />
      <div className="blogList-container">
        <div className="blogList-header">
          <h1 className="blogList-title">Danh sách bài viết</h1>
          <p className="blogList-subtitle">Khám phá những thông tin y tế mới nhất và hữu ích</p>
        </div>

        <div className="blogList-filters">
          <div className="blogList-searchContainer">
            <div className="blogList-searchInputWrapper">
              <Search className="blogList-searchIcon" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="blogList-searchInput"
              />
            </div>
          </div>

          <div className="blogList-categoryFilter">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="blogList-categorySelect">
                <SelectValue placeholder="Lọc theo chủ đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chủ đề</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        )}

        {error && (
          <div className="blogList-error">
            <p className="text-red-600 text-center py-8">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="blogList-grid">
              {filteredBlogs.map((blog) => (
                <Card key={blog._id} className="blogList-card">
                  <CardHeader className="blogList-cardHeader">
                    <div className="blogList-cardMeta">
                      <div className="blogList-authorInfo">
                        <User className="blogList-metaIcon" />
                        <span className="blogList-authorName">
                          {blog.author?.userName || 'Mirava'}
                        </span>
                      </div>
                      <div className="blogList-dateInfo">
                        <Calendar className="blogList-metaIcon" />
                        <span className="blogList-publishDate">
                          {formatDate(blog.createdAt)}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="blogList-cardTitle">{blog.title}</CardTitle>
                  </CardHeader>
                  
                  {blog.featuredImage && (
                    <div className="blogList-cardImage">
                      <img 
                        src={blog.featuredImage} 
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <CardContent className="blogList-cardContent">
                    <CardDescription className="blogList-cardExcerpt">
                      {blog.excerpt}
                    </CardDescription>
                    
                    <div className="blogList-tagsContainer">
                      <Tag className="blogList-tagsIcon" />
                      <div className="blogList-tagsList">
                        {blog.category && (
                          <Badge variant="secondary" className="blogList-tagBadge">
                            {blog.category}
                          </Badge>
                        )}
                        {blog.viewCount !== undefined && (
                          <Badge variant="outline" className="blogList-tagBadge">
                            {blog.viewCount} lượt xem
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="blogList-cardFooter">
                    <Button 
                      onClick={() => handleReadMore(blog._id)}
                      className="blogList-readMoreBtn"
                      variant="default"
                    >
                      Đọc thêm
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredBlogs.length === 0 && !loading && (
              <div className="blogList-noResults">
                <p>Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm.</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="blogList-pagination">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="blogList-paginationBtn"
                >
                  Trang trước
                </Button>
                
                <div className="blogList-pageInfo">
                  <span>Trang {currentPage} / {totalPages}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({totalCount} bài viết)
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="blogList-paginationBtn"
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BlogList;