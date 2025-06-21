import React, { useEffect, useState } from "react";
import "./PatientList.css";
import EditableTreatmentPlan from "./EditableTreatmentPlan";
import axios from "axios";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  specialty: string;
  gender: string;
  status: "confirmed" | "pending";
  appointmentDate: string;
  appointmentTime: string;
  note?: string;
  doctor: string;
  startDate: string;
}

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // 👈 lấy token

        if (!token) {
          console.warn("Không tìm thấy accessToken trong localStorage");
          return;
        }

        const res = await axios.get(
          "https://mirava-f0rz.onrender.com/api/treatment-plan",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data?.data;

        if (Array.isArray(data)) {
          const transformedPatients: Patient[] = data.map((plan: any) => ({
            id: plan.patient._id,
            name: plan.patient.userName || "Không rõ",
            email: plan.patient.email || "",
            phone: plan.patient.phone || "",
            location: plan.patient.location || "Không rõ",
            specialty: plan.doctor?.specialty || "Không rõ",
            gender: plan.patient.gender || "Không rõ",
            status: plan.status === "in_progress" ? "confirmed" : "pending",
            appointmentDate: new Date(plan.cycleStartDate).toLocaleDateString(
              "vi-VN",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            ),
            appointmentTime: plan.hcgInjection?.time || "07:00",
            note: plan.notes || "",
            doctor: plan.doctor?.user?.userName || "Không rõ",
            startDate: new Date(plan.cycleStartDate).toLocaleDateString(
              "vi-VN"
            ),
          }));

          setPatients(transformedPatients);
        }
      } catch (error: any) {
        console.error("Lỗi khi gọi API:", error);
        if (error.response?.status === 401) {
          alert("Bạn chưa đăng nhập hoặc token hết hạn.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientDetail = (patient: Patient) => {
    localStorage.setItem("patientId", patient.id);
    setSelectedPatient(patient);
    setIsModalOpen(true);
    document.body.classList.add("modal-open"); // dùng để ngăn cuộn trang khi mở modal
  };

  const closeModal = () => {
    localStorage.removeItem("patientId");
    setSelectedPatient(null);
    setIsModalOpen(false);
    document.body.classList.remove("modal-open"); // dùng để cho phép cuộn trang khi đóng modal
  };

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2>Danh sách bệnh nhân ({patients.length})</h2>
      </div>

      {loading ? (
        <p>⏳ Đang tải danh sách...</p>
      ) : (
        <div className="patient-cards-grid">
          {patients.map((patient) => (
            <div key={patient.id} className="patient-card">
              <div className="patient-header">
                <div className="patient-info">
                  <h3 className="patient-name">{patient.name}</h3>
                  <span className={`status-badge ${patient.status}`}>
                    {patient.status === "confirmed"
                      ? "ĐÃ XÁC NHẬN"
                      : "CHỜ XÁC NHẬN"}
                  </span>
                </div>
                <div className="appointment-info">
                  <div className="calendar-icon">📅</div>
                  <div className="appointment-details">
                    <div className="appointment-date">
                      {patient.appointmentDate}
                    </div>
                    <div className="appointment-time">
                      {patient.appointmentTime}
                    </div>
                  </div>
                </div>
              </div>

              <div className="patient-contact">
                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <span className="contact-text">{patient.email}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span className="contact-text">{patient.phone}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <span className="contact-text">{patient.location}</span>
                </div>
              </div>

              <div className="patient-details">
                <div className="detail-row">
                  <span className="detail-label">Chuyên khoa:</span>
                  <span className="detail-value">{patient.specialty}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Giới tính:</span>
                  <span className="detail-value">{patient.gender}</span>
                </div>
              </div>

              {patient.note && (
                <div className="patient-note">
                  <div className="note-icon">📝</div>
                  <div className="note-content">
                    <span className="note-label">Ghi chú:</span>
                    <span className="note-text">{patient.note}</span>
                  </div>
                </div>
              )}

              <button
                className="detail-button"
                onClick={() => handlePatientDetail(patient)}
              >
                👁️ Chi tiết bệnh nhân
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết bệnh nhân */}
      {isModalOpen && selectedPatient && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Kế hoạch điều trị</h2>
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-info">
              <p>Bệnh nhân: {selectedPatient.name}</p>
            </div>
            <div className="treatment-plan-in-patientlist">
              <EditableTreatmentPlan />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
