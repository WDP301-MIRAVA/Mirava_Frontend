import React, { useState, useEffect } from "react";
import "./TreatmentPlan.css";
import { type TreatmentPlan as ApiTreatmentPlan } from "../../../services/treatmentPlan.service";
import { FileText } from "lucide-react";
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
  medicalRecords?: string[]; // Thêm trường này nếu backend trả về
}

const TreatmentPlan: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<ApiTreatmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ApiTreatmentPlan | null>(
    null
  );
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([]);

  // Medical Records
  const [recordDetail, setRecordDetail] = useState<any>(null);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Hiển thị thông báo, có thể thay bằng toast UI
      toast(e.detail.message);
      // console.log(e.detail.message);
    };
    window.addEventListener("mirava-notification", handler);
    return () => window.removeEventListener("mirava-notification", handler);
  }, []);

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
            setSelectedPlan(response.data.data[0]);
            const plan = response.data.data[0];
            if (plan.treatmentEvents && Array.isArray(plan.treatmentEvents)) {
              const steps: TreatmentStep[] = plan.treatmentEvents.map(
                (event: any, idx: number) => ({
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
                  medicalRecords: event.medicalRecords || [], // lấy id hồ sơ y tế nếu có
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

  // Lấy event theo ngày cho calendar
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

  const selectedDateEvents = selectedDate
    ? treatmentSteps.filter(
        (step) =>
          step.executionDate === selectedDate || step.date === selectedDate
      )
    : [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Hàm lấy chi tiết hồ sơ y tế
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
        alert("Không thể tải chi tiết hồ sơ y tế");
      }
    } catch (err) {
      console.error("Error fetching medical record:", err);
      setRecordDetail(null);
      alert("Không thể tải chi tiết hồ sơ y tế");
    }
    setLoadingRecord(false);
  };

  // Modal hiển thị chi tiết hồ sơ y tế
  const renderMedicalRecordModal = () =>
    recordModalOpen && (
      <div className="modal-overlay">
        <div className="modal">
          <h3>Chi tiết hồ sơ y tế</h3>
          {loadingRecord ? (
            <div>Đang tải...</div>
          ) : recordDetail ? (
            <div>
              <div>
                <b>Ngày:</b>{" "}
                {recordDetail.date
                  ? new Date(recordDetail.date).toLocaleDateString("vi-VN")
                  : "-"}
              </div>
              <div>
                <b>Loại:</b> {recordDetail.type || "-"}
              </div>
              <div>
                <b>Tiêu đề:</b> {recordDetail.title || "-"}
              </div>
              <div>
                <b>Kết luận:</b> {recordDetail.conclusion || "-"}
              </div>
              <div>
                <b>Ghi chú:</b> {recordDetail.notes || "-"}
              </div>
              {recordDetail.attachments &&
                recordDetail.attachments.length > 0 && (
                  <div>
                    <b>File đính kèm:</b>
                    <ul>
                      {recordDetail.attachments.map(
                        (url: string, idx: number) => (
                          <li key={idx}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Xem file {idx + 1}
                            </a>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          ) : (
            <div>Không có dữ liệu</div>
          )}
          <button onClick={() => setRecordModalOpen(false)}>Đóng</button>
        </div>
      </div>
    );

  const useUpcomingReminders = (treatmentSteps: TreatmentStep[]) => {
    const remindedRef = React.useRef<{ [key: string]: boolean }>({});
    const [stepIndex, setStepIndex] = React.useState(0);

    useEffect(() => {
      if (!treatmentSteps || treatmentSteps.length === 0) return;

      const interval = setInterval(() => {
        // Lọc các bước có scheduledDates trong tương lai hoặc hôm nay và chưa completed
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

        // Lấy step theo chỉ số stepIndex, lặp lại nếu hết
        const idx = stepIndex % upcomingSteps.length;
        const step = upcomingSteps[idx];

        // Tạo id duy nhất cho thông báo
        const notifyId = `${step.id}-${step.scheduledDates[0]}`;

        // Đảm bảo không thông báo trùng trong 1 vòng lặp
        if (!remindedRef.current[notifyId]) {
          window.dispatchEvent(
            new CustomEvent("mirava-notification", {
              detail: {
                id: `${notifyId}-${Date.now()}`,
                message: `Nhắc nhở: Sắp đến lịch "${
                  step.name || step.title
                }" vào ngày ${new Date(
                  step.scheduledDates[0]
                ).toLocaleDateString("vi-VN")}`,
                read: false,
                time: new Date().toLocaleTimeString("vi-VN"),
              },
            })
          );
          remindedRef.current[notifyId] = true;
        }

        setStepIndex((prev) => prev + 1);
      }, 5000);

      return () => clearInterval(interval);
    }, [treatmentSteps, stepIndex]);
  };

  // ...trong component TreatmentPlan...
  useUpcomingReminders(treatmentSteps);

  if (loading) {
    return (
      <div className="treatment-plan-container">
        <div className="treatment-plan-header">
          <h1>Kế hoạch điều trị</h1>
          <p className="subtitle">Đang tải dữ liệu...</p>
        </div>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div>⏳ Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="treatment-plan-container">
      <div className="treatment-plan-header">
        <h1>Kế hoạch điều trị</h1>
        {loading ? (
          <div style={{ fontSize: 14, color: "#666", marginTop: "5px" }}>
            Đang tải thông tin kế hoạch điều trị...
          </div>
        ) : error ? (
          <div style={{ fontSize: 14, color: "red", marginTop: "5px" }}>
            {error}
          </div>
        ) : selectedPlan ? (
          <div style={{ fontSize: 14, color: "#666", marginTop: "5px" }}>
            Bác sĩ: {selectedPlan.doctor?.user?.userName || "Chưa cập nhật"} |
            Ngày bắt đầu:{" "}
            {selectedPlan.cycleStartDate
              ? new Date(selectedPlan.cycleStartDate).toLocaleDateString(
                  "vi-VN"
                )
              : "?"}
          </div>
        ) : (
          <div style={{ fontSize: 14, color: "#666", marginTop: "5px" }}>
            Không có kế hoạch điều trị
          </div>
        )}
      </div>

      <div className="plan-detail-container">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${activeView === "list" ? "active" : ""}`}
            onClick={() => setActiveView("list")}
          >
            📋 Danh sách
          </button>
          <button
            className={`toggle-btn ${
              activeView === "calendar" ? "active" : ""
            }`}
            onClick={() => setActiveView("calendar")}
          >
            📅 Lịch
          </button>
        </div>

        {activeView === "list" ? (
          <div className="list-view">
            <div className="main-card">
              <div className="card-header">
                <h2 className="card-header-title">
                  <FileText className="w-6 h-6" />
                  Tiến trình điều trị
                </h2>
              </div>
              <div className="table-container">
                <table className="treatment-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Bước điều trị</th>
                      <th>Giai đoạn</th>
                      <th>Loại</th>
                      <th>Trạng thái</th>
                      <th>Ngày hẹn khám</th>
                      <th>Ngày thực hiện</th>
                      <th>Người thực hiện</th>
                      <th>Ghi chú</th>
                      <th>Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatmentSteps.map((step, idx) => (
                      <tr key={step.id} className={`table-row ${step.status}`}>
                        <td>{idx + 1}</td>
                        <td>{step.name}</td>
                        <td>{step.stage}</td>
                        <td>{step.type}</td>
                        <td>
                          {step.status === "completed"
                            ? "✅ Đã hoàn thành"
                            : step.status === "in-progress"
                            ? "🕒 Đang thực hiện"
                            : "⏳ Chưa thực hiện"}
                        </td>
                        <td>
                          {step.scheduledDates && step.scheduledDates.length > 0
                            ? new Date(
                                step.scheduledDates[0]
                              ).toLocaleDateString("vi-VN")
                            : ""}
                        </td>
                        <td>
                          {step.executionDate
                            ? new Date(step.executionDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : ""}
                        </td>
                        <td>{step.performedBy || "-"}</td>
                        <td>{step.description || "-"}</td>
                        <td>
                          {step.medicalRecords &&
                          step.medicalRecords.length > 0 ? (
                            <button
                              className="view-record-btn"
                              onClick={() =>
                                handleViewMedicalRecord(step.medicalRecords[0])
                              }
                            >
                              Xem kết quả
                            </button>
                          ) : (
                            <span style={{ color: "#aaa" }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="calendar-view">
            <div className="calendar-header">
              <button className="nav-btn" onClick={() => navigateMonth("prev")}>
                ‹
              </button>
              <h2>
                {currentMonth.toLocaleDateString("vi-VN", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button className="nav-btn" onClick={() => navigateMonth("next")}>
                ›
              </button>
            </div>
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>
              <div className="calendar-days">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const events = day ? getEventsForDate(day) : [];
                  return (
                    <div
                      key={index}
                      className={`calendar-day ${day ? "active" : "inactive"} ${
                        events.length > 0 ? "has-events" : ""
                      }`}
                      onClick={() => day && handleDateClick(day)}
                    >
                      {day && (
                        <>
                          <span className="day-number">{day}</span>
                          {events.length > 0 && (
                            <div className="event-indicators">
                              {events.map((event) => (
                                <div
                                  key={event.id}
                                  className={`event-dot event-${event.status}`}
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
            {selectedDate && selectedDateEvents.length > 0 && (
              <div className="event-details-panel">
                <div className="panel-header">
                  <h3>Chi tiết lịch hẹn - {formatDate(selectedDate)}</h3>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedDate(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="panel-content">
                  {selectedDateEvents.map((step) => (
                    <div
                      key={step.id}
                      className={`event-card event-${step.status}`}
                    >
                      <div className="event-card-header">
                        <span className="event-title">{step.name}</span>
                        <span className="event-type">{step.type}</span>
                      </div>
                      <div>
                        <strong>Giai đoạn:</strong> {step.stage}
                      </div>
                      <div>
                        <strong>Trạng thái:</strong>{" "}
                        {step.status === "completed"
                          ? "Đã hoàn thành"
                          : step.status === "in-progress"
                          ? "Đang thực hiện"
                          : "Chưa thực hiện"}
                      </div>
                      <div>
                        <strong>Ngày hẹn khám:</strong>{" "}
                        {step.scheduledDates && step.scheduledDates.length > 0
                          ? new Date(step.scheduledDates[0]).toLocaleDateString(
                              "vi-VN"
                            )
                          : ""}
                      </div>
                      <div>
                        <strong>Ngày thực hiện:</strong>{" "}
                        {step.executionDate
                          ? new Date(step.executionDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : ""}
                      </div>
                      <div>
                        <strong>Người thực hiện:</strong>{" "}
                        {step.performedBy || "-"}
                      </div>
                      <div>
                        <strong>Ghi chú:</strong> {step.doctorNote || "-"}
                      </div>
                      <div>
                        <strong>Kết quả:</strong>{" "}
                        {step.medicalRecords &&
                        step.medicalRecords.length > 0 ? (
                          <button
                            className="view-record-btn"
                            onClick={() =>
                              handleViewMedicalRecord(step.medicalRecords[0])
                            }
                          >
                            Xem kết quả
                          </button>
                        ) : (
                          <span style={{ color: "#aaa" }}>-</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="notification-message" style={{ marginTop: 24 }}>
          <div className="notification-icon">🔔</div>
          <p>Bạn sẽ nhận được nhắc nhở lịch hẹn qua SMS hoặc Email.</p>
        </div>
      </div>
      {renderMedicalRecordModal()}
    </div>
  );
};

export default TreatmentPlan;
