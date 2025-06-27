import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientList.css";
import axios from "axios";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  specialty: string;
  gender: string;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  appointmentDate: string;
  appointmentTime: string;
  note?: string;
  doctor: string;
  startDate: string;
}

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
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
          const transformedPatients: Patient[] = data.map((plan: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const planObj = plan as any; // Type assertion for data mapping
            return {
              id: planObj.patient._id,
              name: planObj.patient.userName || "Không rõ",
              email: planObj.patient.email || "",
              phone: planObj.patient.phone || "",
              location: planObj.patient.location || "Không rõ",
              specialty: planObj.doctor?.specialty || "Không rõ",
              gender: planObj.patient.gender || "Không rõ",
              status: planObj.status,
              appointmentDate: new Date(
                planObj.cycleStartDate
              ).toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              appointmentTime: planObj.hcgInjection?.time || "07:00",
              note: planObj.notes || "",
              doctor: planObj.doctor?.user?.userName || "Không rõ",
              startDate: new Date(planObj.cycleStartDate).toLocaleDateString(
                "vi-VN"
              ),
            };
          });

          setPatients(transformedPatients);
        }
      } catch (error: unknown) {
        console.error("Lỗi khi gọi API:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            alert("Bạn chưa đăng nhập hoặc token hết hạn.");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientDetail = (patient: Patient) => {
    // Lưu thông tin bệnh nhân vào localStorage để sử dụng trong trang IVFTreatmentTracker
    localStorage.setItem("patientId", patient.id);
    localStorage.setItem("patientInfo", JSON.stringify(patient));

    // Điều hướng đến trang IVFTreatmentTracker
    navigate(`/doctor/patients/treatment/${patient.id}`);
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
                    {patient.status === "planned"
                      ? "ĐÃ LÊN KẾ HOẠCH"
                      : patient.status === "in_progress"
                      ? "ĐANG THỰC HIỆN"
                      : patient.status === "completed"
                      ? "HOÀN THÀNH"
                      : "ĐÃ HỦY"}
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
    </div>
  );
};

export default PatientList;
