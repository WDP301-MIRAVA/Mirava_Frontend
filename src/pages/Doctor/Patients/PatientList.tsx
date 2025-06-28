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

type ModalType = 'detail' | 'examination' | 'test_result' | 'injection_result' | null;

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
          const transformedPatients: Patient[] = data.map((plan: any) => ({
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
          setPatients(transformedPatients);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) setFilteredPatients(patients);
    else {
      const filtered = patients.filter((patient) =>
        patient.patientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!selectedPatient) return null;
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
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2>Danh sách bệnh nhân ({filteredPatients.length})</h2>
        <input
          type="text"
          placeholder="Tìm theo tên, mã bệnh nhân hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <p>⏳ Đang tải danh sách...</p>
      ) : (
        <div className="patient-cards-grid">
          {filteredPatients.map((patient) => (
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
              </div>

              <div className="patient-contact">
                <div>📧 {patient.email}</div>
                <div>📞 {patient.phone}</div>
                <div>📍 {patient.location}</div>
              </div>

              <div className="patient-details">
                <div><b>Chuyên khoa:</b> {patient.specialty}</div>
                <div><b>Giới tính:</b> {patient.gender}</div>
                <div><b>Mã BN:</b> {patient.patientCode}</div>
              </div>

              <div className="pl-action-buttons">
                <button onClick={() => handleModalOpen(patient, "detail")}>
                  📋 Kế hoạch điều trị
                </button>
                <button onClick={() => handleModalOpen(patient, "examination")}>
                  👨‍⚕️ Tiền sử
                </button>
                <button onClick={() => handleModalOpen(patient, "test_result")}>
                  🧪 Xét nghiệm
                </button>
                <button onClick={() => handleModalOpen(patient, "injection_result")}>
                  💉 Tiêm thuốc
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal hiển thị nội dung */}
      {isModalOpen && (
        <div className="pl-modal-overlay" onClick={closeModal}>
          <div className="pl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>{getModalTitle()}</h2>
              <button onClick={closeModal}>✖</button>
            </div>
            <div className="pl-modal-body">{renderModalContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
