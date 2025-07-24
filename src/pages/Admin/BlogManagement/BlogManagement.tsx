import React, { useState, useEffect, useMemo } from "react";
import "./BlogManagement.css";
import {
  BlogService,
  type Blog,
  type CreateBlogRequest,
} from "../../../services/blog.services";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Calendar,
  User,
  FileText,
  BookOpen,
  Users,
  BarChart3,
  AlertCircle,
  X,
} from "lucide-react";

const AdminBlogManagement: React.FC = () => {
  // States for blog data and UI
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const limit = 10;

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"createdAt" | "title">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  // Form states
  const [blogForm, setBlogForm] = useState<CreateBlogRequest>({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    status: "draft",
    featuredImage: "",
  });

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Bạn cần đăng nhập để truy cập trang này");
      setLoading(false);
      return;
    }

    // Load initial data
    fetchBlogs();
    fetchCategories();
  }, [currentPage, selectedCategory]);

  // Tính toán stats từ dữ liệu blogs
  const getBlogStats = () => {
    const total = totalBlogs;
    const published = blogs.filter((b) => b.status === "published").length;
    const draft = blogs.filter((b) => b.status === "draft").length;
    const totalViews = blogs.reduce(
      (sum, blog) => sum + (blog.viewCount || 0),
      0
    );

    return { total, published, draft, totalViews };
  };

  // Fetch blogs with pagination and filters
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await BlogService.getBlogList(
        currentPage,
        limit,
        selectedCategory === "all" ? undefined : selectedCategory
      );

      if (response.success) {
        setBlogs(response.data.blogs);
        setTotalPages(response.data.totalPages);
        setTotalBlogs(response.data.count);
      } else {
        throw new Error("Failed to fetch blogs");
      }
    } catch (err: any) {
      console.error("Error fetching blogs:", err);
      setError(err.message || "Có lỗi xảy ra khi tải danh sách blog");
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const cats = await BlogService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Filter and sort blogs locally (for search)
  const filteredAndSortedBlogs = useMemo(() => {
    let filtered = blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.author?.userName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (blog.excerpt || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === "createdAt") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

    return filtered;
  }, [blogs, searchTerm, sortBy, sortOrder]);

  // Handle sort
  const handleSort = (field: "createdAt" | "title") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle view blog
  const handleView = (blog: Blog) => {
    setSelectedBlog(blog);
    setShowViewModal(true);
  };

  // Handle create blog
  const handleCreate = () => {
    setBlogForm({
      title: "",
      content: "",
      excerpt: "",
      category: "",
      status: "draft",
      featuredImage: "",
    });
    setShowCreateModal(true);
  };

  // Handle edit blog
  const handleEdit = (blog: Blog) => {
    setBlogForm({
      title: blog.title,
      content: blog.content || "",
      excerpt: blog.excerpt,
      category: blog.category || "",
      status: blog.status || "draft",
      featuredImage: blog.featuredImage || "",
    });
    setSelectedBlog(blog);
    setShowEditModal(true);
  };

  // Handle delete request
  const handleDeleteRequest = (blog: Blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  // Submit create blog
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await BlogService.createBlog(blogForm);
      if (response.success) {
        showNotification(
          `Blog "${blogForm.title}" đã được tạo thành công`,
          "success"
        );
        setShowCreateModal(false);
        fetchBlogs(); // Refresh list
      } else {
        throw new Error(response.message || "Failed to create blog");
      }
    } catch (err: any) {
      console.error("Error creating blog:", err);
      showNotification(err.message || "Có lỗi xảy ra khi tạo blog", "error");
    }
  };

  // Submit edit blog
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlog) return;

    try {
      const response = await BlogService.updateBlog(selectedBlog._id, blogForm);
      if (response.success) {
        showNotification(
          `Blog "${blogForm.title}" đã được cập nhật thành công`,
          "success"
        );
        setShowEditModal(false);
        setSelectedBlog(null);
        fetchBlogs(); // Refresh list
      } else {
        throw new Error(response.message || "Failed to update blog");
      }
    } catch (err: any) {
      console.error("Error updating blog:", err);
      showNotification(
        err.message || "Có lỗi xảy ra khi cập nhật blog",
        "error"
      );
    }
  };

  // Confirm delete blog
  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      const response = await BlogService.deleteBlog(blogToDelete._id);
      if (response.success) {
        showNotification(
          `Blog "${blogToDelete.title}" đã được xóa thành công`,
          "success"
        );
        setShowDeleteModal(false);
        setBlogToDelete(null);
        fetchBlogs(); // Refresh list
      } else {
        throw new Error(response.message || "Failed to delete blog");
      }
    } catch (err: any) {
      console.error("Error deleting blog:", err);
      showNotification(err.message || "Có lỗi xảy ra khi xóa blog", "error");
    }
  };

  // Show notification
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);

    // Also show toast
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle form input changes
  const handleFormChange = (field: keyof CreateBlogRequest, value: string) => {
    setBlogForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const stats = getBlogStats();

  if (loading && blogs.length === 0) {
    return (
      <div className="admin-blog-management">
        <div className="admin-blog-management-container">
          <div className="admin-blog-loading">
            <div className="admin-blog-loading-spinner"></div>
            <p>Đang tải danh sách blog...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-blog-management">
        <div className="admin-blog-management-container">
          <div className="admin-blog-error">
            <AlertCircle size={48} className="error-icon" />
            <h3>Có lỗi xảy ra</h3>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="admin-create-button"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-blog-management">
      <div className="admin-blog-management-container">
        {/* Notification */}
        {notification && (
          <div
            className={`admin-notification admin-notification--${notification.type}`}
          >
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="admin-blog-management__header">
          <div className="admin-blog-management__header-content">
            <div>
              <h1 className="admin-blog-management__title">Quản lý Blog</h1>
              <p className="admin-blog-management__subtitle">
                Quản lý bài viết blog của hệ thống ({totalBlogs} bài viết)
              </p>
            </div>
            <button onClick={handleCreate} className="admin-create-button">
              <Plus size={20} />
              Thêm bài viết
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-blog-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-icon total">
              <BookOpen size={24} />
            </div>
            <div className="admin-stat-content">
              <h3>Tổng bài viết</h3>
              <p>{stats.total}</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon published">
              <FileText size={24} />
            </div>
            <div className="admin-stat-content">
              <h3>Đã xuất bản</h3>
              <p>{stats.published}</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon draft">
              <Edit size={24} />
            </div>
            <div className="admin-stat-content">
              <h3>Bản nháp</h3>
              <p>{stats.draft}</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon views">
              <BarChart3 size={24} />
            </div>
            <div className="admin-stat-content">
              <h3>Tổng lượt xem</h3>
              <p>{stats.totalViews}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="admin-blog-management__controls">
          <div className="admin-search-container">
            <Search className="admin-search-icon" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, tác giả, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="admin-category-select"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="admin-sort-controls">
            <button
              onClick={() => handleSort("createdAt")}
              className={`admin-sort-button ${
                sortBy === "createdAt" ? "admin-sort-button--active" : ""
              }`}
            >
              <Calendar size={16} />
              Ngày tạo{" "}
              {sortBy === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
            </button>
            <button
              onClick={() => handleSort("title")}
              className={`admin-sort-button ${
                sortBy === "title" ? "admin-sort-button--active" : ""
              }`}
            >
              <FileText size={16} />
              Tiêu đề {sortBy === "title" && (sortOrder === "asc" ? "▲" : "▼")}
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2>Danh sách bài viết ({filteredAndSortedBlogs.length})</h2>
          </div>

          {filteredAndSortedBlogs.length === 0 ? (
            <div className="admin-empty-state">
              <FileText size={40} />
              <p>Không tìm thấy bài viết nào</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-blog-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Danh mục</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Lượt xem</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedBlogs.map((blog) => (
                    <tr key={blog._id} className="admin-blog-row">
                      <td className="admin-blog-title">
                        <div>
                          <strong>{blog.title}</strong>
                          <p className="admin-blog-excerpt">{blog.excerpt}</p>
                        </div>
                      </td>
                      <td className="admin-blog-author">
                        <User size={14} style={{ marginRight: "5px" }} />
                        {blog.author?.userName || "Không xác định"}
                      </td>
                      <td>
                        <span className="admin-category-tag">
                          {blog.category || "Chưa phân loại"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-status-badge admin-status-${blog.status}`}
                        >
                          {blog.status === "published"
                            ? "Đã xuất bản"
                            : blog.status === "draft"
                            ? "Bản nháp"
                            : blog.status === "archived"
                            ? "Lưu trữ"
                            : blog.status}
                        </span>
                      </td>
                      <td className="admin-blog-date">
                        {formatDate(blog.createdAt)}
                      </td>
                      <td className="admin-blog-views">
                        {blog.viewCount || 0}
                      </td>
                      <td className="admin-blog-actions">
                        <button
                          onClick={() => handleView(blog)}
                          className="admin-action-button admin-action-button--view"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleEdit(blog)}
                          className="admin-action-button admin-action-button--edit"
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(blog)}
                          className="admin-action-button admin-action-button--delete"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="admin-pagination-button"
            >
              Trước
            </button>

            {getPaginationNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`admin-pagination-button ${
                  currentPage === page ? "active" : ""
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="admin-pagination-button"
            >
              Sau
            </button>

            <span className="admin-pagination-info">
              Trang {currentPage} / {totalPages} (Tổng: {totalBlogs} bài viết)
            </span>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div
            className="admin-modal-overlay"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
            }}
          >
            <div
              className="admin-modal admin-modal--form"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal__header">
                <h2>
                  {showCreateModal ? "Thêm bài viết mới" : "Chỉnh sửa bài viết"}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="admin-modal__close"
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={
                  showCreateModal ? handleCreateSubmit : handleEditSubmit
                }
              >
                <div className="admin-modal__body">
                  <div className="admin-form-group">
                    <label>Tiêu đề *</label>
                    <input
                      type="text"
                      value={blogForm.title}
                      onChange={(e) =>
                        handleFormChange("title", e.target.value)
                      }
                      required
                      placeholder="Nhập tiêu đề bài viết"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tóm tắt *</label>
                    <textarea
                      value={blogForm.excerpt}
                      onChange={(e) =>
                        handleFormChange("excerpt", e.target.value)
                      }
                      required
                      placeholder="Nhập tóm tắt bài viết"
                      rows={3}
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Danh mục</label>
                      <select
                        value={blogForm.category}
                        onChange={(e) =>
                          handleFormChange("category", e.target.value)
                        }
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Trạng thái</label>
                      <select
                        value={blogForm.status}
                        onChange={(e) =>
                          handleFormChange("status", e.target.value)
                        }
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="published">Xuất bản</option>
                        <option value="archived">Lưu trữ</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Ảnh đại diện (URL)</label>
                    <input
                      type="url"
                      value={blogForm.featuredImage}
                      onChange={(e) =>
                        handleFormChange("featuredImage", e.target.value)
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Nội dung *</label>
                    <textarea
                      value={blogForm.content}
                      onChange={(e) =>
                        handleFormChange("content", e.target.value)
                      }
                      required
                      placeholder="Nhập nội dung bài viết"
                      rows={10}
                    />
                  </div>
                </div>
                <div className="admin-modal__actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                    }}
                    className="admin-modal-button admin-modal-button--cancel"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="admin-modal-button admin-modal-button--primary"
                  >
                    {showCreateModal ? "Tạo bài viết" : "Cập nhật"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedBlog && (
          <div
            className="admin-modal-overlay"
            onClick={() => setShowViewModal(false)}
          >
            <div
              className="admin-modal admin-modal--view"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal__header">
                <h2>{selectedBlog.title}</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="admin-modal__close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="admin-modal__body">
                <div className="admin-blog-meta">
                  <div className="admin-meta-row">
                    <span>
                      <strong>Tác giả:</strong>
                    </span>
                    <span>
                      {selectedBlog.author?.userName || "Không xác định"}
                    </span>
                  </div>
                  <div className="admin-meta-row">
                    <span>
                      <strong>Danh mục:</strong>
                    </span>
                    <span>{selectedBlog.category || "Chưa phân loại"}</span>
                  </div>
                  <div className="admin-meta-row">
                    <span>
                      <strong>Trạng thái:</strong>
                    </span>
                    <span
                      className={`admin-status-badge admin-status-${selectedBlog.status}`}
                    >
                      {selectedBlog.status === "published"
                        ? "Đã xuất bản"
                        : selectedBlog.status === "draft"
                        ? "Bản nháp"
                        : selectedBlog.status === "archived"
                        ? "Lưu trữ"
                        : selectedBlog.status}
                    </span>
                  </div>
                  <div className="admin-meta-row">
                    <span>
                      <strong>Ngày tạo:</strong>
                    </span>
                    <span>{formatDate(selectedBlog.createdAt)}</span>
                  </div>
                  <div className="admin-meta-row">
                    <span>
                      <strong>Lượt xem:</strong>
                    </span>
                    <span>{selectedBlog.viewCount || 0}</span>
                  </div>
                </div>

                {selectedBlog.featuredImage && (
                  <div className="admin-featured-image">
                    <img
                      src={selectedBlog.featuredImage}
                      alt={selectedBlog.title}
                    />
                  </div>
                )}

                <div className="admin-blog-content">
                  <h3>Tóm tắt:</h3>
                  <p>{selectedBlog.excerpt}</p>

                  <h3>Nội dung:</h3>
                  <div className="admin-content-display">
                    {selectedBlog.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && blogToDelete && (
          <div
            className="admin-modal-overlay"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="admin-modal admin-modal--confirm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal__header">
                <h2>Xác nhận xóa</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="admin-modal__close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="admin-modal__body">
                <p>Bạn có chắc chắn muốn xóa bài viết:</p>
                <p className="admin-blog-title-confirm">
                  "{blogToDelete.title}"
                </p>
                <p>Hành động này không thể hoàn tác.</p>
              </div>
              <div className="admin-modal__actions">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="admin-modal-button admin-modal-button--cancel"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="admin-modal-button admin-modal-button--delete"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogManagement;
