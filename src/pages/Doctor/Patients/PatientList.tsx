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
  patientCode?: string;
  treatmentEvents?: any[];
}

type ModalType = "detail" | "examination" | "test_result" | "injection_result" | null;

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const generatePatientCode = (patientId: string): string => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const lastFourDigits = patientId.slice(-4).padStart(4, "0");
    return `PAT${year}${month}${day}${lastFourDigits}`;
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await axios.get("https://mirava-f0rz.onrender.com/api/treatment-plan", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.data;
        if (Array.isArray(data)) {
          const transformed: Patient[] = data.map((plan: any) => ({
            id: plan.patient._id,
            name: plan.patient.userName || "Không rõ",
            email: plan.patient.email || "",
            phone: plan.patient.phone || "",
            location: plan.patient.location || "Không rõ",
            specialty: plan.doctor?.specialty || "Không rõ",
            gender: plan.patient.gender || "Không rõ",
            status: plan.status,
            appointmentDate: new Date(plan.cycleStartDate).toLocaleDateString("vi-VN"),
            appointmentTime: plan.hcgInjection?.time || "07:00",
            note: plan.notes || "",
            doctor: plan.doctor?.user?.userName || "Không rõ",
            startDate: new Date(plan.cycleStartDate).toLocaleDateString("vi-VN"),
            patientCode: generatePatientCode(plan.patient._id),
            treatmentEvents: plan.treatmentEvents || [],
          }));
          setPatients(transformed);
        }
      } catch (err) {
        console.error("Lỗi khi fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) setFilteredPatients(patients);
    else {
      const filtered = patients.filter((p) =>
        p.patientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handleModalOpen = (patient: Patient, type: ModalType) => {
    if (type === "detail") {
      navigate("/doctor/patients/ivf-tracker", {
        state: {
          patientId: patient.id,
          patientName: patient.name,
          patientCode: patient.patientCode,
          treatmentEvents: patient.treatmentEvents || [],
        },
      });
      return;
    }
    localStorage.setItem("patientId", patient.id);
    setSelectedPatient(patient);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    localStorage.removeItem("patientId");
    setSelectedPatient(null);
    setModalType(null);
    setIsModalOpen(false);
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "examination":
        return <div>Kết quả khám</div>;
      case "test_result":
        return <div>Kết quả xét nghiệm</div>;
      case "injection_result":
        return <div>Kết quả tiêm thuốc</div>;
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "examination":
        return "Kết quả khám";
      case "test_result":
        return "Kết quả xét nghiệm";
      case "injection_result":
        return "Kết quả tiêm thuốc";
      default:
        return "";
    }
  };

  return (
    <div className="pl-container">
      <div className="pl-header">
        <h2>Danh sách bệnh nhân ({filteredPatients.length})</h2>
        <div className="pl-search-container">
          <div className="pl-search-input-wrapper">
            <input
              type="text"
              className="pl-search-input"
              placeholder="Tìm theo tên, mã bệnh nhân hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p>⏳ Đang tải danh sách...</p>
      ) : (
        <div className="pl-cards-grid">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="pl-card">
              <div className="pl-card-header">
                <div className="pl-patient-info">
                  <span className="pl-patient-code">{patient.patientCode}</span>
                  <h3 className="pl-patient-name">{patient.name}</h3>
                  <span className={`pl-status-badge pl-${patient.status}`}>
                    {patient.status === "planned"
                      ? "ĐÃ LÊN KẾ HOẠCH"
                      : patient.status === "in_progress"
                      ? "ĐANG THỰC HIỆN"
                      : patient.status === "completed"
                      ? "HOÀN THÀNH"
                      : "ĐÃ HỦY"}
                  </span>
                </div>
              </div>

              <div className="pl-patient-contact">
                <div className="pl-contact-item">
                  <span className="pl-contact-icon">📧</span>
                  <span className="pl-contact-text">{patient.email}</span>
                </div>
                <div className="pl-contact-item">
                  <span className="pl-contact-icon">📞</span>
                  <span className="pl-contact-text">{patient.phone}</span>
                </div>
                <div className="pl-contact-item">
                  <span className="pl-contact-icon">📍</span>
                  <span className="pl-contact-text">{patient.location}</span>
                </div>
              </div>

              <div className="pl-patient-details">
                <div className="pl-detail-row">
                  <span className="pl-detail-label">Dịch vụ:</span>
                  <span className="pl-detail-value">{patient.specialty}</span>
                </div>
                <div className="pl-detail-row">
                  <span className="pl-detail-label">Giới tính:</span>
                  <span className="pl-detail-value">{patient.gender}</span>
                </div>
              </div>

              <div className="pl-action-buttons">
                <button className="pl-action-button pl-detail-btn" onClick={() => handleModalOpen(patient, "detail")}>
                  Kế hoạch điều trị
                </button>
                <button className="pl-action-button pl-examination-btn" onClick={() => handleModalOpen(patient, "examination")}>
                  Tiền sử
                </button>
                <button className="pl-action-button pl-test-btn" onClick={() => handleModalOpen(patient, "test_result")}>
                  Xét nghiệm
                </button>
                <button className="pl-action-button pl-injection-btn" onClick={() => handleModalOpen(patient, "injection_result")}>
                  Tiêm thuốc
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="pl-modal-overlay" onClick={closeModal}>
          <div className="pl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>{getModalTitle()}</h2>
              <button className="pl-close-button" onClick={closeModal}>✖</button>
            </div>
            <div className="pl-modal-body">{renderModalContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
