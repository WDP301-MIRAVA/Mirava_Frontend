import React, { useState, useMemo } from "react";
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

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: "1",
      userName: "BS. Nguyễn Văn An",
      email: "nguyenvanan@hospital.com",
      phone: "0123456789",
      role: "Bác sĩ chính",
      specialty: "Tim mạch",
      workSchedule: "Thứ 2-6: 8:00-17:00",
      status: "active",
      imageUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
      description: "Bác sĩ chuyên khoa tim mạch với 15 năm kinh nghiệm",
      rating: 4.8,
      createdDate: new Date("2023-01-15"),
    },
    {
      id: "2",
      userName: "BS. Trần Thị Bình",
      email: "tranthibinh@hospital.com",
      phone: "0987654321",
      role: "Bác sĩ",
      specialty: "Nhi khoa",
      workSchedule: "Thứ 2-7: 7:30-16:30",
      status: "active",
      imageUrl:
        "https://images.unsplash.com/photo-1594824797298-a3c096c78c38?w=100&h=100&fit=crop&crop=face",
      description: "Chuyên gia nhi khoa với chuyên môn cao về bệnh lý trẻ em",
      rating: 4.9,
      createdDate: new Date("2023-02-20"),
    },
    {
      id: "3",
      userName: "BS. Lê Minh Cường",
      email: "leminhcuong@hospital.com",
      phone: "0369258147",
      role: "Bác sĩ",
      specialty: "Chấn thương chỉnh hình",
      workSchedule: "Thứ 3-7: 9:00-18:00",
      status: "blocked",
      imageUrl:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
      description:
        "Bác sĩ chuyên khoa chấn thương chỉnh hình, phẫu thuật xương khớp",
      rating: 4.6,
      createdDate: new Date("2023-03-10"),
    },
  ]);

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
  const [newDoctor, setNewDoctor] = useState({
    userName: "",
    email: "",
    phone: "",
    specialty: "",
    workSchedule: "",
    description: "",
  });

  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = doctors.filter(
      (doctor) =>
        doctor.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.phone.includes(searchTerm)
    );

    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case "name":
          aValue = a.userName;
          bValue = b.userName;
          break;
        case "specialty":
          aValue = a.specialty;
          bValue = b.specialty;
          break;
        case "createdDate":
          aValue = a.createdDate;
          bValue = b.createdDate;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [doctors, searchTerm, sortBy, sortOrder]);

  const handleAddDoctor = () => {
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

    setDoctors([...doctors, doctor]);
    setShowAddModal(false);
    setNewDoctor({
      userName: "",
      email: "",
      phone: "",
      specialty: "",
      workSchedule: "",
      description: "",
    });
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    const { type, doctorId } = confirmAction;

    if (type === "delete") {
      setDoctors(doctors.filter((doctor) => doctor.id !== doctorId));
    } else if (type === "block" || type === "activate") {
      setDoctors(
        doctors.map((doctor) =>
          doctor.id === doctorId
            ? { ...doctor, status: type === "block" ? "blocked" : "active" }
            : doctor
        )
      );
    }

    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const showConfirmDialog = (
    type: "delete" | "block" | "activate",
    doctorId: string,
    doctorName: string
  ) => {
    setConfirmAction({ type, doctorId, doctorName });
    setShowConfirmModal(true);
  };

  const viewDoctorDetail = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorDetail(true);
  };

  return (
    <div className="doctor-management">
      <div className="header">
        <h1 className="title">Quản Lý Bác Sĩ</h1>
        <button
          className="add-doctor-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          Thêm Bác Sĩ Mới
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

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="add-doctor-button">Thêm Bác Sĩ Mới</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="close-btn"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên Bác Sĩ</label>
                <input
                  type="text"
                  value={newDoctor.userName}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, userName: e.target.value })
                  }
                  placeholder="Nhập tên bác sĩ..."
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, email: e.target.value })
                  }
                  placeholder="Nhập email..."
                />
              </div>
              <div className="form-group">
                <label>Số Điện Thoại</label>
                <input
                  type="tel"
                  value={newDoctor.phone}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, phone: e.target.value })
                  }
                  placeholder="Nhập số điện thoại..."
                />
              </div>
              <div className="form-group">
                <label>Chuyên Khoa</label>
                <input
                  type="text"
                  value={newDoctor.specialty}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, specialty: e.target.value })
                  }
                  placeholder="Nhập chuyên khoa..."
                />
              </div>
              <div className="form-group">
                <label>Lịch Làm Việc</label>
                <input
                  type="text"
                  value={newDoctor.workSchedule}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, workSchedule: e.target.value })
                  }
                  placeholder="Ví dụ: Thứ 2-6: 8:00-17:00"
                />
              </div>
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
              <button
                onClick={() => setShowAddModal(false)}
                className="cancel-btn"
              >
                Hủy
              </button>
              <button onClick={handleAddDoctor} className="confirm-btn">
                Thêm Bác Sĩ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="modal-overlay">
          <div className="modal confirmation-modal">
            <div className="modal-header">
              <h2>Xác Nhận Thao Tác</h2>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn {confirmAction.type === "delete" && "xóa"}
                {confirmAction.type === "block" && "khóa"}
                {confirmAction.type === "activate" && "kích hoạt"} bác sĩ{" "}
                <strong>{confirmAction.doctorName}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="cancel-btn"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAction}
                className="confirm-btn danger"
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Detail Modal */}
      {showDoctorDetail && selectedDoctor && (
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
                  {selectedDoctor.imageUrl ? (
                    <img
                      src={selectedDoctor.imageUrl}
                      alt={selectedDoctor.userName}
                    />
                  ) : (
                    <User size={80} />
                  )}
                </div>
                <div className="doctor-info">
                  <h3>{selectedDoctor.userName}</h3>
                  <div className="rating">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.floor(selectedDoctor.rating)
                            ? "star-filled"
                            : "star-empty"
                        }
                      />
                    ))}
                    <span className="rating-text">
                      ({selectedDoctor.rating}/5.0)
                    </span>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Email:</strong> {selectedDoctor.email}
                    </div>
                    <div className="info-item">
                      <strong>Số điện thoại:</strong> {selectedDoctor.phone}
                    </div>
                    <div className="info-item">
                      <strong>Chuyên khoa:</strong> {selectedDoctor.specialty}
                    </div>
                    <div className="info-item">
                      <strong>Lịch làm việc:</strong>{" "}
                      {selectedDoctor.workSchedule}
                    </div>
                    <div className="info-item">
                      <strong>Vai trò:</strong> {selectedDoctor.role}
                    </div>
                    <div className="info-item">
                      <strong>Trạng thái:</strong>
                      <span className={`status-badge ${selectedDoctor.status}`}>
                        {selectedDoctor.status === "active"
                          ? "Hoạt động"
                          : "Bị khóa"}
                      </span>
                    </div>
                  </div>
                  <div className="description">
                    <strong>Mô tả:</strong>
                    <p>{selectedDoctor.description}</p>
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
      )}
    </div>
  );
};

export default DoctorManagement;
