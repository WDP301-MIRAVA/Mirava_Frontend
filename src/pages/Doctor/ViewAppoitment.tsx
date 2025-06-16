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
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
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
              background: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
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
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm bệnh nhân theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "pending" | "confirmed")
            }
            className="status-filter"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-section">
        <div className="section-header">
          <h2>Danh sách cuộc hẹn ({filteredAppointments.length})</h2>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="no-appointments">
            <Calendar size={48} />
            <h3>Không có cuộc hẹn nào</h3>
            <p>
              Không tìm thấy cuộc hẹn phù hợp với tiêu chí tìm kiếm của bạn.
            </p>
          </div>
        ) : (
          <div className="appointments-grid">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card">
                <div className="card-header">
                  <div className="patient-info">
                    <h3 className="patient-name">{appointment.fullName}</h3>
                    <span
                      className={`status-badge ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  <div className="appointment-date">
                    <Calendar size={16} />
                    <div>
                      <div className="date">{formatDate(appointment.date)}</div>
                      <div className="time">{formatTime(appointment.date)}</div>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="contact-info">
                    <div className="info-item">
                      <Mail size={16} />
                      <span>{appointment.email}</span>
                    </div>
                    <div className="info-item">
                      <Phone size={16} />
                      <span>{appointment.phone}</span>
                    </div>
                    <div className="info-item">
                      <MapPin size={16} />
                      <span>{appointment.address}</span>
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-row">
                      <span className="label">Chuyên khoa:</span>
                      <span className="value">{appointment.specialty}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Giới tính:</span>
                      <span className="value">
                        {appointment.gender === "Male" ? "Nam" : "Nữ"}
                      </span>
                    </div>
                    {appointment.note && (
                      <div className="note-section">
                        <FileText size={16} />
                        <div>
                          <span className="label">Ghi chú:</span>
                          <p className="note-text">{appointment.note}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {appointment.status === "pending" && (
                  <div className="card-footer">
                    <button
                      onClick={() => handleConfirmAppointment(appointment._id)}
                      className="confirm-button"
                    >
                      <Check size={16} />
                      Xác nhận cuộc hẹn
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAppointment;
