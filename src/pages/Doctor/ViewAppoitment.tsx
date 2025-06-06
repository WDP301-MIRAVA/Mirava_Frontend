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

  // Mock data based on the provided API response
  const mockData: Appointment[] = [
    {
      _id: "6841a802b41ee89b9ab1bce9",
      fullName: "Hưng",
      email: "hungptse172889@fpt.edu.vn",
      phone: "0333913530",
      address: "Dong Nai",
      doctor: {
        _id: "6841a77f6eb5e7849d19df9b",
        user: {
          _id: "6841a77f6eb5e7849d19df99",
          userName: "Phạm Tuấn Hưng Hàa",
          email: "hunghaaa12@gmail.com",
          phone: "0976543810",
        },
        degree: "MD, PhD in Reproductive Immunology",
        specialty: "Miễn dịch học sinh sản",
        workSchedule: [
          "Tuesday 9:00-17:00",
          "Wednesday 9:00-17:00",
          "Friday 9:00-17:00",
        ],
        description:
          "Chuyên gia hàng đầu về miễn dịch học sinh sản tại Việt Nam",
        imageUrl: "https://example.com/images/doctors/dr-quan.jpg",
      },
      specialty: "IUI",
      gender: "Male",
      date: "2025-06-25T00:00:00.000Z",
      note: "Không có gì",
      status: "pending",
    },
    {
      _id: "6841a865b41ee89b9ab1bcec",
      fullName: "Trần Huy Vũ",
      email: "hungphamwtf@gmail.com",
      phone: "0333913534",
      address: "Gia Kiệm",
      doctor: {
        _id: "6841a77f6eb5e7849d19df9b",
        user: {
          _id: "6841a77f6eb5e7849d19df99",
          userName: "Phạm Tuấn Hưng Hàa",
          email: "hunghaaa12@gmail.com",
          phone: "0976543810",
        },
        degree: "MD, PhD in Reproductive Immunology",
        specialty: "Miễn dịch học sinh sản",
        workSchedule: [
          "Tuesday 9:00-17:00",
          "Wednesday 9:00-17:00",
          "Friday 9:00-17:00",
        ],
        description:
          "Chuyên gia hàng đầu về miễn dịch học sinh sản tại Việt Nam",
        imageUrl: "https://example.com/images/doctors/dr-quan.jpg",
      },
      specialty: "IVF",
      gender: "Female",
      date: "2025-06-20T00:00:00.000Z",
      note: "Có",
      status: "confirmed",
    },
    {
      _id: "6841a865b41ee89b9ab1bced",
      fullName: "Nguyễn Thị Mai",
      email: "mai.nguyen@gmail.com",
      phone: "0987654321",
      address: "Hà Nội",
      doctor: {
        _id: "6841a77f6eb5e7849d19df9b",
        user: {
          _id: "6841a77f6eb5e7849d19df99",
          userName: "Phạm Tuấn Hưng Hàa",
          email: "hunghaaa12@gmail.com",
          phone: "0976543810",
        },
        degree: "MD, PhD in Reproductive Immunology",
        specialty: "Miễn dịch học sinh sản",
        workSchedule: [
          "Tuesday 9:00-17:00",
          "Wednesday 9:00-17:00",
          "Friday 9:00-17:00",
        ],
        description:
          "Chuyên gia hàng đầu về miễn dịch học sinh sản tại Việt Nam",
        imageUrl: "https://example.com/images/doctors/dr-quan.jpg",
      },
      specialty: "IVF",
      gender: "Female",
      date: "2025-06-30T00:00:00.000Z",
      note: "Cần tư vấn kỹ về quy trình",
      status: "pending",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAppointments(mockData);
      setFilteredAppointments(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

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

  const handleConfirmAppointment = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment._id === appointmentId
          ? { ...appointment, status: "confirmed" as const }
          : appointment
      )
    );
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
    return status === "confirmed" ? "confirmed" : "pending";
  };

  const getStatusText = (status: string) => {
    return status === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận";
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách cuộc hẹn...</p>
      </div>
    );
  }

  const doctorInfo = appointments[0]?.doctor;

  return (
    <div className="view-appointment-container">
      {/* Doctor Header */}
      <div className="doctor-header">
        <div className="doctor-avatar">
          <img
            src={doctorInfo?.imageUrl || "/api/placeholder/80/80"}
            alt={doctorInfo?.user.userName}
            onError={(e) => {
              e.currentTarget.src = "/api/placeholder/80/80";
            }}
          />
        </div>
        <div className="doctor-info">
          <h1 className="doctor-name">{doctorInfo?.user.userName}</h1>
          <div className="doctor-details">
            <div className="detail-item">
              <GraduationCap size={16} />
              <span>{doctorInfo?.degree}</span>
            </div>
            <div className="detail-item">
              <User size={16} />
              <span>{doctorInfo?.specialty}</span>
            </div>
            <div className="detail-item">
              <Mail size={16} />
              <span>{doctorInfo?.user.email}</span>
            </div>
            <div className="detail-item">
              <Phone size={16} />
              <span>{doctorInfo?.user.phone}</span>
            </div>
          </div>
          <p className="doctor-description">{doctorInfo?.description}</p>
          <div className="work-schedule">
            <Clock size={16} />
            <span>Lịch làm việc: {doctorInfo?.workSchedule.join(", ")}</span>
          </div>
        </div>
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
