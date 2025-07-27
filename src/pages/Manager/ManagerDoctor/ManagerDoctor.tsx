import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Eye,
  UserCheck,
  UserX,
  Stethoscope,
  Users,
  UserPlus,
} from "lucide-react";
import "./ManagerDoctor.css";

interface Doctor {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
  };
  specialty: string;
  degree: string;
  experience: number;
  description: string;
  imageUrl?: string;
  status: "active" | "inactive";
  workSchedule?: string[];
  rating?: number;
  createdAt: string;
}

const ManagerDoctor: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Doctor | "name">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "block" | "activate";
    doctorId: string;
    doctorName: string;
  } | null>(null);

  // Form states
  const [newDoctor, setNewDoctor] = useState({
    userName: "",
    email: "",
    password: "123456",
    phone: "",
    specialty: "",
    degree: "",
    experience: 0,
    description: "",
    imageUrl: "",
  });

  const [editDoctor, setEditDoctor] = useState({
    degree: "",
    specialty: "",
    experience: 0,
    description: "",
    imageUrl: "",
  });

  const [specialties, setSpecialties] = useState<string[]>([]);

  // Fetch doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter and search doctors
  useEffect(() => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.user.userName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.user.phone.includes(searchTerm) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((doctor) => doctor.status === statusFilter);
    }

    if (specialtyFilter !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.specialty === specialtyFilter
      );
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, statusFilter, specialtyFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/doctor",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (response.status === 403) {
          throw new Error("Bạn không có quyền truy cập tính năng này.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log("API Response:", data);

      if (Array.isArray(data)) {
        setDoctors(data);
        const uniqueSpecialties = [
          ...new Set(data.map((doctor: Doctor) => doctor.specialty)),
        ] as string[];
        setSpecialties(uniqueSpecialties);
      } else if (data.doctors && Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
        const uniqueSpecialties = [
          ...new Set(data.doctors.map((doctor: Doctor) => doctor.specialty)),
        ] as string[];
        setSpecialties(uniqueSpecialties);
      } else {
        throw new Error("Dữ liệu trả về không đúng định dạng");
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Doctor | "name") => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...filteredDoctors].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (field === "name") {
        aValue = a.user.userName;
        bValue = b.user.userName;
      } else {
        aValue = a[field] as string | number;
        bValue = b[field] as string | number;
      }

      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDoctors(sorted);
  };

  const handleAddDoctor = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/auth/doctor/register",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: newDoctor.userName,
            email: newDoctor.email,
            password: newDoctor.password,
            phone: newDoctor.phone,
            degree: newDoctor.degree,
            specialty: newDoctor.specialty,
            experience: newDoctor.experience,
            description: newDoctor.description,
            imageUrl: newDoctor.imageUrl,
          }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Không thể thêm bác sĩ";

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }

        throw new Error(errorMessage);
      }

      await fetchDoctors();
      setShowAddModal(false);
      setNewDoctor({
        userName: "",
        email: "",
        password: "123456",
        phone: "",
        specialty: "",
        degree: "",
        experience: 0,
        description: "",
        imageUrl: "",
      });
      setError(null);
    } catch (err) {
      console.error("Error adding doctor:", err);
      setError(err instanceof Error ? err.message : "Không thể thêm bác sĩ");
    }
  };

  const handleEditDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/doctor/${selectedDoctor._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            degree: editDoctor.degree,
            specialty: editDoctor.specialty,
            experience: editDoctor.experience,
            description: editDoctor.description,
            imageUrl: editDoctor.imageUrl,
          }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Không thể cập nhật bác sĩ";

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }

        throw new Error(errorMessage);
      }

      await fetchDoctors();
      setShowEditModal(false);
      setSelectedDoctor(null);
      setError(null);
    } catch (err) {
      console.error("Error updating doctor:", err);
      setError(
        err instanceof Error ? err.message : "Không thể cập nhật bác sĩ"
      );
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/doctor/${doctorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Không thể xóa bác sĩ";

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }

        throw new Error(errorMessage);
      }

      await fetchDoctors();
      setError(null);
    } catch (err) {
      console.error("Error deleting doctor:", err);
      setError(err instanceof Error ? err.message : "Không thể xóa bác sĩ");
    }
  };

  const handleStatusToggle = async (
    doctorId: string,
    currentStatus: string
  ) => {
    try {
      const token = localStorage.getItem("accessToken");
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/doctor/${doctorId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Không thể thay đổi trạng thái bác sĩ";

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
          }
        } else {
          const errorText = await response.text();
          console.error("API returned HTML/text instead of JSON:", errorText);

          if (response.status === 404) {
            errorMessage = "Không tìm thấy bác sĩ";
          } else if (response.status === 500) {
            errorMessage = "Lỗi server, vui lòng thử lại sau";
          }
        }

        throw new Error(errorMessage);
      }

      await fetchDoctors();
      setError(null);
    } catch (err) {
      console.error("Error updating doctor status:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể thay đổi trạng thái bác sĩ"
      );
    }
  };

  const openEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setEditDoctor({
      degree: doctor.degree,
      specialty: doctor.specialty,
      experience: doctor.experience,
      description: doctor.description,
      imageUrl: doctor.imageUrl || "",
    });
    setShowEditModal(true);
  };

  const openDetailModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailModal(true);
  };

  const showConfirmDialog = (
    type: "delete" | "block" | "activate",
    doctorId: string,
    doctorName: string
  ) => {
    setConfirmAction({ type, doctorId, doctorName });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === "delete") {
        await handleDeleteDoctor(confirmAction.doctorId);
      } else {
        const doctor = doctors.find((d) => d._id === confirmAction.doctorId);
        if (doctor) {
          await handleStatusToggle(confirmAction.doctorId, doctor.status);
        }
      }

      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (err) {
      console.error("Error in confirm action:", err);
    }
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "Hoạt động" : "Tạm dừng";
  };

  const getSortIcon = (field: keyof Doctor | "name") => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  if (loading) {
    return (
      <div className="md-loading">
        <div className="md-loading-spinner"></div>
        <p>Đang tải danh sách bác sĩ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="md-loading">
        <p className="md-error-message">Lỗi: {error}</p>
        <button onClick={fetchDoctors} className="md-retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="md-container">
      {/* Stats Cards */}
      <div className="md-stats">
        <div className="md-stat-card">
          <div className="md-stat-icon">
            <Users size={24} />
          </div>
          <div className="md-stat-content">
            <h3>Tổng bác sĩ</h3>
            <p>{doctors.length}</p>
          </div>
        </div>
        <div className="md-stat-card">
          <div className="md-stat-icon active">
            <UserCheck size={24} />
          </div>
          <div className="md-stat-content">
            <h3>Đang hoạt động</h3>
            <p>{doctors.filter((d) => d.status === "active").length}</p>
          </div>
        </div>
        <div className="md-stat-card">
          <div className="md-stat-icon inactive">
            <UserX size={24} />
          </div>
          <div className="md-stat-content">
            <h3>Tạm dừng</h3>
            <p>{doctors.filter((d) => d.status === "inactive").length}</p>
          </div>
        </div>
        <div className="md-stat-card">
          <div className="md-stat-icon specialty">
            <Stethoscope size={24} />
          </div>
          <div className="md-stat-content">
            <h3>Chuyên khoa</h3>
            <p>{specialties.length}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="md-controls">
        <div className="md-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, SĐT hoặc chuyên khoa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          className="md-filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm dừng</option>
        </select>
        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="md-filter-select"
        >
          <option value="all">Tất cả chuyên khoa</option>
          {specialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
        <button onClick={() => setShowAddModal(true)} className="md-add-btn">
          <Plus size={20} />
          Thêm bác sĩ
        </button>
      </div>

      {/* Table */}
      <div className="md-table-container">
        <div className="md-table-header">
          <h2>Danh sách bác sĩ ({filteredDoctors.length})</h2>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="md-no-data">
            <Stethoscope size={40} />
            <p>Không có bác sĩ nào được tìm thấy</p>
          </div>
        ) : (
          <div className="md-table-wrapper">
            <table className="md-table">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="md-sortable"
                  >
                    Bác sĩ{getSortIcon("name")}
                  </th>
                  <th>Liên hệ</th>
                  <th
                    onClick={() => handleSort("specialty")}
                    className="md-sortable"
                  >
                    Chuyên khoa{getSortIcon("specialty")}
                  </th>
                  {/* <th
                    onClick={() => handleSort("experience")}
                    className="md-sortable"
                  >
                    Kinh nghiệm{getSortIcon("experience")}
                  </th> */}
                  <th
                    onClick={() => handleSort("status")}
                    className="md-sortable"
                  >
                    Trạng thái{getSortIcon("status")}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>
                      <div className="md-doctor-info">
                        <div className="md-doctor-avatar">
                          {doctor.imageUrl ? (
                            <img
                              src={doctor.imageUrl}
                              alt={doctor.user.userName}
                            />
                          ) : (
                            <div className="md-avatar-placeholder">
                              {doctor.user.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="md-doctor-details">
                          <div className="md-doctor-name">
                            {doctor.user.userName}
                          </div>
                          <div className="md-doctor-degree">
                            {doctor.degree}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="md-contact-info">
                        <div className="md-contact-item">
                          <span>{doctor.user.email}</span>
                        </div>
                        <div className="md-contact-item">
                          <span>{doctor.user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="md-specialty-badge">
                        {doctor.specialty}
                      </div>
                    </td>
                    {/* <td>
                      <div className="md-experience">
                        {doctor.experience} năm
                      </div>
                    </td> */}
                    <td>
                      <span className={`md-status md-status-${doctor.status}`}>
                        {getStatusText(doctor.status)}
                      </span>
                    </td>
                    <td>
                      <div className="md-action-buttons">
                        <button
                          className="md-action-btn md-view-btn"
                          onClick={() => openDetailModal(doctor)}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="md-action-btn md-edit-btn"
                          onClick={() => openEditModal(doctor)}
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className={`md-action-btn ${
                            doctor.status === "active"
                              ? "md-block-btn"
                              : "md-activate-btn"
                          }`}
                          onClick={() =>
                            showConfirmDialog(
                              doctor.status === "active" ? "block" : "activate",
                              doctor._id,
                              doctor.user.userName
                            )
                          }
                          title={
                            doctor.status === "active"
                              ? "Tạm dừng"
                              : "Kích hoạt"
                          }
                        >
                          {doctor.status === "active" ? (
                            <UserX size={16} />
                          ) : (
                            <UserCheck size={16} />
                          )}
                        </button>
                        {/* <button
                          className="md-action-btn md-delete-btn"
                          onClick={() =>
                            showConfirmDialog(
                              "delete",
                              doctor._id,
                              doctor.user.userName
                            )
                          }
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div
          className="md-modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="md-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md-modal-header">
              <h2>Thêm bác sĩ mới</h2>
              <button
                className="md-close-button"
                onClick={() => setShowAddModal(false)}
              >
                ✖
              </button>
            </div>
            <div className="md-modal-body">
              <div className="md-form-grid">
                <div className="md-form-group">
                  <label>Tên bác sĩ *</label>
                  <input
                    type="text"
                    value={newDoctor.userName}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, userName: e.target.value })
                    }
                    placeholder="Nhập tên bác sĩ"
                  />
                </div>
                <div className="md-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newDoctor.email}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, email: e.target.value })
                    }
                    placeholder="Nhập email"
                  />
                </div>
                <div className="md-form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    value={newDoctor.phone}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, phone: e.target.value })
                    }
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="md-form-group">
                  <label>Mật khẩu *</label>
                  <input
                    type="password"
                    value={newDoctor.password}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, password: e.target.value })
                    }
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                <div className="md-form-group">
                  <label>Chuyên khoa *</label>
                  <input
                    type="text"
                    value={newDoctor.specialty}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, specialty: e.target.value })
                    }
                    placeholder="Nhập chuyên khoa"
                  />
                </div>
                <div className="md-form-group">
                  <label>Bằng cấp *</label>
                  <input
                    type="text"
                    value={newDoctor.degree}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, degree: e.target.value })
                    }
                    placeholder="Nhập bằng cấp"
                  />
                </div>
                {/* <div className="md-form-group">
                  <label>Kinh nghiệm (năm) *</label>
                  <input
                    type="number"
                    value={newDoctor.experience}
                    onChange={(e) =>
                      setNewDoctor({
                        ...newDoctor,
                        experience: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Nhập số năm kinh nghiệm"
                    min="0"
                  />
                </div> */}
                <div className="md-form-group">
                  <label>URL ảnh đại diện</label>
                  <input
                    type="url"
                    value={newDoctor.imageUrl}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, imageUrl: e.target.value })
                    }
                    placeholder="Nhập URL ảnh đại diện"
                  />
                </div>
                <div className="md-form-group md-full-width">
                  <label>Mô tả</label>
                  <textarea
                    value={newDoctor.description}
                    onChange={(e) =>
                      setNewDoctor({
                        ...newDoctor,
                        description: e.target.value,
                      })
                    }
                    placeholder="Nhập mô tả về bác sĩ"
                    rows={4}
                  />
                </div>
              </div>
              <div className="md-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="md-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAddDoctor}
                  className="md-btn-primary"
                >
                  <UserPlus size={16} />
                  Thêm bác sĩ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && selectedDoctor && (
        <div
          className="md-modal-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="md-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md-modal-header">
              <h2>Chỉnh sửa thông tin bác sĩ</h2>
              <button
                className="md-close-button"
                onClick={() => setShowEditModal(false)}
              >
                ✖
              </button>
            </div>
            <div className="md-modal-body">
              <div className="md-form-grid">
                <div className="md-form-group">
                  <label>Chuyên khoa *</label>
                  <input
                    type="text"
                    value={editDoctor.specialty}
                    onChange={(e) =>
                      setEditDoctor({
                        ...editDoctor,
                        specialty: e.target.value,
                      })
                    }
                    placeholder="Nhập chuyên khoa"
                  />
                </div>
                <div className="md-form-group">
                  <label>Bằng cấp *</label>
                  <input
                    type="text"
                    value={editDoctor.degree}
                    onChange={(e) =>
                      setEditDoctor({ ...editDoctor, degree: e.target.value })
                    }
                    placeholder="Nhập bằng cấp"
                  />
                </div>
                {/* <div className="md-form-group">
                  <label>Kinh nghiệm (năm) *</label>
                  <input
                    type="number"
                    value={editDoctor.experience}
                    onChange={(e) =>
                      setEditDoctor({
                        ...editDoctor,
                        experience: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Nhập số năm kinh nghiệm"
                    min="0"
                  />
                </div> */}
                <div className="md-form-group">
                  <label>URL ảnh đại diện</label>
                  <input
                    type="url"
                    value={editDoctor.imageUrl}
                    onChange={(e) =>
                      setEditDoctor({ ...editDoctor, imageUrl: e.target.value })
                    }
                    placeholder="Nhập URL ảnh đại diện"
                  />
                </div>
                <div className="md-form-group md-full-width">
                  <label>Mô tả</label>
                  <textarea
                    value={editDoctor.description}
                    onChange={(e) =>
                      setEditDoctor({
                        ...editDoctor,
                        description: e.target.value,
                      })
                    }
                    placeholder="Nhập mô tả về bác sĩ"
                    rows={4}
                  />
                </div>
              </div>
              <div className="md-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="md-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleEditDoctor}
                  className="md-btn-primary"
                >
                  <Edit size={16} />
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedDoctor && (
        <div
          className="md-modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="md-modal-content md-large-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md-modal-header">
              <h2>Chi tiết bác sĩ</h2>
              <button
                className="md-close-button"
                onClick={() => setShowDetailModal(false)}
              >
                ✖
              </button>
            </div>
            <div className="md-modal-body">
              <div className="md-doctor-detail">
                <div className="md-doctor-profile">
                  <div className="md-profile-avatar">
                    {selectedDoctor.imageUrl ? (
                      <img
                        src={selectedDoctor.imageUrl}
                        alt={selectedDoctor.user.userName}
                      />
                    ) : (
                      <div className="md-avatar-placeholder large">
                        {selectedDoctor.user.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="md-profile-info">
                    <h3>{selectedDoctor.user.userName}</h3>
                    <p className="md-profile-degree">{selectedDoctor.degree}</p>
                    <p className="md-profile-specialty">
                      {selectedDoctor.specialty}
                    </p>
                    <span
                      className={`md-status md-status-${selectedDoctor.status}`}
                    >
                      {getStatusText(selectedDoctor.status)}
                    </span>
                  </div>
                </div>
                <div className="md-detail-grid">
                  <div className="md-detail-item">
                    <label>Email:</label>
                    <span>{selectedDoctor.user.email}</span>
                  </div>
                  <div className="md-detail-item">
                    <label>Số điện thoại:</label>
                    <span>{selectedDoctor.user.phone}</span>
                  </div>
                  {/* <div className="md-detail-item">
                    <label>Kinh nghiệm:</label>
                    <span>{selectedDoctor.experience} năm</span>
                  </div> */}
                  <div className="md-detail-item">
                    <label>Ngày tham gia:</label>
                    <span>
                      {new Date(selectedDoctor.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  {selectedDoctor.description && (
                    <div className="md-detail-item md-full-width">
                      <label>Mô tả:</label>
                      <span>{selectedDoctor.description}</span>
                    </div>
                  )}
                  {selectedDoctor.workSchedule &&
                    selectedDoctor.workSchedule.length > 0 && (
                      <div className="md-detail-item md-full-width">
                        <label>Lịch làm việc:</label>
                        <ul className="md-schedule-list">
                          {selectedDoctor.workSchedule.map(
                            (schedule, index) => (
                              <li key={index}>{schedule}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
              <div className="md-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="md-btn-secondary"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedDoctor);
                  }}
                  className="md-btn-primary"
                >
                  <Edit size={16} />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && confirmAction && (
        <div
          className="md-modal-overlay"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="md-modal-content md-small-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md-modal-header">
              <h2>Xác nhận thao tác</h2>
              <button
                className="md-close-button"
                onClick={() => setShowConfirmModal(false)}
              >
                ✖
              </button>
            </div>
            <div className="md-modal-body">
              <p>
                Bạn có chắc chắn muốn {confirmAction.type === "delete" && "xóa"}
                {confirmAction.type === "block" && "tạm dừng"}
                {confirmAction.type === "activate" && "kích hoạt"} bác sĩ{" "}
                <strong>{confirmAction.doctorName}</strong>?
              </p>
              <div className="md-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="md-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className="md-btn-danger"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDoctor;
