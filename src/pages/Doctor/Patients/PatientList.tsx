import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientList.css";
import axiosInstance from "@/services/MainService";
import type { Patient, RawPlan } from "@/types/patient.types";

type ModalType =
  | "detail"
  | "examination"
  | "test_result"
  | "injection_result"
  | null;

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Patient>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "planned" | "in_progress" | "completed" | "cancelled"
  >("all");

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

        const res = await axiosInstance.get(
          "https://mirava-f0rz.onrender.com/api/treatment-plan",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data?.data;
        if (Array.isArray(data)) {
          const validPlans = data.filter(
            (plan: RawPlan) =>
              plan && plan.patient && plan.patient._id && plan.patient.userName
          );

          const transformed: Patient[] = validPlans.map((plan: RawPlan) => ({
            id: plan.patient._id,
            name: plan.patient.userName || "Không rõ",
            email: plan.patient.email || "",
            phone: plan.patient.phone || "",
            location: plan.patient.address || "Không rõ",
            specialty: plan.doctor?.specialty || "Không rõ",
            gender: plan.patient.gender || "Không rõ",
            status: plan.status || "planned",
            appointmentDate: plan.cycleStartDate
              ? new Date(plan.cycleStartDate).toLocaleDateString("vi-VN")
              : "Chưa xác định",
            appointmentTime: plan.hcgInjection?.time || "07:00",
            note: plan.notes || "",
            doctor: plan.doctor?.user?.userName || "Không rõ",
            startDate: plan.cycleStartDate
              ? new Date(plan.cycleStartDate).toLocaleDateString("vi-VN")
              : "Chưa xác định",
            patientCode:
              plan.patient.patientCode || generatePatientCode(plan.patient._id),
            treatmentEvents: plan.treatmentEvents || [],
          }));

          setPatients(transformed);
          console.log("✅ Transformed patients:", transformed);
        } else {
          console.warn("⚠️ No valid data received:", data);
          setPatients([]);
        }
      } catch (err) {
        console.error("Lỗi khi fetch:", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    let filtered = patients;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.patientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((patient) => patient.status === statusFilter);
    }

    setFilteredPatients(filtered);
  }, [searchTerm, statusFilter, patients]);

  const handleSort = (field: keyof Patient) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...filteredPatients].sort((a, b) => {
      const aValue = a[field] as string;
      const bValue = b[field] as string;

      if (direction === "asc") {
        return aValue.localeCompare(bValue, "vi-VN");
      } else {
        return bValue.localeCompare(aValue, "vi-VN");
      }
    });

    setFilteredPatients(sorted);
  };

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
        return (
          <div>
            <p>
              <strong>Bệnh nhân:</strong> {selectedPatient.name}
            </p>
            <p>
              <strong>Mã BN:</strong> {selectedPatient.patientCode}
            </p>
            <div>
              <strong>Kết quả khám:</strong>{" "}
              {selectedPatient.note || "Chưa có kết quả"}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "examination":
        return "Kết quả khám";

      default:
        return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planned":
        return "Đã lên kế hoạch";
      case "in_progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getSortIcon = (field: keyof Patient) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  if (loading) {
    return (
      <div className="pl-loading">
        <div className="pl-loading-spinner"></div>
        <p>Đang tải danh sách bệnh nhân...</p>
      </div>
    );
  }

  return (
    <div className="pl-container">
      {/* Controls */}
      <div className="pl-controls">
        <div className="pl-search-box">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã bệnh nhân hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          className="pl-filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="planned">Đã lên kế hoạch</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="pl-table-container">
        <div className="pl-table-header">
          <h2>Danh sách bệnh nhân ({filteredPatients.length})</h2>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="pl-no-data">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p>Không có bệnh nhân nào phù hợp với tiêu chí tìm kiếm</p>
          </div>
        ) : (
          <div className="pl-table-wrapper">
            <table className="pl-table">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("patientCode")}
                    className="pl-sortable"
                  >
                    Mã BN{getSortIcon("patientCode")}
                  </th>
                  <th
                    onClick={() => handleSort("name")}
                    className="pl-sortable"
                  >
                    Họ và tên{getSortIcon("name")}
                  </th>
                  <th>Liên hệ</th>
                  <th
                    onClick={() => handleSort("gender")}
                    className="pl-sortable"
                  >
                    Giới tính{getSortIcon("gender")}
                  </th>
                  <th
                    onClick={() => handleSort("specialty")}
                    className="pl-sortable"
                  >
                    Dịch vụ{getSortIcon("specialty")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="pl-sortable"
                  >
                    Trạng thái{getSortIcon("status")}
                  </th>
                  <th
                    onClick={() => handleSort("startDate")}
                    className="pl-sortable"
                  >
                    Ngày bắt đầu{getSortIcon("startDate")}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="pl-patient-code">
                        {patient.patientCode}
                      </div>
                    </td>
                    <td>
                      <div className="pl-patient-name">{patient.name}</div>
                    </td>
                    <td>
                      <div className="pl-contact">
                        <div className="pl-contact-item">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <span>{patient.email}</span>
                        </div>
                        <div className="pl-contact-item">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <span>{patient.phone}</span>
                        </div>
                        <div className="pl-contact-item">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>{patient.location}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pl-gender">{patient.gender}</span>
                    </td>
                    <td>
                      <span className="pl-specialty">{patient.specialty}</span>
                    </td>
                    <td>
                      <span className={`pl-status pl-status-${patient.status}`}>
                        {getStatusText(patient.status)}
                      </span>
                    </td>
                    <td>
                      <span className="pl-date">{patient.startDate}</span>
                    </td>
                    <td>
                      <div className="pl-action-buttons">
                        <button
                          className="pl-action-btn pl-detail-btn"
                          onClick={() => handleModalOpen(patient, "detail")}
                          title="Kế hoạch điều trị"
                        >
                          📋
                        </button>
                        <button
                          className="pl-action-btn pl-examination-btn"
                          onClick={() =>
                            handleModalOpen(patient, "examination")
                          }
                          title="Kết quả"
                        >
                          👨‍⚕️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="pl-modal-overlay" onClick={closeModal}>
          <div
            className="pl-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pl-modal-header">
              <h2>{getModalTitle()}</h2>
              <button className="pl-close-button" onClick={closeModal}>
                ✖
              </button>
            </div>
            <div className="pl-modal-body">{renderModalContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
