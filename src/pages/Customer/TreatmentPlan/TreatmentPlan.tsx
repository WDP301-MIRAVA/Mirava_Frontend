import React, { useState, useEffect } from "react";
import "./TreatmentPlan.css";
import { type TreatmentPlan as ApiTreatmentPlan } from "../../../services/treatmentPlan.service";
import {
  FileText,
  // Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface TreatmentStep {
  id: string;
  name: string;
  date?: string;
  doctorNote?: string;
  performedBy?: string;
  status: "pending" | "completed" | "in-progress";
  category: string;
  stage?: string;
  executionDate?: string;
  description?: string;
  type?: string;
  scheduledDates?: string[];
  medicalRecords?: string[];
}

interface PatientInfo {
  _id: string;
  userName: string;
  email: string;
  phone: string;
  patientCode: string;
}

interface DoctorInfo {
  _id: string;
  user: {
    userName: string;
    email: string;
    phone: string;
  };
  specialty: string;
  degree: string;
  description: string;
  imageUrl: string;
}
interface Attachment {
  url: string;
  name?: string;
  type?: string;
}
interface RecordDetail {
  date?: string;
  type?: string;
  title?: string;
  conclusion?: string;
  notes?: string;
  attachments?: Attachment[]; // hoặc interface Attachment[] nếu có định dạng chuẩn
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    weight?: string;
    temperature?: string;
  };
  hormoneLevels?: {
    fsh?: string;
    lh?: string;
    estradiol?: string;
    progesterone?: string;
  };
  ultrasound?: {
    follicleCount?: number;
    endometrialThickness?: string;
    leftOvary?: string;
    rightOvary?: string;
  };
}
interface TreatmentEventStep {
  title: string;
  type?: string;
  stage?: string;
  description?: string;
  scheduledDates?: string[]; // ISO date strings
  executionDate?: string; // ISO date string
  performedBy?: string;
  doctorNote?: string;
  medicalRecords?: string[]; // <-- nên định nghĩa cụ thể hơn nếu biết
  status?: "completed" | "in_progress" | "pending";
}
const TreatmentPlan: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setPlans] = useState<ApiTreatmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ApiTreatmentPlan | null>(
    null
  );
  const [activeView, setActiveView] = useState<
    "overview" | "timeline" | "calendar"
  >("overview");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [, setSelectedDate] = useState<string | null>(null);
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([]);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);

  // Medical Records
  const [recordDetail, setRecordDetail] = useState<RecordDetail | null>(null);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);

  // Notification handler
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      toast(customEvent.detail.message);
    };

    window.addEventListener("mirava-notification", handler);

    return () => {
      window.removeEventListener("mirava-notification", handler);
    };
  }, []);

  // Fetch treatment plans and related data
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        let patientId =
          localStorage.getItem("patientId") ||
          sessionStorage.getItem("patientId");
        if (!patientId) {
          const urlParams = new URLSearchParams(window.location.search);
          patientId = urlParams.get("patientId");
        }

        if (!patientId) {
          setPlans([]);
          setError("Không có kế hoạch điều trị vì thiếu patientId");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `https://mirava-f0rz.onrender.com/api/treatment-plan/patient/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response?.data?.data && Array.isArray(response.data.data)) {
          setPlans(response.data.data);
          if (response.data.data.length > 0) {
            const plan = response.data.data[0];
            setSelectedPlan(plan);

            if (plan.patient) {
              setPatientInfo(plan.patient);
            }

            // Set doctor info
            if (plan.doctor) {
              setDoctorInfo(plan.doctor);
            }

            // Process treatment events
            if (plan.treatmentEvents && Array.isArray(plan.treatmentEvents)) {
              const steps: TreatmentStep[] = plan.treatmentEvents.map(
                (event: TreatmentEventStep, idx: number) => ({
                  id: `${idx + 1}`,
                  name: event.title,
                  category: event.type || "Tư vấn",
                  status:
                    event.status === "completed"
                      ? "completed"
                      : event.status === "in_progress"
                      ? "in-progress"
                      : "pending",
                  stage: event.stage,
                  description: event.description,
                  type: event.type,
                  scheduledDates: event.scheduledDates,
                  executionDate: event.executionDate
                    ? new Date(event.executionDate).toISOString().split("T")[0]
                    : undefined,
                  date:
                    event.scheduledDates && event.scheduledDates.length > 0
                      ? new Date(event.scheduledDates[0])
                          .toISOString()
                          .split("T")[0]
                      : undefined,
                  performedBy: event.performedBy || "",
                  doctorNote: event.doctorNote || "",
                  medicalRecords: event.medicalRecords || [],
                })
              );
              setTreatmentSteps(steps);
            }
          }
        } else {
          setPlans([]);
          setError("Không tìm thấy kế hoạch điều trị từ API");
        }
      } catch (err) {
        console.error("Error fetching treatment plans:", err);
        setError("Có lỗi xảy ra khi tải kế hoạch điều trị");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (day: number) => {
    if (!selectedPlan) return [];
    const dateString = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return treatmentSteps.filter(
      (step) => step.executionDate === dateString || step.date === dateString
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: number) => {
    const dateString = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const events = getEventsForDate(day);
    if (events.length > 0) {
      setSelectedDate(dateString);
    }
  };

  // const formatDate = (dateString?: string) => {
  //   if (!dateString) return "";
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString("vi-VN", {
  //     weekday: "long",
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   });
  // };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return "Chưa xác định";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Handle medical record viewing
  const handleViewMedicalRecord = async (recordId: string) => {
    setLoadingRecord(true);
    try {
      const res = await axios.get(
        `https://mirava-f0rz.onrender.com/api/medicalRecord/${recordId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (res.data.success) {
        setRecordDetail(res.data.data);
        setRecordModalOpen(true);
      } else {
        toast.error("Không thể tải chi tiết hồ sơ y tế");
      }
    } catch (err) {
      console.error("Error fetching medical record:", err);
      setRecordDetail(null);
      toast.error("Không thể tải chi tiết hồ sơ y tế");
    }
    setLoadingRecord(false);
  };

  // Get status icon and text
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="status-icon completed" size={20} />;
      case "in-progress":
        return <AlertCircle className="status-icon in-progress" size={20} />;
      default:
        return <XCircle className="status-icon pending" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Đã hoàn thành";
      case "in-progress":
        return "Đang thực hiện";
      default:
        return "Chưa thực hiện";
    }
  };

  // Calculate treatment statistics
  const treatmentStats = {
    total: treatmentSteps.length,
    completed: treatmentSteps.filter((step) => step.status === "completed")
      .length,
    inProgress: treatmentSteps.filter((step) => step.status === "in-progress")
      .length,
    pending: treatmentSteps.filter((step) => step.status === "pending").length,
  };

  const completionPercentage =
    treatmentStats.total > 0
      ? Math.round((treatmentStats.completed / treatmentStats.total) * 100)
      : 0;

  // Reminder system
  const useUpcomingReminders = (treatmentSteps: TreatmentStep[]) => {
    const remindedRef = React.useRef<{ [key: string]: boolean }>({});
    const [stepIndex, setStepIndex] = React.useState(0);

    useEffect(() => {
      if (!treatmentSteps || treatmentSteps.length === 0) return;

      const interval = setInterval(() => {
        const now = new Date();
        const upcomingSteps = treatmentSteps.filter(
          (step) =>
            step.scheduledDates &&
            step.scheduledDates.length > 0 &&
            new Date(step.scheduledDates[0]).getTime() >=
              new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              ).getTime() &&
            step.status !== "completed"
        );

        if (upcomingSteps.length === 0) return;

        const idx = stepIndex % upcomingSteps.length;
        const step = upcomingSteps[idx];
        const notifyId = `${step.id}-${step.scheduledDates?.[0] || "no-date"}`;

        if (!remindedRef.current[notifyId]) {
          window.dispatchEvent(
            new CustomEvent("mirava-notification", {
              detail: {
                id: `${notifyId}-${Date.now()}`,
                message: `Nhắc nhở: Sắp đến lịch "${
                  step.name
                }" vào ngày ${formatDateShort(step.scheduledDates?.[0])}`,
                read: false,
                time: new Date().toLocaleTimeString("vi-VN"),
              },
            })
          );
          remindedRef.current[notifyId] = true;
        }

        setStepIndex((prev) => prev + 1);
      }, 10000); // 10 seconds interval

      return () => clearInterval(interval);
    }, [treatmentSteps, stepIndex]);
  };

  useUpcomingReminders(treatmentSteps);

  // Render medical record modal
  const renderMedicalRecordModal = () =>
    recordModalOpen && (
      <div
        className="tp-modal-overlay"
        onClick={() => setRecordModalOpen(false)}
      >
        <div className="tp-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="tp-modal-header">
            <h3>Chi tiết hồ sơ y tế</h3>
            <button
              className="tp-modal-close"
              onClick={() => setRecordModalOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="tp-modal-body">
            {loadingRecord ? (
              <div className="tp-loading">
                <div className="tp-loading-spinner"></div>
                <p>Đang tải...</p>
              </div>
            ) : recordDetail ? (
              <div className="tp-record-details">
                <div className="tp-record-item">
                  <strong>Ngày:</strong>{" "}
                  {recordDetail.date ? formatDateShort(recordDetail.date) : "-"}
                </div>
                <div className="tp-record-item">
                  <strong>Loại:</strong> {recordDetail.type || "-"}
                </div>
                <div className="tp-record-item">
                  <strong>Tiêu đề:</strong> {recordDetail.title || "-"}
                </div>
                <div className="tp-record-item">
                  <strong>Kết luận:</strong> {recordDetail.conclusion || "-"}
                </div>
                <div className="tp-record-item">
                  <strong>Ghi chú:</strong> {recordDetail.notes || "-"}
                </div>
                <div className="tp-record-item">
                  <strong>Dấu hiệu sinh tồn:</strong>
                  <div>
                    Huyết áp: {recordDetail.vitals?.bloodPressure || "-"}
                    <br />
                    Nhịp tim: {recordDetail.vitals?.heartRate || "-"}
                    <br />
                    Cân nặng: {recordDetail.vitals?.weight || "-"} kg
                    <br />
                    Nhiệt độ: {recordDetail.vitals?.temperature || "-"} °C
                  </div>
                </div>
                <div className="tp-record-item">
                  <strong>Chỉ số hormone:</strong>
                  <div>
                    FSH: {recordDetail.hormoneLevels?.fsh ?? "-"}
                    <br />
                    LH: {recordDetail.hormoneLevels?.lh ?? "-"}
                    <br />
                    Estradiol: {recordDetail.hormoneLevels?.estradiol ?? "-"}
                    <br />
                    Progesterone:{" "}
                    {recordDetail.hormoneLevels?.progesterone ?? "-"}
                  </div>
                </div>
                <div className="tp-record-item">
                  <strong>Kết quả siêu âm:</strong>
                  <div>
                    Số nang noãn:{" "}
                    {recordDetail.ultrasound?.follicleCount ?? "-"}
                    <br />
                    Độ dày nội mạc:{" "}
                    {recordDetail.ultrasound?.endometrialThickness ?? "-"} mm
                    <br />
                    Buồng trứng trái:{" "}
                    {recordDetail.ultrasound?.leftOvary || "-"}
                    <br />
                    Buồng trứng phải:{" "}
                    {recordDetail.ultrasound?.rightOvary || "-"}
                  </div>
                </div>
                {recordDetail.attachments &&
                  recordDetail.attachments.length > 0 && (
                    <div className="tp-record-item">
                      <strong>File đính kèm (Hình ảnh):</strong>
                      <div className="tp-attachments">
                        {recordDetail.attachments.map((attachment, idx) => {
                          // attachment là string (url)
                          const url =
                            typeof attachment === "string"
                              ? attachment
                              : attachment.url;
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                            url
                          );
                          return isImage ? (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Xem ảnh lớn"
                              style={{
                                display: "inline-block",
                                marginRight: 12,
                                marginBottom: 12,
                                borderRadius: 8,
                                border: "1px solid #ccc",
                                overflow: "hidden",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                              }}
                            >
                              <img
                                src={url}
                                alt={`attachment-${idx + 1}`}
                                style={{
                                  maxWidth: 120,
                                  maxHeight: 120,
                                  display: "block",
                                }}
                              />
                            </a>
                          ) : (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tp-attachment-link"
                              style={{
                                display: "inline-block",
                                marginRight: 12,
                                marginBottom: 12,
                                color: "#2563eb",
                                wordBreak: "break-all",
                              }}
                            >
                              📎 {`Tệp đính kèm ${idx + 1}`}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="tp-no-data">Không có dữ liệu</div>
            )}
          </div>
        </div>
      </div>
    );

  if (loading) {
    return (
      <div className="tp-container">
        <div className="tp-loading-container">
          <div className="tp-loading-spinner"></div>
          <p>Đang tải kế hoạch điều trị...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tp-container">
        <div className="tp-error-container">
          <div className="tp-error-icon">⚠️</div>
          <h2>Không thể tải kế hoạch điều trị</h2>
          <p>{error}</p>
          <button
            className="tp-btn-primary"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tp-container">
      {/* Header Section */}
      <div className="tp-header">
        <div className="tp-header-content">
          <div className="tp-header-left">
            <h1 className="tp-title">Kế Hoạch Điều Trị</h1>
            <p className="tp-subtitle">
              Theo dõi tiến trình điều trị hiếm muộn của bạn
            </p>
          </div>
          {doctorInfo && (
            <div className="tp-doctor-info">
              <div className="tp-doctor-avatar">
                <img
                  src={doctorInfo.imageUrl || "https://via.placeholder.com/80"}
                  alt="Doctor"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/80";
                  }}
                />
              </div>
              <div className="tp-doctor-details">
                <h3>{doctorInfo.user?.userName || "Bác sĩ"}</h3>
                <p>{doctorInfo.specialty || "Chuyên khoa"}</p>
                <div className="tp-doctor-contact">
                  <span>
                    <Mail size={14} />
                    {doctorInfo.user?.email}
                  </span>
                  <span>
                    <Phone size={14} />
                    {doctorInfo.user?.phone}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Info Card */}
      {patientInfo && (
        <div className="tp-patient-card">
          <div className="tp-patient-header">
            <User className="tp-patient-icon" size={24} />
            <h3>Thông tin bệnh nhân</h3>
          </div>
          <div className="tp-patient-details">
            <div className="tp-patient-item">
              <strong>Họ tên:</strong> {patientInfo.userName}
            </div>
            <div className="tp-patient-item">
              <strong>Mã BN:</strong> {patientInfo.patientCode}
            </div>
            <div className="tp-patient-item">
              <strong>Email:</strong> {patientInfo.email}
            </div>
            <div className="tp-patient-item">
              <strong>SĐT:</strong> {patientInfo.phone}
            </div>
            {selectedPlan && (
              <div className="tp-patient-item">
                <strong>Ngày bắt đầu:</strong>{" "}
                {formatDateShort(selectedPlan.cycleStartDate)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="tp-stats-grid">
        <div className="tp-stat-card">
          <div className="tp-stat-icon total">
            <FileText size={24} />
          </div>
          <div className="tp-stat-content">
            <h3>Tổng số bước</h3>
            <p>{treatmentStats.total}</p>
          </div>
        </div>
        <div className="tp-stat-card">
          <div className="tp-stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="tp-stat-content">
            <h3>Đã hoàn thành</h3>
            <p>{treatmentStats.completed}</p>
          </div>
        </div>
        <div className="tp-stat-card">
          <div className="tp-stat-icon in-progress">
            <AlertCircle size={24} />
          </div>
          <div className="tp-stat-content">
            <h3>Đang thực hiện</h3>
            <p>{treatmentStats.inProgress}</p>
          </div>
        </div>
        <div className="tp-stat-card">
          <div className="tp-stat-icon pending">
            <XCircle size={24} />
          </div>
          <div className="tp-stat-content">
            <h3>Chưa thực hiện</h3>
            <p>{treatmentStats.pending}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="tp-progress-container">
        <div className="tp-progress-header">
          <h3>Tiến độ điều trị</h3>
          <span className="tp-progress-percentage">
            {completionPercentage}%
          </span>
        </div>
        <div className="tp-progress-bar">
          <div
            className="tp-progress-fill"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="tp-progress-text">
          Đã hoàn thành {treatmentStats.completed} / {treatmentStats.total} bước
          điều trị
        </p>
      </div>

      {/* View Toggle */}
      <div className="tp-view-toggle">
        <button
          className={`tp-toggle-btn ${
            activeView === "overview" ? "active" : ""
          }`}
          onClick={() => setActiveView("overview")}
        >
          <FileText size={16} />
          Tổng quan
        </button>
        <button
          className={`tp-toggle-btn ${
            activeView === "timeline" ? "active" : ""
          }`}
          onClick={() => setActiveView("timeline")}
        >
          <Clock size={16} />
          Timeline
        </button>
        {/* <button
          className={`tp-toggle-btn ${
            activeView === "calendar" ? "active" : ""
          }`}
          onClick={() => setActiveView("calendar")}
        >
          <Calendar size={16} />
          Lịch
        </button> */}
      </div>

      {/* Content Area */}
      <div className="tp-content">
        {activeView === "overview" && (
          <div className="tp-overview">
            <div className="tp-table-container">
              <div className="tp-table-header">
                <h2>Chi tiết kế hoạch điều trị</h2>
              </div>
              <div className="tp-table-wrapper">
                <table className="tp-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Bước điều trị</th>
                      <th>Giai đoạn</th>
                      <th>Loại</th>
                      <th>Trạng thái</th>
                      <th>Ngày hẹn</th>
                      <th>Ngày thực hiện</th>
                      <th>Người thực hiện</th>
                      <th>Ghi chú</th>
                      <th>Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatmentSteps.map((step, idx) => (
                      <tr
                        key={step.id}
                        className={`tp-table-row ${step.status}`}
                      >
                        <td>{idx + 1}</td>
                        <td>
                          <div className="tp-step-name">{step.name}</div>
                        </td>
                        <td>
                          <span className="tp-stage-badge">
                            {step.stage || "-"}
                          </span>
                        </td>
                        <td>
                          <span className="tp-type-badge">
                            {step.type || "-"}
                          </span>
                        </td>
                        <td>
                          <div className="tp-status-cell">
                            {getStatusIcon(step.status)}
                            <span className={`tp-status-text ${step.status}`}>
                              {getStatusText(step.status)}
                            </span>
                          </div>
                        </td>
                        <td>
                          {step.scheduledDates && step.scheduledDates.length > 0
                            ? formatDateShort(step.scheduledDates[0])
                            : "-"}
                        </td>
                        <td>
                          {step.executionDate
                            ? formatDateShort(step.executionDate)
                            : "-"}
                        </td>
                        <td>{step.performedBy || "-"}</td>
                        <td>
                          <div className="tp-notes-cell">
                            {step.doctorNote || step.description || "-"}
                          </div>
                        </td>
                        <td>
                          {step.medicalRecords &&
                          step.medicalRecords.length > 0 ? (
                            <button
                              className="tp-view-btn"
                              onClick={() =>
                                handleViewMedicalRecord(
                                  step.medicalRecords?.[0] || ""
                                )
                              }
                            >
                              <Eye size={14} />
                              Xem kết quả
                            </button>
                          ) : (
                            <span className="tp-no-result">Chưa có</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === "timeline" && (
          <div className="tp-timeline">
            <div className="tp-timeline-container">
              <h2>Timeline điều trị</h2>
              <div className="tp-timeline-content">
                {treatmentSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`tp-timeline-item ${step.status}`}
                  >
                    <div className="tp-timeline-marker">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="tp-timeline-content-item">
                      <div className="tp-timeline-header">
                        <h3>{step.name}</h3>
                        <span className="tp-timeline-date">
                          {step.scheduledDates && step.scheduledDates.length > 0
                            ? formatDateShort(step.scheduledDates[0])
                            : "Chưa xác định"}
                        </span>
                      </div>
                      <div className="tp-timeline-details">
                        <p>
                          <strong>Giai đoạn:</strong>{" "}
                          {step.stage || "Chưa xác định"}
                        </p>
                        <p>
                          <strong>Loại:</strong> {step.type || "Chưa xác định"}
                        </p>
                        <p>
                          <strong>Trạng thái:</strong>{" "}
                          {getStatusText(step.status)}
                        </p>
                        {step.description && (
                          <p>
                            <strong>Mô tả:</strong> {step.description}
                          </p>
                        )}
                        {step.performedBy && (
                          <p>
                            <strong>Thực hiện bởi:</strong> {step.performedBy}
                          </p>
                        )}
                      </div>
                      {step.medicalRecords &&
                        step.medicalRecords.length > 0 && (
                          <button
                            className="tp-view-btn"
                            onClick={() =>
                              handleViewMedicalRecord(
                                step.medicalRecords?.[0] || ""
                              )
                            }
                          >
                            <Eye size={14} />
                            Xem kết quả
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === "calendar" && (
          <div className="tp-calendar">
            <div className="tp-calendar-header">
              <button
                className="tp-nav-btn"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft size={20} />
              </button>
              <h2>
                {currentMonth.toLocaleDateString("vi-VN", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                className="tp-nav-btn"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="tp-calendar-grid">
              <div className="tp-calendar-weekdays">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                  <div key={day} className="tp-weekday">
                    {day}
                  </div>
                ))}
              </div>
              <div className="tp-calendar-days">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const events = day ? getEventsForDate(day) : [];
                  return (
                    <div
                      key={index}
                      className={`tp-calendar-day ${
                        day ? "active" : "inactive"
                      } ${events.length > 0 ? "has-events" : ""}`}
                      onClick={() => day && handleDateClick(day)}
                    >
                      {day && (
                        <>
                          <span className="tp-day-number">{day}</span>
                          {events.length > 0 && (
                            <div className="tp-event-indicators">
                              {events.map((event) => (
                                <div
                                  key={event.id}
                                  className={`tp-event-dot ${event.status}`}
                                ></div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* {selectedDate && (
              <div className="tp-event-details">
                <div className="tp-event-header">
                  <h3>Chi tiết lịch hẹn - {formatDate(selectedDate)}</h3>
                  <button
                    className="tp-close-btn"
                    onClick={() => setSelectedDate(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="tp-event-content">
                  {treatmentSteps
                    .filter(
                      (step) =>
                        step.executionDate === selectedDate ||
                        step.date === selectedDate
                    )
                    .map((step) => (
                      <div
                        key={step.id}
                        className={`tp-event-card ${step.status}`}
                      >
                        <div className="tp-event-card-header">
                          {getStatusIcon(step.status)}
                          <span className="tp-event-title">{step.name}</span>
                        </div>
                        <div className="tp-event-card-content">
                          <p>
                            <strong>Giai đoạn:</strong> {step.stage || "-"}
                          </p>
                          <p>
                            <strong>Loại:</strong> {step.type || "-"}
                          </p>
                          <p>
                            <strong>Trạng thái:</strong>{" "}
                            {getStatusText(step.status)}
                          </p>
                          {step.description && (
                            <p>
                              <strong>Mô tả:</strong> {step.description}
                            </p>
                          )}
                          {step.performedBy && (
                            <p>
                              <strong>Thực hiện bởi:</strong> {step.performedBy}
                            </p>
                          )}
                          {step.medicalRecords &&
                            step.medicalRecords.length > 0 && (
                              <button
                                className="tp-view-btn"
                                onClick={() =>
                                  handleViewMedicalRecord(
                                    step.medicalRecords![0]
                                  )
                                }
                              >
                                <Eye size={14} />
                                Xem kết quả
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )} */}
          </div>
        )}
      </div>

      {/* Notification Section */}
      <div className="tp-notification">
        <div className="tp-notification-icon">🔔</div>
        <div className="tp-notification-content">
          <h4>Thông báo nhắc nhở</h4>
          <p>
            Bạn sẽ nhận được nhắc nhở về lịch hẹn và thuốc qua SMS hoặc Email.
          </p>
        </div>
      </div>

      {/* Medical Record Modal */}
      {renderMedicalRecordModal()}
    </div>
  );
};

export default TreatmentPlan;
