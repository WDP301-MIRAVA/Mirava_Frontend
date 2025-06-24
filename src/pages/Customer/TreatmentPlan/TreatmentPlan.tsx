import React, { useState, useEffect } from "react";
import "./TreatmentPlan.css";
import {
  TreatmentPlanService,
  type TreatmentPlan as ApiTreatmentPlan,
} from "../../../services/treatmentPlan.service";

interface TreatmentEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  details: string;
  medication?: string;
  dosage?: string;
  instructions?: string;
  time?: string;
  highlight?: boolean; // Thêm trường highlight
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

  // Lấy danh sách kế hoạch điều trị
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy patientId từ localStorage, sessionStorage hoặc URL
        let patientId =
          localStorage.getItem("patientId") ||
          sessionStorage.getItem("patientId");
        if (!patientId) {
          const urlParams = new URLSearchParams(window.location.search);
          patientId = urlParams.get("patientId"); // Giá trị mặc định
        }
        console.log("Using patientId from URL:", patientId);

        if (!patientId) {
          setPlans([]);
          setError("Không có kế hoạch điều trị vì thiếu patientId");
          setLoading(false);
          return;
        }

        // Gọi API để lấy kế hoạch điều trị
        const response = await TreatmentPlanService.getTreatmentPlanByPatientId(
          patientId
        );

        if (response?.data?.data && Array.isArray(response.data.data)) {
          setPlans(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedPlan(response.data.data[0]);
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

  const safeToISOString = (dateValue: any) => {
    const date = new Date(dateValue);
    return !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "";
  };

  // Chuyển đổi 1 kế hoạch điều trị sang các event
  const transformApiPlanToEvents = (
    plan: ApiTreatmentPlan
  ): TreatmentEvent[] => {
    const events: TreatmentEvent[] = [];
    const cycleStartDate = new Date(plan.cycleStartDate);

    // sự kiện kích thích buồng trứng
    if (plan.ovarianStimulation) {
      const stimStartDate = new Date(cycleStartDate);
      stimStartDate.setDate(
        stimStartDate.getDate() + plan.ovarianStimulation.startDay - 1
      );
      for (let i = 0; i < plan.ovarianStimulation.durationDays; i++) {
        const eventDate = new Date(stimStartDate);
        eventDate.setDate(stimStartDate.getDate() + i);

        // Lấy dailyDetail nếu có, nếu không lấy mặc định
        const dailyDetail = plan.ovarianStimulation.dailyDetails?.[i];
        const dateStr = !isNaN(eventDate.getTime())
          ? eventDate.toISOString().split("T")[0]
          : "";
        if (dateStr) {
          events.push({
            id: `stim-${plan._id}-${i}`,
            date: dateStr,
            type: "medication",
            title: "Tiêm thuốc kích thích buồng trứng",
            details: `Tiêm thuốc ${
              dailyDetail?.medication || plan.ovarianStimulation.medication
            } để kích thích phát triển nang trứng`,
            medication:
              dailyDetail?.medication || plan.ovarianStimulation.medication,
            dosage: dailyDetail?.dosage || plan.ovarianStimulation.dailyDosage,
            instructions:
              dailyDetail?.instructions ||
              plan.ovarianStimulation.instructions ||
              "Không có hướng dẫn",
            time:
              dailyDetail?.time ||
              plan.ovarianStimulation.time ||
              "Không có thời gian",
            highlight: dailyDetail?.highlight === true,
          });
        }
      }
      plan.ovarianStimulation.monitoringSchedule.forEach((monitoring) => {
        const monitoringDate = new Date(cycleStartDate);
        monitoringDate.setDate(monitoringDate.getDate() + monitoring.day - 1);
        const dateStr = !isNaN(monitoringDate.getTime())
          ? monitoringDate.toISOString().split("T")[0]
          : "";
        if (dateStr) {
          events.push({
            id: `monitoring-${plan._id}-${monitoring._id}`,
            date: dateStr,
            type: monitoring.type,
            title: monitoring.notes || "Theo dõi điều trị",
            details: monitoring.notes,
            instructions: monitoring.instructions || "Không có hướng dẫn",
            time: monitoring.time || "Không có thời gian",
            highlight: monitoring.highlight === true,
          });
        }
      });
    }

    // Sự kiện tiêm HCG
    if (plan.hcgInjection && plan.hcgInjection.plannedDate) {
      const hcgDate = new Date(plan.hcgInjection.plannedDate);
      const dateStr = !isNaN(hcgDate.getTime())
        ? hcgDate.toISOString().split("T")[0]
        : "";
      if (dateStr) {
        events.push({
          id: `hcg-${plan._id}`,
          date: dateStr,
          type: "medication",
          title: "Tiêm thuốc ngăn rụng trứng sớm",
          details:
            "Tiêm thuốc HCG để kích thích trưởng thành cuối cùng của trứng",
          medication: plan.hcgInjection.medication,
          dosage: plan.hcgInjection.dosage,
          instructions: plan.hcgInjection.instructions || "Không có hướng dẫn",
          time: plan.hcgInjection.time || "Không có thời gian",
          highlight: plan.hcgInjection.highlight === true,
        });
      }
    }

    // sự kiện chọc hút trứng
    if (plan.eggRetrieval && plan.eggRetrieval.plannedDate) {
      const retrievalDate = new Date(plan.eggRetrieval.plannedDate);
      const dateStr = !isNaN(retrievalDate.getTime())
        ? retrievalDate.toISOString().split("T")[0]
        : "";
      if (dateStr) {
        events.push({
          id: `retrieval-${plan._id}`,
          date: dateStr,
          type: "procedure",
          title: "Chọc hút trứng",
          details: plan.eggRetrieval.notes || "Không có chi tiết",
          instructions: plan.eggRetrieval.instructions || "Không có hướng dẫn",
          time: plan.eggRetrieval.time || "Không có thời gian",
          highlight: plan.eggRetrieval.highlight === true,
        });
      }
    }

    // sự kiện chuyển phôi
    if (plan.embryoTransfer && plan.embryoTransfer.plannedDate) {
      const transferDate = new Date(plan.embryoTransfer.plannedDate);
      const dateStr = !isNaN(transferDate.getTime())
        ? transferDate.toISOString().split("T")[0]
        : "";
      if (dateStr) {
        events.push({
          id: `transfer-${plan._id}`,
          date: dateStr,
          type: "procedure",
          title: "Chuyển phôi",
          details: `Chuyển phôi giai đoạn ${plan.embryoTransfer.embryoStage} vào buồng tử cung`,
          instructions:
            plan.embryoTransfer.instructions || "Không có hướng dẫn",
          time: plan.embryoTransfer.time || "Không có thời gian",
          highlight: plan.embryoTransfer.highlight === true,
        });
      }
    }

    // sự kiện theo dõi sau chuyển phôi
    if (plan.postTransferMonitoring) {
      if (plan.postTransferMonitoring.betaHcgTestDate) {
        let dateValue = plan.postTransferMonitoring.betaHcgTestDate;
        let highlightValue = false;
        if (typeof dateValue === "object" && dateValue !== null) {
          highlightValue = dateValue.highlight === true;
          dateValue = dateValue.date;
        }
        if (dateValue) {
          const betaDate = new Date(dateValue);
          const dateStr = !isNaN(betaDate.getTime())
            ? betaDate.toISOString().split("T")[0]
            : "";
          if (dateStr) {
            events.push({
              id: `beta-${plan._id}`,
              date: dateStr,
              type: "test",
              title: "Xét nghiệm Beta HCG",
              details: "Xét nghiệm xác định kết quả có thai",
              instructions: plan.postTransferMonitoring.betaHcgTestInstructions,
              time: plan.postTransferMonitoring.betaHcgTestTime,
              highlight: highlightValue,
            });
          }
        }
      }
      if (plan.postTransferMonitoring.ultrasoundCheckDate) {
        let dateValue = plan.postTransferMonitoring.ultrasoundCheckDate;
        let highlightValue = false;
        if (typeof dateValue === "object" && dateValue !== null) {
          highlightValue = dateValue.highlight === true;
          dateValue = dateValue.date;
        }
        if (dateValue) {
          const ultrasoundDate = new Date(dateValue);
          const dateStr = !isNaN(ultrasoundDate.getTime())
            ? ultrasoundDate.toISOString().split("T")[0]
            : "";
          if (dateStr) {
            events.push({
              id: `ultrasound-check-${plan._id}`,
              date: dateStr,
              type: "ultrasound",
              title: "Siêu âm kiểm tra thai",
              details: "Siêu âm kiểm tra tình trạng thai nang",
              instructions:
                plan.postTransferMonitoring.ultrasoundCheckInstructions,
              time: plan.postTransferMonitoring.ultrasoundCheckTime,
              highlight: highlightValue,
            });
          }
        }
      }
    }
    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };
  // Các hàm phụ cho event
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "medication":
        return "💉";
      case "test":
        return "🔬";
      case "ultrasound":
        return "📷";
      case "procedure":
        return "🏥";
      default:
        return "📅";
    }
  };

  const getEventTypeClass = (type: string) => {
    switch (type) {
      case "medication":
        return "event-medication";
      case "test":
        return "event-test";
      case "ultrasound":
        return "event-ultrasound";
      case "procedure":
        return "event-procedure";
      default:
        return "event-default";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  // Khi chọn 1 kế hoạch, lấy event của kế hoạch đó
  const selectedPlanEvents = selectedPlan
    ? transformApiPlanToEvents(selectedPlan)
    : [];

  // Lấy event theo ngày cho calendar
  const getEventsForDate = (day: number) => {
    if (!selectedPlan) return [];
    const dateString = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return selectedPlanEvents.filter((event) => event.date === dateString);
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
    ? selectedPlanEvents.filter((event) => event.date === selectedDate)
    : [];

  // Loading state
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
            <div className="timeline">
              {selectedPlanEvents.map((event) => (
                <div
                  key={event.id}
                  className={`timeline-item ${getEventTypeClass(event.type)}${
                    event.highlight ? " highlight-step" : ""
                  }`}
                >
                  <div className="timeline-marker">
                    <span className="event-icon">
                      {getEventTypeIcon(event.type)}
                    </span>
                  </div>
                  <div className="timeline-content">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span className="event-date">
                        {formatDate(event.date)}
                      </span>
                      {event.time && (
                        <span className="event-time">{event.time}</span>
                      )}
                    </div>
                    <p className="event-details">{event.details}</p>
                    {event.medication && (
                      <div className="medication-info">
                        <strong>Thuốc:</strong> {event.medication}
                        {event.dosage && (
                          <span> - Liều lượng: {event.dosage}</span>
                        )}
                      </div>
                    )}
                    {event.instructions && (
                      <div className="instructions">
                        <strong>Hướng dẫn:</strong> {event.instructions}
                      </div>
                    )}
                    {event.time && (
                      <div className="event-time">
                        <strong>Thời gian:</strong> {event.time}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                                  className={`event-dot ${getEventTypeClass(
                                    event.type
                                  )}`}
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
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`event-card ${getEventTypeClass(event.type)}${
                        event.highlight ? " highlight-step" : ""
                      }`}
                    >
                      <div className="event-card-header">
                        <span className="event-icon">
                          {getEventTypeIcon(event.type)}
                        </span>
                        <h4>{event.title}</h4>
                        {event.time && (
                          <span className="time">{event.time}</span>
                        )}
                      </div>
                      <p>{event.details}</p>
                      {event.medication && (
                        <div className="medication-info">
                          <strong>Thuốc:</strong> {event.medication}
                          {event.dosage && <span> - {event.dosage}</span>}
                        </div>
                      )}
                      {event.instructions && (
                        <div className="instructions">
                          <strong>Hướng dẫn:</strong> {event.instructions}
                        </div>
                      )}
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
    </div>
  );
};

export default TreatmentPlan;
