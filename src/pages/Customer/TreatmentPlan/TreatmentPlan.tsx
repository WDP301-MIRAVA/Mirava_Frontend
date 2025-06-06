import React, { useState, useEffect } from "react";
import { Modal } from "antd";
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

        let patientId = null;
        if (typeof window !== "undefined" && window.localStorage) {
          patientId = localStorage.getItem("patientId");
        }
        if (
          !patientId &&
          typeof window !== "undefined" &&
          window.sessionStorage
        ) {
          patientId = sessionStorage.getItem("patientId");
        }
        if (!patientId && typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          patientId = urlParams.get("patientId");
        }
        if (!patientId) {
          patientId = "682d873130ae34c185987543";
        }

        const response = await TreatmentPlanService.getTreatmentPlanByPatientId(
          patientId
        );
        // Nếu API trả về { data: [...] }
        if (response && response.data && Array.isArray(response.data.data)) {
          setPlans(response.data.data);
        } else if (Array.isArray(response.data)) {
          setPlans(response.data);
        } else {
          setPlans([]);
          setError("Không tìm thấy kế hoạch điều trị từ API");
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải kế hoạch điều trị");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Chuyển đổi 1 kế hoạch điều trị sang các event
  const transformApiPlanToEvents = (
    plan: ApiTreatmentPlan
  ): TreatmentEvent[] => {
    const events: TreatmentEvent[] = [];
    const cycleStartDate = new Date(plan.cycleStartDate);

    // Ovarian Stimulation Events
    if (plan.ovarianStimulation) {
      const stimStartDate = new Date(cycleStartDate);
      stimStartDate.setDate(
        stimStartDate.getDate() + plan.ovarianStimulation.startDay - 1
      );
      for (let i = 0; i < plan.ovarianStimulation.durationDays; i++) {
        const eventDate = new Date(stimStartDate);
        eventDate.setDate(stimStartDate.getDate() + i);
        events.push({
          id: `stim-${plan._id}-${i}`,
          date: eventDate.toISOString().split("T")[0],
          type: "medication",
          title: "Tiêm thuốc kích thích buồng trứng",
          details: `Tiêm thuốc ${plan.ovarianStimulation.medication} để kích thích phát triển nang trứng`,
          medication: plan.ovarianStimulation.medication,
          dosage: plan.ovarianStimulation.dailyDosage,
          instructions: "Tiêm dưới da vào buổi tối, cùng giờ hàng ngày",
          time: "20:00",
        });
      }
      plan.ovarianStimulation.monitoringSchedule.forEach((monitoring) => {
        const monitoringDate = new Date(cycleStartDate);
        monitoringDate.setDate(monitoringDate.getDate() + monitoring.day - 1);
        let eventType = "test";
        let title = "Theo dõi điều trị";
        let details = monitoring.notes;
        let instructions = "";
        if (
          monitoring.type.toLowerCase().includes("ultrasound") ||
          monitoring.type.toLowerCase().includes("siêu âm")
        ) {
          eventType = "ultrasound";
          title = "Siêu âm kiểm tra nang trứng";
          details = "Siêu âm đếm số lượng và đo kích thước nang trứng";
          instructions = "Uống đủ nước trước khi siêu âm 30 phút";
        } else if (
          monitoring.type.toLowerCase().includes("blood") ||
          monitoring.type.toLowerCase().includes("hormone")
        ) {
          eventType = "test";
          title = "Xét nghiệm hormone";
          details = "Xét nghiệm E2, LH, FSH để theo dõi đáp ứng buồng trứng";
          instructions = "Nhịn ăn 8 tiếng trước khi xét nghiệm";
        }
        events.push({
          id: `monitoring-${plan._id}-${monitoring._id}`,
          date: monitoringDate.toISOString().split("T")[0],
          type: eventType,
          title: title,
          details: details || monitoring.notes,
          instructions: instructions,
          time: eventType === "test" ? "08:00" : "14:30",
        });
      });
    }

    // HCG Injection Event
    if (plan.hcgInjection && plan.hcgInjection.plannedDate) {
      const hcgDate = new Date(plan.hcgInjection.plannedDate);
      events.push({
        id: `hcg-${plan._id}`,
        date: hcgDate.toISOString().split("T")[0],
        type: "medication",
        title: "Tiêm thuốc ngăn rụng trứng sớm",
        details:
          "Tiêm thuốc HCG để kích thích trưởng thành cuối cùng của trứng",
        medication: plan.hcgInjection.medication,
        dosage: plan.hcgInjection.dosage,
        instructions: "Tiêm đúng giờ theo chỉ định của bác sĩ",
        time: "22:00",
      });
    }

    // Egg Retrieval Event
    if (plan.eggRetrieval && plan.eggRetrieval.plannedDate) {
      const retrievalDate = new Date(plan.eggRetrieval.plannedDate);
      events.push({
        id: `retrieval-${plan._id}`,
        date: retrievalDate.toISOString().split("T")[0],
        type: "procedure",
        title: "Chọc hút trứng",
        details: "Thủ thuật chọc hút trứng dưới hướng dẫn siêu âm",
        instructions:
          plan.eggRetrieval.notes ||
          "Nhịn ăn uống từ 22:00 ngày hôm trước. Đến bệnh viện lúc 07:00",
        time: "09:00",
      });
    }

    // Embryo Transfer Event
    if (plan.embryoTransfer && plan.embryoTransfer.plannedDate) {
      const transferDate = new Date(plan.embryoTransfer.plannedDate);
      events.push({
        id: `transfer-${plan._id}`,
        date: transferDate.toISOString().split("T")[0],
        type: "procedure",
        title: "Chuyển phôi",
        details: `Chuyển phôi giai đoạn ${plan.embryoTransfer.embryoStage} vào buồng tử cung`,
        instructions:
          "Uống đủ nước, không cần nhịn ăn. Nghỉ ngơi sau thủ thuật",
        time: "10:30",
      });
    }

    // Post Transfer Monitoring Events
    if (plan.postTransferMonitoring) {
      if (plan.postTransferMonitoring.betaHcgTestDate) {
        const betaDate = new Date(plan.postTransferMonitoring.betaHcgTestDate);
        events.push({
          id: `beta-${plan._id}`,
          date: betaDate.toISOString().split("T")[0],
          type: "test",
          title: "Xét nghiệm Beta HCG",
          details: "Xét nghiệm xác định kết quả có thai",
          instructions: "Nhịn ăn 8 tiếng trước khi xét nghiệm",
          time: "08:00",
        });
      }
      if (plan.postTransferMonitoring.ultrasoundCheckDate) {
        const ultrasoundDate = new Date(
          plan.postTransferMonitoring.ultrasoundCheckDate
        );
        events.push({
          id: `ultrasound-check-${plan._id}`,
          date: ultrasoundDate.toISOString().split("T")[0],
          type: "ultrasound",
          title: "Siêu âm kiểm tra thai",
          details: "Siêu âm kiểm tra tình trạng thai nang",
          instructions: "Uống đủ nước trước khi siêu âm 30 phút",
          time: "14:30",
        });
      }
    }
    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Hiển thị tóm tắt từng kế hoạch điều trị
  const renderPlanSummary = (plan: ApiTreatmentPlan) => (
    <div
      className="plan-card"
      key={plan._id}
      onClick={() => setSelectedPlan(plan)}
    >
      <h3>Bác sĩ: {plan.doctor?.user?.userName || "Chưa cập nhật"}</h3>
      <p>
        Ngày bắt đầu:{" "}
        {plan.cycleStartDate
          ? new Date(plan.cycleStartDate).toLocaleDateString("vi-VN")
          : "?"}
      </p>
      <p>Trạng thái: {plan.status}</p>
      <button className="view-detail-btn">Xem chi tiết</button>
    </div>
  );

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

  // Nếu chưa chọn kế hoạch, hiển thị danh sách
  if (!selectedPlan) {
    return (
      <div className="treatment-plan-container">
        <div className="treatment-plan-header">
          <h1>Kế hoạch điều trị</h1>
          <p className="subtitle">Danh sách các kế hoạch điều trị của bạn</p>
          {error && (
            <div
              style={{ color: "orange", fontSize: "14px", marginTop: "10px" }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>
        <div className="plan-list">
          {plans.length === 0 && <div>Chưa có kế hoạch điều trị nào.</div>}
          {plans.map(renderPlanSummary)}
        </div>
      </div>
    );
  }

  // Khi đã chọn 1 kế hoạch, hiển thị chi tiết (modal)
  return (
    <Modal
      open={!!selectedPlan}
      onCancel={() => {
        setSelectedPlan(null);
        setSelectedDate(null);
        setActiveView("list");
      }}
      footer={null}
      width={900}
      title={
        <div>
          <span>Chi tiết kế hoạch điều trị</span>
          <div style={{ fontSize: 14, color: "#888" }}>
            Bác sĩ: {selectedPlan.doctor?.user?.userName || "Chưa cập nhật"} |
            Ngày bắt đầu:{" "}
            {selectedPlan.cycleStartDate
              ? new Date(selectedPlan.cycleStartDate).toLocaleDateString(
                  "vi-VN"
                )
              : "?"}
          </div>
        </div>
      }
    >
      <div className="view-toggle">
        <button
          className={`toggle-btn ${activeView === "list" ? "active" : ""}`}
          onClick={() => setActiveView("list")}
        >
          📋 Danh sách
        </button>
        <button
          className={`toggle-btn ${activeView === "calendar" ? "active" : ""}`}
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
                className={`timeline-item ${getEventTypeClass(event.type)}`}
              >
                <div className="timeline-marker">
                  <span className="event-icon">
                    {getEventTypeIcon(event.type)}
                  </span>
                </div>
                <div className="timeline-content">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <span className="event-date">{formatDate(event.date)}</span>
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
                    className={`event-card ${getEventTypeClass(event.type)}`}
                  >
                    <div className="event-card-header">
                      <span className="event-icon">
                        {getEventTypeIcon(event.type)}
                      </span>
                      <h4>{event.title}</h4>
                      {event.time && <span className="time">{event.time}</span>}
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
    </Modal>
  );
};

export default TreatmentPlan;
