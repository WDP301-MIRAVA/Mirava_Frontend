import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Tag, Clock, Heart, Eye, BookOpen } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './DetailBlog.css';
import { BlogService, type Blog } from '@/services/blog.services';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DetailBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Lấy ID từ URL params
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);

  // Lấy thông tin blog theo ID
  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        setError('ID bài viết không hợp lệ');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await BlogService.getBlogById(id);
        if (response.success) {
          setBlog(response.data);
        } else {
          setError('Không thể tải bài viết');
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Có lỗi xảy ra khi tải bài viết');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // Lấy danh sách bài viết liên quan
  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      if (!blog) return;

      try {
        const response = await BlogService.getBlogList(1, 6, blog.category);
        if (response.success) {
          // Lọc bỏ bài viết hiện tại và chỉ lấy 3 bài
          const filtered = response.data.blogs
            .filter(relatedBlog => relatedBlog._id !== blog._id)
            .slice(0, 3);
          setRelatedBlogs(filtered);
        }
      } catch (error) {
        console.error('Error fetching related blogs:', error);
      }
    };

    fetchRelatedBlogs();
  }, [blog]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Tính thời gian đọc (ước tính 200 từ/phút)
  const calculateReadTime = (content: string) => {
    // Loại bỏ HTML tags và đếm từ
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    return readTime;
  };

  // Handle navigate to related blog
  const handleRelatedBlogClick = (blogId: string) => {
    navigate(`/blog/${blogId}`);
  };

  if (loading) {
    return (
      <div className="detail-blog-container">
        <div className="detail-blog-loading">
          <div className="detail-blog-loading-spinner">
            <div className="detail-blog-pulse"></div>
            <Heart className="detail-blog-heart-icon" size={32} />
          </div>
          <div className="detail-blog-loading-text">
            <span>Đang tải bài viết y khoa...</span>
            <div className="detail-blog-loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="detail-blog-container">
        <div className="detail-blog-nav">
          <div className="container mx-auto px-4 py-4">
            <Link to="/blog" className="detail-blog-back-link">
              <button className="detail-blog-back-button">
                <ArrowLeft size={20} />
                <span>Quay lại danh sách bài viết</span>
              </button>
            </Link>
          </div>
        </div>
        <div className="detail-blog-error">
          <div className="detail-blog-error-content">
            <div className="detail-blog-error-icon">
              <Heart size={48} />
            </div>
            <h2 className="detail-blog-error-title">Oops! Có lỗi xảy ra</h2>
            <p className="detail-blog-error-message">{error || 'Không tìm thấy bài viết'}</p>
            <Link to="/blog">
              <button className="detail-blog-error-button">
                <ArrowLeft size={16} />
                Quay lại danh sách bài viết
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
   <>
   <Header/>
     <div className="detail-blog-container">
      {/* Medical Header Pattern */}
      <div className="detail-blog-medical-pattern"></div>
      
      {/* Header Navigation
      <div className="detail-blog-nav">
        <div className="container mx-auto px-4 py-4">
          <Link to="/bloglist" className="detail-blog-back-link">
            <button className="detail-blog-back-button">
              <ArrowLeft size={20} />
              <span>Quay lại danh sách bài viết</span>
            </button>
          </Link>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="detail-blog-main-content">
        {/* Article Header */}
        <header className="detail-blog-header">

          <h1 className="detail-blog-title">
            {blog.title}
          </h1>

          <div className="detail-blog-meta">
            <div className="detail-blog-meta-left">
              <div className="detail-blog-meta-item">
                <div className="detail-blog-author-avatar">
                  <User size={16} />
                </div>
                <div className="detail-blog-author-info">
                  <span className="detail-blog-author-name">
                    Dr. {blog.author?.userName || 'Mirava Health'}
                  </span>
                  <span className="detail-blog-author-title">Chuyên gia y tế</span>
                </div>
              </div>
            </div>
            
            <div className="detail-blog-meta-right">
              <div className="detail-blog-meta-stats">
                <div className="detail-blog-stat-item">
                  <Calendar size={16} />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
                <div className="detail-blog-stat-item">
                  <Clock size={16} />
                  <span>{calculateReadTime(blog.content || '')} phút đọc</span>
                </div>
                {blog.viewCount !== undefined && (
                  <div className="detail-blog-stat-item">
                    <Eye size={16} />
                    <span>{blog.viewCount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {blog.featuredImage && (
            <div className="detail-blog-featured-image">
              <img 
                src={blog.featuredImage} 
                alt={blog.title}
                className="detail-blog-featured-image-element"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="detail-blog-image-overlay"></div>
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="detail-blog-article">
          <div className="detail-blog-content-wrapper">
            <div className="detail-blog-reading-progress">
              <div className="detail-blog-progress-bar"></div>
            </div>
            
            <div className="detail-blog-content">
              {blog.excerpt && (
                <div className="detail-blog-intro">
                  <BookOpen size={20} />
                  <p>{blog.excerpt}</p>
                </div>
              )}
              
              {/* Render HTML content */}
              <div 
                className="detail-blog-html-content"
                dangerouslySetInnerHTML={{ __html: blog.content || '' }}
              />
            </div>

            {/* Article Actions
            <div className="detail-blog-actions">
              <button className="detail-blog-action-btn detail-blog-share-btn">
                <Share2 size={18} />
                <span>Chia sẻ</span>
              </button>
            </div> */}
          </div>
        </article>

        {/* Tags Section */}
        {blog.category && (
          <div className="detail-blog-tags-section">
            <div className="detail-blog-tags-header">
              <Tag size={20} />
              <h3>Chủ đề liên quan</h3>
            </div>
            <div className="detail-blog-tags-container">
              <span className="detail-blog-tag">{blog.category}</span>
              
            </div>
          </div>
        )}

        {/* Related Posts Section */}
        {relatedBlogs.length > 0 && (
          <div className="detail-blog-related-section">
            <div className="detail-blog-related-header">
              <h3 className="detail-blog-related-title">Bài viết liên quan</h3>
              <p className="detail-blog-related-subtitle">Khám phá thêm các bài viết y tế hữu ích</p>
            </div>
            
            <div className="detail-blog-related-grid">
              {relatedBlogs.map((relatedBlog) => (
                <div key={relatedBlog._id} className="detail-blog-related-card">
                  <div className="detail-blog-related-card-inner">
                    {relatedBlog.featuredImage && (
                      <div className="detail-blog-related-image-wrapper">
                        <img 
                          src={relatedBlog.featuredImage} 
                          alt={relatedBlog.title}
                          className="detail-blog-related-image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="detail-blog-related-image-overlay"></div>
                      </div>
                    )}
                    
                    <div className="detail-blog-related-content">
                      <div className="detail-blog-related-category">
                        <Tag size={12} />
                        <span>{relatedBlog.category || 'Y tế'}</span>
                      </div>
                      
                      <h4 className="detail-blog-related-card-title">
                        {relatedBlog.title}
                      </h4>
                      
                      <p className="detail-blog-related-excerpt">
                        {relatedBlog.excerpt}
                      </p>
                      
                      <div className="detail-blog-related-footer">
                        <div className="detail-blog-related-meta">
                          <Calendar size={12} />
                          <span>{formatDate(relatedBlog.createdAt)}</span>
                        </div>
                        
                        <button 
                          className="detail-blog-read-more"
                          onClick={() => handleRelatedBlogClick(relatedBlog._id)}
                        >
                          <span>Đọc thêm</span>
                          <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Footer CTA */}
        <div className="detail-blog-medical-cta">
          <div className="detail-blog-cta-content">
            <div className="detail-blog-cta-icon">
              <Heart size={32} />
            </div>
            <div className="detail-blog-cta-text">
              <h3>Cần tư vấn thêm?</h3>
              <p>Liên hệ với đội ngũ chuyên gia y tế của chúng tôi</p>
            </div>
            <Link to="/appointment" className="detail-blog-bottom-link">
              <button className="detail-blog-cta-button">
                Tư vấn ngay
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom Navigation
        <div className="detail-blog-bottom-nav">
          <Link to="/bloglist" className="detail-blog-bottom-link">
            <button className="detail-blog-bottom-button">
              <ArrowLeft size={18} />
              <span>Quay lại danh sách bài viết</span>
            </button>
          </Link>
        </div> */}
      </div>
    </div>
   <Footer/>
   </>
  );
};

export default DetailBlog;