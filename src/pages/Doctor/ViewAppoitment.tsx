import { DoctorService } from "@/services/doctor.service";
import React, { useState, useEffect } from "react";
import { Search, Calendar, Phone, Mail, MapPin, Check } from "lucide-react";
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

          if (sortedAppointments.length > 0 && sortedAppointments[0].doctor) {
            setDoctorInfo(sortedAppointments[0].doctor);
          }
        } else {
          setAppointments([]);
          setFilteredAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);

        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          message.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
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
    const refreshInterval = setInterval(fetchAppointments, 4 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  useEffect(() => {
    let filtered = appointments;
    if (searchTerm) {
      filtered = filtered.filter((appointment) =>
        appointment.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

  if (isLoading) {
    return (
      <div className="va-loading">
        <div className="va-loading-spinner"></div>
        <p>Đang tải danh sách cuộc hẹn...</p>
      </div>
    );
  }

  if (!doctorInfo && appointments.length === 0) {
    return (
      <div className="va-loading">
        <div className="va-error-message">
          <h2>Không có cuộc hẹn nào</h2>
          <p>Bạn chưa có cuộc hẹn nào được lên lịch.</p>
        </div>
      </div>
    );
  }

  if (!doctorInfo) {
    return (
      <div className="va-loading">
        <div className="va-error-message">
          <h2>Không thể tải thông tin bác sĩ</h2>
          <p>
            Phiên làm việc đã hết hạn hoặc đã xảy ra lỗi. Vui lòng đăng nhập
            lại.
          </p>
          <button
            className="va-login-again-btn"
            onClick={() => navigate("/login")}
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="va-container">
      {/* Doctor Header */}
      <div className="va-header">
        <div className="va-doctor-info">
          <img
            src={doctorInfo.imageUrl || "https://via.placeholder.com/60"}
            alt="Doctor avatar"
            className="va-doctor-avatar"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/60";
            }}
          />
          <div className="va-doctor-details">
            <h1 className="va-doctor-name">
              {doctorInfo.user?.userName || "Bác sĩ"}
            </h1>
            <p className="va-doctor-specialty">
              {doctorInfo.specialty} • {doctorInfo.degree}
            </p>
          </div>
        </div>
        <button className="va-logout-btn" onClick={handleLogout}>
          <LogoutOutlined />
          Đăng xuất
        </button>
      </div>

      {/* Controls */}
      <div className="va-controls">
        <div className="va-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "pending" | "confirmed")
          }
          className="va-filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
        </select>
      </div>

      {/* Table */}
      <div className="va-table-container">
        <div className="va-table-header">
          <h2>Danh sách cuộc hẹn ({filteredAppointments.length})</h2>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="va-no-data">
            <Calendar size={40} />
            <p>Không có cuộc hẹn nào phù hợp với tiêu chí tìm kiếm</p>
          </div>
        ) : (
          <div className="va-table-wrapper">
            <table className="va-table">
              <thead>
                <tr>
                  <th>Mã BN</th>
                  <th>Tên bệnh nhân</th>
                  <th>Liên hệ</th>
                  <th>Ngày hẹn</th>
                  <th>Giới tính</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      <div className="va-patient-code">
                        {appointment.patientCode}
                      </div>
                    </td>
                    <td>
                      <div className="va-patient-name">
                        {appointment.fullName}
                      </div>
                    </td>
                    <td>
                      <div className="va-contact">
                        <div className="va-contact-item">
                          <Mail size={14} />
                          <span>{appointment.email}</span>
                        </div>
                        <div className="va-contact-item">
                          <Phone size={14} />
                          <span>{appointment.phone}</span>
                        </div>
                        <div className="va-contact-item">
                          <MapPin size={14} />
                          <span>{appointment.address}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="va-date-time">
                        <div className="va-date">
                          {formatDate(appointment.date)}
                        </div>
                        <div className="va-time">
                          {formatTime(appointment.date)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="va-gender">
                        {appointment.gender === "Male" ? "Nam" : "Nữ"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`va-status va-status-${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td>
                      <div className="va-note">
                        {appointment.note ? (
                          <span title={appointment.note}>
                            {appointment.note.length > 30
                              ? `${appointment.note.substring(0, 30)}...`
                              : appointment.note}
                          </span>
                        ) : (
                          <span className="va-no-note">Không có ghi chú</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {appointment.status === "pending" && (
                        <button
                          onClick={() =>
                            handleConfirmAppointment(appointment._id)
                          }
                          className="va-confirm-btn"
                        >
                          <Check size={16} />
                          Xác nhận
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAppointment;
