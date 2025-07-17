import { DoctorService } from "@/services/doctor.service";
import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  User,
  GraduationCap,
  Clock,
  Check,
  Eye,
  Filter,
} from "lucide-react";
import "./ViewAppointment.css";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { userServ } from "../../services/userServie";
import { LogoutOutlined } from "@ant-design/icons";
import axiosInstance from "../../services/MainService";
import { BASE_URL } from "../../services/config";
import axios from "axios";

interface Doctor {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
  };
  degree: string;
  specialty: string;
  workSchedule: string[];
  description: string;
  imageUrl: string;
}

interface Appointment {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  doctor: Doctor;
  specialty: string;
  gender: string;
  date: string;
  note: string;
  status: "pending" | "confirmed";
  patientCode: string;
}

const ViewAppointment: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const res = await DoctorService.getDoctorAppointments();
        const data = res.data;
        if (data.success && Array.isArray(data.data)) {
          const sortedAppointments = data.data.sort(
            (a: Appointment, b: Appointment) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setAppointments(sortedAppointments);
          setFilteredAppointments(sortedAppointments);

          // Nếu có dữ liệu cuộc hẹn, lấy thông tin doctor từ cuộc hẹn đầu tiên
          if (sortedAppointments.length > 0 && sortedAppointments[0].doctor) {
            setDoctorInfo(sortedAppointments[0].doctor);
          }
        } else {
          setAppointments([]);
          setFilteredAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);

        // Kiểm tra nếu lỗi 401/403 (Unauthorized/Forbidden)
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          message.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          // Làm sạch localStorage và chuyển hướng về trang login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setTimeout(() => navigate("/login"), 2000);
        }

        setAppointments([]);
        setFilteredAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();

    // Thêm interval để tự động refresh dữ liệu mỗi 4 phút
    const refreshInterval = setInterval(fetchAppointments, 4 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [navigate]);

  useEffect(() => {
    let filtered = appointments;
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((appointment) =>
        appointment.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    setFilteredAppointments(filtered);
  }, [searchTerm, statusFilter, appointments]);

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await axiosInstance.patch(
        `${BASE_URL}/api/appointment/appointments/${appointmentId}/status`,
        { status: "done" }
      );
      // Gọi lại API để lấy danh sách mới nhất
      const res = await DoctorService.getDoctorAppointments();
      const data = res.data;
      if (data.success && Array.isArray(data.data)) {
        setAppointments(data.data);
        setFilteredAppointments(data.data);
        message.success("Cuộc hẹn đã được xác nhận thành công!");
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const getStatusColor = (status: string) => {
    return status === "done" ? "confirmed" : "pending";
  };

  const getStatusText = (status: string) => {
    return status === "done" ? "Đã xác nhận" : "Chờ xác nhận";
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách cuộc hẹn...</p>
      </div>
    );
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");
      if (refreshToken && accessToken) {
        await userServ.postLogout(refreshToken, accessToken);
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      message.success("Đăng xuất thành công!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Đăng xuất thất bại!");
    }
  };

  if (!doctorInfo) {
    return (
      <div className="loading-container">
        <div className="error-message">
          <h2>Không thể tải thông tin bác sĩ</h2>
          <p>
            Phiên làm việc đã hết hạn hoặc đã xảy ra lỗi. Vui lòng đăng nhập
            lại.
          </p>
          <button
            className="login-again-button"
            onClick={() => navigate("/login")}
            style={{
              padding: "10px 20px",
              background: "#00B4C6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "15px",
            }}
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-appointment-container">
      {/* Doctor Header */}
      <div className="doctor-header">
        <div className="doctor-avatar">
          <img
            src={doctorInfo.imageUrl || "https://via.placeholder.com/150"}
            alt="Doctor avatar"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/150";
            }}
          />
        </div>
        <div className="doctor-info">
          <h1 className="doctor-name">
            {doctorInfo.user?.userName || "Bác sĩ"}
          </h1>
          <div className="doctor-details">
            <div className="detail-item">
              <GraduationCap size={16} />
              <span>{doctorInfo.degree || "Chưa cập nhật"}</span>
            </div>
            <div className="detail-item">
              <User size={16} />
              <span>{doctorInfo.specialty || "Chưa cập nhật"}</span>
            </div>
            <div className="detail-item">
              <Mail size={16} />
              <span>{doctorInfo.user?.email || "Chưa cập nhật"}</span>
            </div>
            <div className="detail-item">
              <Phone size={16} />
              <span>{doctorInfo.user?.phone || "Chưa cập nhật"}</span>
            </div>
          </div>
          <p className="doctor-description">
            {doctorInfo.description || "Chưa có mô tả"}
          </p>
          <div className="work-schedule">
            <Clock size={16} />
            <span>
              Lịch làm việc:{" "}
              {doctorInfo.workSchedule?.join(", ") || "Chưa cập nhật"}
            </span>
          </div>
        </div>
        <button className="doctor-logout-btn" onClick={handleLogout}>
          <LogoutOutlined style={{ marginRight: 8 }} />
          Đăng xuất
        </button>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="controls-header">
          <h2>Quản lý cuộc hẹn</h2>
          <div className="controls-actions">
            <div className="search-container">
              <Search size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm bệnh nhân..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-container">
              <Filter size={18} />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "pending" | "confirmed")
                }
                className="status-filter"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="appointments-section">
        <div className="appointments-summary">
          <div className="summary-item">
            <div className="summary-number">{filteredAppointments.length}</div>
            <div className="summary-label">Tổng cuộc hẹn</div>
          </div>
          <div className="summary-item">
            <div className="summary-number">
              {filteredAppointments.filter(apt => apt.status === "pending").length}
            </div>
            <div className="summary-label">Chờ xác nhận</div>
          </div>
          <div className="summary-item">
            <div className="summary-number">
              {filteredAppointments.filter(apt => apt.status === "confirmed").length}
            </div>
            <div className="summary-label">Đã xác nhận</div>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="no-appointments">
            <Calendar size={64} />
            <h3>Không có cuộc hẹn nào</h3>
            <p>Không tìm thấy cuộc hẹn phù hợp với tiêu chí tìm kiếm của bạn.</p>
          </div>
        ) : (
          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Mã BN</th>
                  <th>Tên bệnh nhân</th>
                  <th>Ngày khám</th>
                  <th>Giờ khám</th>
                  <th>Liên hệ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="appointment-row">
                    <td>
                      <div className="patient-code">
                        <span className="code-text">{appointment.patientCode}</span>
                      </div>
                    </td>
                    <td>
                      <div className="patient-info">
                        <div className="patient-name">{appointment.fullName}</div>
                        <div className="patient-gender">
                          {appointment.gender === "Male" ? "Nam" : "Nữ"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="appointment-date">
                        <Calendar size={16} />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="appointment-time">
                        <Clock size={16} />
                        <span>{formatTime(appointment.date)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-item">
                          <Phone size={14} />
                          <span>{appointment.phone}</span>
                        </div>
                        <div className="contact-item">
                          <Mail size={14} />
                          <span>{appointment.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          onClick={() => setSelectedAppointment(appointment)}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        {appointment.status === "pending" && (
                          <button
                            className="confirm-btn"
                            onClick={() => handleConfirmAppointment(appointment._id)}
                            title="Xác nhận cuộc hẹn"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for appointment details */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết cuộc hẹn</h3>
              <button
                className="modal-close"
                onClick={() => setSelectedAppointment(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông tin bệnh nhân</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Mã bệnh nhân:</span>
                    <span className="value">{selectedAppointment.patientCode}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Họ tên:</span>
                    <span className="value">{selectedAppointment.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Giới tính:</span>
                    <span className="value">
                      {selectedAppointment.gender === "Male" ? "Nam" : "Nữ"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Số điện thoại:</span>
                    <span className="value">{selectedAppointment.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedAppointment.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">{selectedAppointment.address}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thông tin cuộc hẹn</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Ngày khám:</span>
                    <span className="value">{formatFullDateTime(selectedAppointment.date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Giờ khám:</span>
                    <span className="value">{formatTime(selectedAppointment.date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Trạng thái:</span>
                    <span className={`status-badge ${getStatusColor(selectedAppointment.status)}`}>
                      {getStatusText(selectedAppointment.status)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAppointment.note && (
                <div className="detail-section">
                  <h4>Ghi chú</h4>
                  <div className="note-content">
                    <FileText size={16} />
                    <p>{selectedAppointment.note}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedAppointment.status === "pending" && (
                <button
                  className="confirm-button"
                  onClick={() => {
                    handleConfirmAppointment(selectedAppointment._id);
                    setSelectedAppointment(null);
                  }}
                >
                  <Check size={16} />
                  Xác nhận cuộc hẹn
                </button>
              )}
              <button
                className="cancel-button"
                onClick={() => setSelectedAppointment(null)}
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

export default ViewAppointment;