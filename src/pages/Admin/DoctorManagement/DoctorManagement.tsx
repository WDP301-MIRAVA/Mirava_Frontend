import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Ban,
  Check,
  Star,
  User,
} from "lucide-react";
import "./DoctorManagement.css";

interface Doctor {
  id: string;
  userName: string;
  email: string;
  phone: string;
  role: string;
  specialty: string;
  workSchedule: string;
  status: "active" | "blocked";
  imageUrl?: string;
  description: string;
  rating: number;
  createdDate: Date;
}

const initialDoctorForm = {
  userName: "",
  email: "",
  phone: "",
  specialty: "",
  workSchedule: "",
  description: "",
};

const initialDoctors: Doctor[] = []; // Thay bằng dữ liệu mẫu nếu cần

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "specialty" | "createdDate">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "block" | "activate";
    doctorId: string;
    doctorName: string;
  } | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorDetail, setShowDoctorDetail] = useState(false);
  const [newDoctor, setNewDoctor] = useState(initialDoctorForm);

  const filteredAndSortedDoctors = useMemo(() => {
    const filtered = doctors.filter((doctor) =>
      [doctor.userName, doctor.email, doctor.phone].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    const sorted = [...filtered].sort((a, b) => {
      const aValue: string | number | Date =
        a[sortBy === "name" ? "userName" : sortBy];
      const bValue: string | number | Date =
        b[sortBy === "name" ? "userName" : sortBy];
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [doctors, searchTerm, sortBy, sortOrder]);

  const handleAddDoctor = useCallback(() => {
    const doctor: Doctor = {
      id: Date.now().toString(),
      userName: newDoctor.userName,
      email: newDoctor.email,
      phone: newDoctor.phone,
      role: "Bác sĩ",
      specialty: newDoctor.specialty,
      workSchedule: newDoctor.workSchedule,
      status: "active",
      description: newDoctor.description,
      rating: 5.0,
      createdDate: new Date(),
    };
    setDoctors((prev) => [...prev, doctor]);
    setShowAddModal(false);
    setNewDoctor(initialDoctorForm);
  }, [newDoctor]);

  const handleConfirmAction = useCallback(() => {
    if (!confirmAction) return;
    setDoctors((prev) =>
      confirmAction.type === "delete"
        ? prev.filter((doctor) => doctor.id !== confirmAction.doctorId)
        : prev.map((doctor) =>
            doctor.id === confirmAction.doctorId
              ? {
                  ...doctor,
                  status: confirmAction.type === "block" ? "blocked" : "active",
                }
              : doctor
          )
    );
    setShowConfirmModal(false);
    setConfirmAction(null);
  }, [confirmAction]);

  const showConfirmDialog = useCallback(
    (
      type: "delete" | "block" | "activate",
      doctorId: string,
      doctorName: string
    ) => {
      setConfirmAction({ type, doctorId, doctorName });
      setShowConfirmModal(true);
    },
    []
  );

  const viewDoctorDetail = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorDetail(true);
  }, []);

  // Modal components tách ra cho dễ đọc
  const AddDoctorModal = (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="add-doctor-button">Thêm Bác Sĩ Mới</h2>
          <button onClick={() => setShowAddModal(false)} className="close-btn">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {["userName", "email", "phone", "specialty", "workSchedule"].map(
            (field, idx) => (
              <div className="form-group" key={field}>
                <label>
                  {
                    [
                      "Tên Bác Sĩ",
                      "Email",
                      "Số Điện Thoại",
                      "Chuyên Khoa",
                      "Lịch Làm Việc",
                    ][idx]
                  }
                </label>
                <input
                  type={
                    field === "email"
                      ? "email"
                      : field === "phone"
                      ? "tel"
                      : "text"
                  }
                  value={newDoctor[field as keyof typeof newDoctor]}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, [field]: e.target.value })
                  }
                  placeholder={
                    field === "workSchedule"
                      ? "Ví dụ: Thứ 2-6: 8:00-17:00"
                      : `Nhập ${
                          [
                            "tên bác sĩ",
                            "email",
                            "số điện thoại",
                            "chuyên khoa",
                            "lịch làm việc",
                          ][idx]
                        }...`
                  }
                />
              </div>
            )
          )}
          <div className="form-group">
            <label>Mô Tả</label>
            <textarea
              value={newDoctor.description}
              onChange={(e) =>
                setNewDoctor({ ...newDoctor, description: e.target.value })
              }
              placeholder="Nhập mô tả về bác sĩ..."
              rows={3}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={() => setShowAddModal(false)} className="cancel-btn">
            Hủy
          </button>
          <button onClick={handleAddDoctor} className="confirm-btn">
            Thêm Bác Sĩ
          </button>
        </div>
      </div>
    </div>
  );

  const ConfirmModal = (
    <div className="modal-overlay">
      <div className="modal confirmation-modal">
        <div className="modal-header">
          <h2>Xác Nhận Thao Tác</h2>
        </div>
        <div className="modal-body">
          <p>
            Bạn có chắc chắn muốn {confirmAction?.type === "delete" && "xóa"}
            {confirmAction?.type === "block" && "khóa"}
            {confirmAction?.type === "activate" && "kích hoạt"} bác sĩ{" "}
            <strong>{confirmAction?.doctorName}</strong>?
          </p>
        </div>
        <div className="modal-footer">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="cancel-btn"
          >
            Hủy
          </button>
          <button onClick={handleConfirmAction} className="confirm-btn danger">
            Xác Nhận
          </button>
        </div>
      </div>
    </div>
  );

  const DoctorDetailModal = (
    <div className="modal-overlay">
      <div className="modal doctor-detail-modal">
        <div className="modal-header">
          <h2>Thông Tin Chi Tiết Bác Sĩ</h2>
          <button
            onClick={() => setShowDoctorDetail(false)}
            className="close-btn"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="doctor-profile">
            <div className="doctor-avatar-large">
              {selectedDoctor?.imageUrl ? (
                <img
                  src={selectedDoctor.imageUrl}
                  alt={selectedDoctor.userName}
                />
              ) : (
                <User size={80} />
              )}
            </div>
            <div className="doctor-info">
              <h3>{selectedDoctor?.userName}</h3>
              <div className="rating">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.floor(selectedDoctor?.rating ?? 0)
                        ? "star-filled"
                        : "star-empty"
                    }
                  />
                ))}
                <span className="rating-text">
                  ({selectedDoctor?.rating}/5.0)
                </span>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Email:</strong> {selectedDoctor?.email}
                </div>
                <div className="info-item">
                  <strong>Số điện thoại:</strong> {selectedDoctor?.phone}
                </div>
                <div className="info-item">
                  <strong>Chuyên khoa:</strong> {selectedDoctor?.specialty}
                </div>
                <div className="info-item">
                  <strong>Lịch làm việc:</strong> {selectedDoctor?.workSchedule}
                </div>
                <div className="info-item">
                  <strong>Vai trò:</strong> {selectedDoctor?.role}
                </div>
                <div className="info-item">
                  <strong>Trạng thái:</strong>
                  <span className={`status-badge ${selectedDoctor?.status}`}>
                    {selectedDoctor?.status === "active"
                      ? "Hoạt động"
                      : "Bị khóa"}
                  </span>
                </div>
              </div>
              <div className="description">
                <strong>Mô tả:</strong>
                <p>{selectedDoctor?.description}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            onClick={() => setShowDoctorDetail(false)}
            className="cancel-btn"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="doctor-management">
      <div className="header">
        <h1 className="title">Quản Lý Bác Sĩ</h1>
        <button
          className="add-doctor-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} /> Thêm Bác Sĩ Mới
        </button>
      </div>
      <div className="controls">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-container">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field as "name" | "specialty" | "createdDate");
              setSortOrder(order as "asc" | "desc");
            }}
            className="sort-select"
          >
            <option value="name-asc">Sắp xếp: Tên (A-Z)</option>
            <option value="name-desc">Sắp xếp: Tên (Z-A)</option>
            <option value="specialty-asc">Sắp xếp: Chuyên khoa (A-Z)</option>
            <option value="specialty-desc">Sắp xếp: Chuyên khoa (Z-A)</option>
            <option value="createdDate-asc">Sắp xếp: Ngày tạo (Cũ nhất)</option>
            <option value="createdDate-desc">
              Sắp xếp: Ngày tạo (Mới nhất)
            </option>
          </select>
        </div>
      </div>
      <div className="table-container">
        <table className="doctors-table">
          <thead>
            <tr>
              <th>Tên Bác Sĩ</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Vai Trò</th>
              <th>Chuyên Khoa</th>
              <th>Lịch Làm Việc</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedDoctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>
                  <div className="doctor-name-cell">
                    <div
                      className="doctor-avatar"
                      onClick={() => viewDoctorDetail(doctor)}
                    >
                      {doctor.imageUrl ? (
                        <img src={doctor.imageUrl} alt={doctor.userName} />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <span
                      className="doctor-name-link"
                      onClick={() => viewDoctorDetail(doctor)}
                    >
                      {doctor.userName}
                    </span>
                  </div>
                </td>
                <td>{doctor.email}</td>
                <td>{doctor.phone}</td>
                <td>{doctor.role}</td>
                <td>{doctor.specialty}</td>
                <td>{doctor.workSchedule}</td>
                <td>
                  <span className={`status-badge ${doctor.status}`}>
                    {doctor.status === "active" ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" title="Chỉnh sửa">
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      title="Xóa"
                      onClick={() =>
                        showConfirmDialog("delete", doctor.id, doctor.userName)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className={`action-btn ${
                        doctor.status === "active"
                          ? "block-btn"
                          : "activate-btn"
                      }`}
                      title={
                        doctor.status === "active"
                          ? "Khóa tài khoản"
                          : "Kích hoạt tài khoản"
                      }
                      onClick={() =>
                        showConfirmDialog(
                          doctor.status === "active" ? "block" : "activate",
                          doctor.id,
                          doctor.userName
                        )
                      }
                    >
                      {doctor.status === "active" ? (
                        <Ban size={16} />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAddModal && AddDoctorModal}
      {showConfirmModal && confirmAction && ConfirmModal}
      {showDoctorDetail && selectedDoctor && DoctorDetailModal}
    </div>
  );
};

export default DoctorManagement;
