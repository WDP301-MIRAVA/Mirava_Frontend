import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientList.css";
import axios from "axios";
import ExaminationResults from "./ExaminationResults/ExaminationResults";
import TestResults from "./TestResults/TestResults";
import MedicationResults from "./MedicationResults/MedicationResults";

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
}

type ModalType = 'detail' | 'examination' | 'test_result' | 'injection_result' | null;

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
<<<<<<< phuong
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
=======
>>>>>>> main
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Generate patient code function
  const generatePatientCode = (patientId: string): string => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    
    // Tạo 4 số cuối từ patientId
    const lastFourDigits = patientId.slice(-4).padStart(4, '0');
    
    return `PAT${year}${month}${day}${lastFourDigits}`;
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("accessToken");

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
<<<<<<< phuong
          const transformedPatients: Patient[] = data.map((plan: any) => ({
            id: plan.patient._id,
            name: plan.patient.userName || "Không rõ",
            email: plan.patient.email || "",
            phone: plan.patient.phone || "",
            location: plan.patient.location || "Không rõ",
            specialty: plan.doctor?.specialty || "Không rõ",
            gender: plan.patient.gender || "Không rõ",
            status: plan.status,
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
            patientCode: generatePatientCode(plan.patient._id),
          }));
=======
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
              appointmentDate: new Date(planObj.cycleStartDate).toLocaleDateString(
                "vi-VN",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              ),
              appointmentTime: planObj.hcgInjection?.time || "07:00",
              note: planObj.notes || "",
              doctor: planObj.doctor?.user?.userName || "Không rõ",
              startDate: new Date(planObj.cycleStartDate).toLocaleDateString(
                "vi-VN"
              ),
            };
          });
>>>>>>> main

          setPatients(transformedPatients);
          setFilteredPatients(transformedPatients);
        }
      } catch (error: unknown) {
        console.error("Lỗi khi gọi API:", error);
        if (error && typeof error === 'object' && 'response' in error) {
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

<<<<<<< phuong
  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.patientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handleModalOpen = (patient: Patient, type: ModalType) => {
    localStorage.setItem("patientId", patient.id);
    setSelectedPatient(patient);
    setModalType(type);
    setIsModalOpen(true);
    document.body.classList.add("pl-modal-open");
  };

  const closeModal = () => {
    localStorage.removeItem("patientId");
    setSelectedPatient(null);
    setModalType(null);
    setIsModalOpen(false);
    document.body.classList.remove("pl-modal-open");
  };

  const renderModalContent = () => {
    if (!selectedPatient) return null;

    switch (modalType) {
      case 'detail':
        return (
          <div className="pl-treatment-plan">
            <EditableTreatmentPlan />
          </div>
        );
      case 'examination':
        return (
          <div className="pl-examination-result">
           <ExaminationResults/>
          </div>
        );
      case 'test_result':
        return (
          <div className="pl-test-result">
            <TestResults/>
          </div>
        );
      case 'injection_result':
        return (
          <div className="pl-injection-result">
            <MedicationResults/>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'detail':
        return 'Kế hoạch điều trị';
      case 'examination':
        return 'Kết quả khám';
      case 'test_result':
        return 'Kết quả xét nghiệm';
      case 'injection_result':
        return 'Kết quả tiêm thuốc';
      default:
        return '';
    }
=======
  const handlePatientDetail = (patient: Patient) => {
    // Lưu thông tin bệnh nhân vào localStorage để sử dụng trong trang IVFTreatmentTracker
    localStorage.setItem("patientId", patient.id);
    localStorage.setItem("patientInfo", JSON.stringify(patient));
    
    // Điều hướng đến trang IVFTreatmentTracker
    navigate(`/doctor/patients/treatment/${patient.id}`);
>>>>>>> main
  };

  return (
    <div className="pl-container">
      <div className="pl-header">
        <h2>Danh sách bệnh nhân ({filteredPatients.length})</h2>
        
        {/* Search Bar */}
        <div className="pl-search-container">
          <div className="pl-search-input-wrapper">
            <span className="pl-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã bệnh nhân, tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-search-input"
            />
            {searchTerm && (
              <button 
                className="pl-clear-search"
                onClick={() => setSearchTerm("")}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
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
                  <div className="pl-patient-code">Mã BN: {patient.patientCode}</div>
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
                <div className="pl-appointment-info">
                  <div className="pl-calendar-icon">📅</div>
                  <div className="pl-appointment-details">
                    <div className="pl-appointment-date">
                      {patient.appointmentDate}
                    </div>
                    <div className="pl-appointment-time">
                      {patient.appointmentTime}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pl-patient-contact">
                <div className="pl-contact-item">
                  <span className="pl-contact-icon">✉️</span>
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
                  <span className="pl-detail-label">Chuyên khoa:</span>
                  <span className="pl-detail-value">{patient.specialty}</span>
                </div>
                <div className="pl-detail-row">
                  <span className="pl-detail-label">Giới tính:</span>
                  <span className="pl-detail-value">{patient.gender}</span>
                </div>
              </div>

              {patient.note && (
                <div className="pl-patient-note">
                  <div className="pl-note-icon">📝</div>
                  <div className="pl-note-content">
                    <span className="pl-note-label">Ghi chú:</span>
                    <span className="pl-note-text">{patient.note}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pl-action-buttons">
                <button
                  className="pl-action-button pl-detail-btn"
                  onClick={() => handleModalOpen(patient, 'detail')}
                  title="Chi tiết bệnh nhân"
                >
                  Chi tiết bệnh nhân
                </button>
                <button
                  className="pl-action-button pl-examination-btn"
                  onClick={() => handleModalOpen(patient, 'examination')}
                  title="Kết quả khám"
                >
                  Kết quả khám
                </button>
                <button
                  className="pl-action-button pl-test-btn"
                  onClick={() => handleModalOpen(patient, 'test_result')}
                  title="Kết quả xét nghiệm"
                >
                  Kết quả xét nghiệm
                </button>
                <button
                  className="pl-action-button pl-injection-btn"
                  onClick={() => handleModalOpen(patient, 'injection_result')}
                  title="Kết quả tiêm thuốc"
                >
                  Kết quả tiêm thuốc
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
<<<<<<< phuong

      {/* Modal */}
      {isModalOpen && selectedPatient && (
        <div className="pl-modal-overlay" onClick={closeModal}>
          <div className="pl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>{getModalTitle()}</h2>
              <button className="pl-close-button" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="pl-modal-info">
              <p>Bệnh nhân: {selectedPatient.name} - Mã: {selectedPatient.patientCode}</p>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}
=======
>>>>>>> main
    </div>
  );
};

export default PatientList;