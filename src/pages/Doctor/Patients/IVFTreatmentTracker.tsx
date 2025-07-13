import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  FileText,
  Edit3,
  Check,
  Clock,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import "./IVFTreatmentTracker.css";
import MedicalRecordForm from "../MedicalRecordForm";

// Types
interface TreatmentStep {
  id: string;
  _id?: string;
  name: string;
  date?: string;
  doctorNote?: string;
  specialMetrics?: { [key: string]: string | number };
  performedBy?: string;
  status: "pending" | "completed" | "in-progress";
  category: string;
  stage?: string;
  executionDate?: string;
  description?: string;
  type?: string;
  scheduledDates?: string[];
  medicalRecords?: any[];
}

interface MedicalRecord {
  date: string;
  type: string;
  title: string;
  findings: string;
  conclusion: string;
  attachments: string[];
  notes: string;
}

interface FormData {
  date: string;
  performedBy: string;
  doctorNote: string;
  specialMetrics: { [key: string]: string | number };
  status?: "pending" | "in-progress" | "completed";
  stage?: string;
  title?: string;
  description?: string;
  type?: string;
  quantity?: number;
  unit?: string;
  scheduledDates?: string[];
  executionDate?: string;
  medicalRecords?: MedicalRecord[];
  medicalNotes?: string;
}

interface TreatmentPlan {
  _id: string;
  patient: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
    patientCode: string;
  };
  doctor: {
    _id: string;
    user: {
      userName: string;
    };
  };
  cycleStartDate: string;
  treatmentEvents: Array<{
    stage: string;
    title: string;
    description: string;
    type: string;
    status: string;
    scheduledDates: string[];
    medicalRecords: any[];
  }>;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const IVFTreatmentTracker: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(
    null
  );
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    performedBy: "",
    doctorNote: "",
    specialMetrics: {},
  });
  const [drafts, setDrafts] = useState<{ [key: string]: FormData }>({});
  const [updating, setUpdating] = useState(false);
  const [medicalRecordModal, setMedicalRecordModal] = useState<{
    open: boolean;
    step: any | null;
    medicalRecord?: any | null;
  }>({ open: false, step: null, medicalRecord: null });
  const [formError, setFormError] = useState<string | null>(null);

  const BASE_URL = "https://mirava-f0rz.onrender.com";

  // Fetch treatment plan data
  useEffect(() => {
    console.log("Fetching treatmentPlan:", treatmentPlan);
    console.log("Patient ID:", treatmentPlan?.patient);
    console.log("Patient Code:", treatmentPlan?.patient?.patientCode);
    const fetchTreatmentPlan = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        if (!token) {
          message.error("Vui lòng đăng nhập lại");
          navigate("/login");
          return;
        }

        console.log("Current patientId from URL:", patientId);
        console.log("Location state:", location.state);

        // Lấy patientId từ nhiều nguồn
        let targetPatientId = patientId;

        // Kiểm tra từ location state (từ navigation)
        if (!targetPatientId && location.state?.patientId) {
          targetPatientId = location.state.patientId;
          console.log("Using patientId from location state:", targetPatientId);
        }

        // Kiểm tra từ localStorage
        if (!targetPatientId) {
          const storedPatientId = localStorage.getItem("selectedPatientId");
          if (storedPatientId) {
            targetPatientId = storedPatientId;
            console.log("Using patientId from localStorage:", targetPatientId);
          }
        }

        // Nếu vẫn không có patientId, thử lấy từ URL query params
        if (!targetPatientId) {
          const urlParams = new URLSearchParams(window.location.search);
          targetPatientId = urlParams.get("patientId");
          console.log("Using patientId from URL params:", targetPatientId);
        }

        if (!targetPatientId) {
          setError("Không tìm thấy ID bệnh nhân");
          message.error("Không tìm thấy thông tin bệnh nhân");
          setLoading(false);
          return;
        }

        console.log("Final targetPatientId:", targetPatientId);

        // Thử fetch bằng patient ID trước
        let response;
        try {
          console.log(
            "Fetching with patient endpoint:",
            `${BASE_URL}/api/treatment-plan/patient/${targetPatientId}`
          );
          response = await axios.get(
            `${BASE_URL}/api/treatment-plan/patient/${targetPatientId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("Patient treatment plans response:", response.data);

          if (
            response.data.success &&
            response.data.data &&
            response.data.data.length > 0
          ) {
            // Lấy kế hoạch điều trị đầu tiên (hoặc mới nhất)
            const plan = response.data.data[0];
            setTreatmentPlan(plan);

            // Convert treatment events to treatment steps
            const steps: TreatmentStep[] = plan.treatmentEvents.map(
              (event: any, index: number) => ({
                id: `${index + 1}`,
                _id: event._id,
                name: event.title,
                category: mapTypeToCategory(event.type),
                status: mapStatusToDisplayStatus(event.status),
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
                doctorNote: event.description,
                performedBy:
                  event.status === "completed"
                    ? plan.doctor.user.userName
                    : undefined,
                specialMetrics: {},
                medicalRecords: event.medicalRecords || [],
                serviceId: event.serviceId || "",
              })
            );

            setTreatmentSteps(steps);
          } else {
            setError("Bệnh nhân chưa có kế hoạch điều trị nào");
            message.warning("Bệnh nhân chưa có kế hoạch điều trị nào");
          }
        } catch (patientError) {
          console.error("Error with patient endpoint:", patientError);

          // Nếu lỗi với patient endpoint, thử direct ID
          try {
            console.log(
              "Trying direct ID endpoint:",
              `${BASE_URL}/api/treatment-plan/${targetPatientId}`
            );
            response = await axios.get(
              `${BASE_URL}/api/treatment-plan/${targetPatientId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log("Direct ID response:", response.data);

            if (response.data.success) {
              const plan = response.data.data;
              setTreatmentPlan(plan);

              // Convert treatment events to treatment steps
              const steps: TreatmentStep[] = plan.treatmentEvents.map(
                (event: any, index: number) => ({
                  id: `${index + 1}`,
                  name: event.title,
                  category: mapTypeToCategory(event.type),
                  status: mapStatusToDisplayStatus(event.status),
                  stage: event.stage,
                  description: event.description,
                  type: event.type,
                  scheduledDates: event.scheduledDates,
                  date:
                    event.scheduledDates && event.scheduledDates.length > 0
                      ? new Date(event.scheduledDates[0])
                          .toISOString()
                          .split("T")[0]
                      : undefined,
                  doctorNote: event.description,
                  performedBy:
                    event.status === "completed"
                      ? plan.doctor.user.userName
                      : undefined,
                  specialMetrics: {},
                })
              );

              setTreatmentSteps(steps);
            } else {
              throw new Error("Không thể tải kế hoạch điều trị");
            }
          } catch (directError) {
            console.error("Error with direct ID endpoint:", directError);
            throw directError;
          }
        }
      } catch (err: any) {
        console.error("Error fetching treatment plan:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
        });

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            message.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
            localStorage.removeItem("accessToken");
            navigate("/login");
          } else if (err.response?.status === 404) {
            setError("Không tìm thấy kế hoạch điều trị cho bệnh nhân này");
            message.error("Không tìm thấy kế hoạch điều trị cho bệnh nhân này");
          } else {
            setError(
              `Lỗi khi tải dữ liệu: ${err.response?.status} - ${err.response?.statusText}`
            );
            message.error("Có lỗi xảy ra khi tải dữ liệu");
          }
        } else {
          setError("Có lỗi xảy ra khi tải dữ liệu");
          message.error("Có lỗi xảy ra khi tải dữ liệu");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTreatmentPlan();
  }, [patientId, navigate, location]);

  // Helper functions
  const mapTypeToCategory = (type: string): string => {
    switch (type) {
      case "Khám":
        return "Tư vấn";
      case "Xét nghiệm":
        return "Lab";
      case "Thủ thuật":
        return "Thủ thuật";
      case "Siêu âm":
        return "Kiểm tra";
      default:
        return "Tư vấn";
    }
  };

  const mapStatusToDisplayStatus = (
    status: string
  ): "pending" | "completed" | "in-progress" => {
    switch (status) {
      case "completed":
        return "completed";
      case "in_progress":
        return "in-progress";
      case "planned":
      default:
        return "pending";
    }
  };

  // Auto-save draft
  useEffect(() => {
    console.log("💾 Auto-saving draft for form:", activeForm);
    if (activeForm) {
      const timer = setTimeout(() => {
        setDrafts((prev) => ({
          ...prev,
          [activeForm]: formData,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, activeForm]);

  const openForm = (stepId: string) => {
    const step = treatmentSteps.find((s) => s.id === stepId);
    if (step) {
      setFormData({
        date: step.executionDate || new Date().toISOString().split("T")[0],
        executionDate:
          step.executionDate ||
          step.date ||
          new Date().toISOString().split("T")[0],
        performedBy: step.performedBy || "",
        doctorNote: step.doctorNote || "",
        description: step.description || "",
        specialMetrics: Object.entries(step.specialMetrics || {}).reduce(
          (acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          },
          {} as { [key: string]: string }
        ),
      });
    }

    // Load draft if exists
    if (drafts[stepId]) {
      setFormData(drafts[stepId]);
    }

    setActiveForm(stepId);
  };

  const closeForm = () => {
    setActiveForm(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      performedBy: "",
      doctorNote: "",
      specialMetrics: {},
    });
  };

  const saveFormData = async () => {
    if (!activeForm || !treatmentPlan) return;
    setFormError(null);
    
    // Validate ngày hẹn khám và ngày thực hiện
    const execDate = formData.executionDate
      ? new Date(formData.executionDate)
      : null;
    if (formData.scheduledDates && execDate) {
      for (const d of formData.scheduledDates) {
        if (d && new Date(d) >= execDate) {
          setFormError("Ngày hẹn khám phải trước ngày thực hiện!");
          return;
        }
      }
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");
      const stepIndex = treatmentSteps.findIndex((s) => s.id === activeForm);

      if (stepIndex === -1) {
        message.error("Không tìm thấy bước điều trị");
        return;
      }

      // Log để debug
      console.log("🔍 Current formData:", formData);
      console.log("📋 Step index:", stepIndex);
      console.log("🏥 Treatment step:", treatmentSteps[stepIndex]);

      // Chuẩn bị dữ liệu cập nhật với đầy đủ thông tin
      const updateData = {
        stage: formData.stage || treatmentSteps[stepIndex].stage || "",
        title: formData.title || treatmentSteps[stepIndex].name || "",
        description:
          formData.description || treatmentSteps[stepIndex].description || "",
        type: formData.type || treatmentSteps[stepIndex].type || "Khám",
        quantity: formData.quantity || 1,
        unit: formData.unit || "Lần",
        status: formData.status || "completed",
        scheduledDates:
          formData.scheduledDates && formData.scheduledDates.length > 0
            ? formData.scheduledDates
            : treatmentSteps[stepIndex].scheduledDates || [],
        executionDate: formData.executionDate || new Date().toISOString(),
        performedBy:
          formData.performedBy || treatmentPlan.doctor?.user?.userName || "",
        medicalRecords: formData.medicalRecords || [],
        medicalNotes: formData.medicalNotes || "",
        doctorNote: formData.doctorNote || "",
        specialMetrics: formData.specialMetrics || {},
      };

      console.log("📤 Sending update data:", updateData);
      console.log(
        "🌐 API URL:",
        `${BASE_URL}/api/treatment-plan/${treatmentPlan._id}/events/${stepIndex}`
      );

      // Sử dụng PUT để cập nhật toàn bộ event
      const response = await axios.put(
        `${BASE_URL}/api/treatment-plan/${treatmentPlan._id}/events/${stepIndex}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📥 API Response:", response.data);

      if (response.data.success) {
        // Cập nhật UI với dữ liệu trả về từ server
        const updatedTreatmentPlan = response.data.data.treatmentPlan;
        setTreatmentPlan(updatedTreatmentPlan);

        // Cập nhật treatment steps
        const updatedSteps = treatmentSteps.map((step, idx) =>
          idx === stepIndex
            ? {
                ...step,
                stage: response.data.data.updatedEvent.stage,
                name: response.data.data.updatedEvent.title,
                description: response.data.data.updatedEvent.description,
                type: response.data.data.updatedEvent.type,
                status: mapStatusToDisplayStatus(
                  response.data.data.updatedEvent.status
                ),
                executionDate: response.data.data.updatedEvent.executionDate
                  ? new Date(response.data.data.updatedEvent.executionDate)
                      .toISOString()
                      .split("T")[0]
                  : step.executionDate,
                performedBy: response.data.data.updatedEvent.performedBy,
                doctorNote:
                  response.data.data.updatedEvent.medicalNotes ||
                  response.data.data.updatedEvent.doctorNote,
                specialMetrics: updateData.specialMetrics,
              }
            : step
        );
        setTreatmentSteps(updatedSteps);

        message.success("Cập nhật kế hoạch điều trị thành công!");

        // Remove draft after saving
        setDrafts((prev) => {
          const newDrafts = { ...prev };
          delete newDrafts[activeForm];
          return newDrafts;
        });

        closeForm();
      } else {
        console.error("❌ API returned error:", response.data);
        message.error(
          "Không thể cập nhật kế hoạch điều trị: " +
            (response.data.message || "Unknown error")
        );
      }
    } catch (err: any) {
      console.error("❌ Error updating treatment step:", err);
      console.error("❌ Error response:", err.response?.data);

      if (err.response?.status === 401 || err.response?.status === 403) {
        message.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else if (err.response?.status === 404) {
        message.error("Không tìm thấy kế hoạch điều trị hoặc bước điều trị");
      } else if (err.response?.status === 400) {
        message.error(
          "Dữ liệu không hợp lệ: " +
            (err.response.data.message || "Bad request")
        );
      } else {
        message.error(
          "Có lỗi xảy ra khi cập nhật: " +
            (err.response?.data?.message || err.message)
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const addNewVisit = () => {
    const newVisit: TreatmentStep = {
      id: (treatmentSteps.length + 1).toString(),
      name: `Khám theo dõi ngày ${new Date().getDate()} chu kỳ`,
      category: "Tư vấn",
      status: "pending",
    };

    setTreatmentSteps((prev) => {
      const lastConsultationIndex = prev.findIndex(
        (step) => !step.category.includes("Tư vấn")
      );
      if (lastConsultationIndex === -1) {
        return [...prev, newVisit];
      } else {
        const newSteps = [...prev];
        newSteps.splice(lastConsultationIndex, 0, newVisit);
        return newSteps;
      }
    });

    setTimeout(() => openForm(newVisit.id), 100);
  };

  const getStatusIcon = (status: string, stepId: string) => {
    let icon;
    if (status === "completed")
      icon = <Check className="status-icon completed" />;
    else if (status === "in-progress")
      icon = <Clock className="status-icon in-progress" />;
    else icon = <div className="status-icon pending" />;

    return (
      <button
        type="button"
        className="status-toggle-btn"
        onClick={() => quickToggleStatus(stepId)}
        style={{ background: "none", border: "none", cursor: "pointer" }}
        title="Đổi trạng thái"
        disabled={updating}
      >
        {icon}
      </button>
    );
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case "Tư vấn":
        return "category-consultation";
      case "Kiểm tra":
        return "category-check";
      case "Thủ thuật":
        return "category-procedure";
      case "Lab":
        return "category-lab";
      default:
        return "category-consultation";
    }
  };

  const updateSpecialMetric = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specialMetrics: {
        ...prev.specialMetrics,
        [key]: value,
      },
    }));
  };

  const getMetricFields = (stepName: string) => {
    switch (stepName) {
      case "Khám tư vấn ban đầu":
        return ["Lần khám", "Phác đồ", "Cân nặng (kg)", "Huyết áp"];
      case "Khám theo dõi ngày 1 chu kỳ":
        return ["Ngày chu kỳ", "Nang cơ bản", "Liều thuốc", "E2 (pg/ml)"];
      case "Khám theo dõi ngày 5 chu kỳ":
        return [
          "Ngày chu kỳ",
          "Nang lớn nhất",
          "Điều chỉnh liều",
          "E2 (pg/ml)",
        ];
      case "Khám theo dõi ngày 8 chu kỳ":
        return ["Ngày chu kỳ", "Nang lớn nhất", "Số nang >12mm", "E2 (pg/ml)"];
      case "Khám theo dõi ngày 10 chu kỳ":
        return ["Ngày chu kỳ", "Nang lớn nhất", "HCG", "Lịch chọc hút"];
      case "Siêu âm noãn":
        return ["Nang trái (mm)", "Nang phải (mm)", "Nội mạc tử cung (mm)"];
      case "Chọc hút noãn":
        return ["Số noãn thu được", "Chất lượng"];
      case "Thụ tinh IVF":
        return ["Tinh trùng sau lọc", "Tỷ lệ thụ tinh (%)"];
      case "Nuôi cấy phôi":
        return ["Số phôi ngày 3", "Số phôi ngày 5", "Chất lượng phôi"];
      case "Chuyển phôi":
        return ["Số phôi chuyển", "Vị trí chuyển", "Độ dày nội mạc (mm)"];
      default:
        return [];
    }
  };

  const handleBackToPatientList = () => {
    navigate("/doctor/patients");
  };

  if (loading) {
    return (
      <div className="ivf-tracker">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải kế hoạch điều trị...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !treatmentPlan) {
    return (
      <div className="ivf-tracker">
        <div className="container">
          <div className="error-container">
            <h3>Có lỗi xảy ra</h3>
            <p>{error || "Không tìm thấy kế hoạch điều trị"}</p>
            <div className="error-actions">
              <button onClick={handleBackToPatientList} className="btn-primary">
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách bệnh nhân
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
                style={{ marginLeft: "12px" }}
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quickToggleStatus = async (stepId: string) => {
    if (!treatmentPlan) return;
    const stepIndex = treatmentSteps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) return;

    // Xác định trạng thái tiếp theo
    const current = treatmentSteps[stepIndex].status;
    let next: "pending" | "in-progress" | "completed";
    if (current === "pending") next = "in-progress";
    else if (current === "in-progress") next = "completed";
    else next = "pending";

    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");

      console.log("Updating event at index:", stepIndex);
      console.log("Treatment plan ID:", treatmentPlan._id);

      const response = await axios.patch(
        `${BASE_URL}/api/treatment-plan/${treatmentPlan._id}/events/${stepIndex}/status`,
        {
          status: next,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const updatedTreatmentPlan = response.data.data.treatmentPlan;
        setTreatmentPlan(updatedTreatmentPlan);

        const updatedSteps = treatmentSteps.map((step, idx) =>
          idx === stepIndex
            ? {
                ...step,
                status: next,
                executionDate: response.data.data.updatedEvent.executionDate
                  ? new Date(response.data.data.updatedEvent.executionDate)
                      .toISOString()
                      .split("T")[0]
                  : step.executionDate,
              }
            : step
        );
        setTreatmentSteps(updatedSteps);

        message.success("Đã cập nhật trạng thái!");
      } else {
        message.error("Không thể cập nhật trạng thái");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      message.error("Có lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const openMedicalRecordModal = async (step: any) => {
    let medicalRecord = null;
    if (step.medicalRecords && step.medicalRecords.length > 0) {
      const recordId = step.medicalRecords[0];
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `https://mirava-f0rz.onrender.com/api/medicalRecord/${recordId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.success) {
          medicalRecord = res.data.data;
        }
      } catch (err) {
        console.error("Không thể lấy hồ sơ y tế:", err);
      }
    }
    setMedicalRecordModal({ open: true, step, medicalRecord });
  };

  const closeMedicalRecordModal = () => {
    setMedicalRecordModal({ open: false, step: null });
  };

  return (
    <div className="ivf-tracker">
      <div className="container">
        {/* Header with patient info */}
        <div className="header">
          <div className="header-top">
            <button onClick={handleBackToPatientList} className="back-btn">
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </button>
            <div className="patient-info">
              <h1 className="header-title">
                Kế hoạch điều trị IVF - {treatmentPlan.patient.userName}
              </h1>
              <div className="patient-details">
                <span>Mã BN: {treatmentPlan?.patient?.patientCode}</span>
                <span>SĐT: {treatmentPlan.patient.phone}</span>
                <span>
                  Ngày bắt đầu chu kì:{" "}
                  {new Date(treatmentPlan.cycleStartDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </span>
                <span className={`status-badge ${treatmentPlan.status}`}>
                  {treatmentPlan.status === "planned"
                    ? "Đã lên kế hoạch"
                    : treatmentPlan.status === "in_progress"
                    ? "Đang thực hiện"
                    : treatmentPlan.status === "completed"
                    ? "Hoàn thành"
                    : "Đã hủy"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="step-count">
            Tổng cộng:{" "}
            <span className="step-count-number">{treatmentSteps.length}</span>{" "}
            bước điều trị
          </div>
          <div className="progress-info">
            Hoàn thành:{" "}
            <span className="completed-count">
              {
                treatmentSteps.filter((step) => step.status === "completed")
                  .length
              }
            </span>
            /{treatmentSteps.length}
          </div>
          <button onClick={addNewVisit} className="add-visit-btn">
            <Plus className="w-4 h-4" />
            Thêm lần khám mới
          </button>
        </div>

        {/* Main Card */}
        <div className="main-card">
          <div className="table-container">
            <table className="treatment-table">
              <thead className="table-header">
                <tr>
                  <th>Trạng thái</th>
                  <th>Bước điều trị</th>
                  <th>Giai đoạn</th>
                  <th>Ngày thực hiện</th>
                  <th>Người thực hiện</th>
                  <th>Ghi chú</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {treatmentSteps.map((step) => (
                  <tr key={step.id} className={`table-row ${step.status}`}>
                    <td className="table-cell">
                      {getStatusIcon(step.status, step.id)}
                    </td>
                    <td className="table-cell">
                      <div className="step-info">
                        <span className="step-name">{step.name}</span>
                        <span
                          className={`category-badge ${getCategoryClass(
                            step.category
                          )}`}
                        >
                          {step.category}
                        </span>
                        {drafts[step.id] && (
                          <span className="draft-badge">Draft</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {step.stage && (
                        <span className="stage-badge">{step.stage}</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {step.executionDate ? (
                        <div className="info-item">
                          <Calendar className="w-4 h-4" />
                          {step.executionDate}
                        </div>
                      ) : (
                        <span className="info-item empty">Chưa thực hiện</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {step.performedBy ? (
                        <div className="info-item">
                          <User className="w-4 h-4" />
                          {step.performedBy}
                        </div>
                      ) : (
                        <span className="info-item empty">-</span>
                      )}
                    </td>
                    <td className="table-cell notes-cell">
                      {step.description ? (
                        <span className="notes-text">{step.description}</span>
                      ) : (
                        <span className="notes-text empty">
                          Chưa có ghi chú
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <button
                          onClick={() => openForm(step.id)}
                          className="action-btn"
                        >
                          <Edit3 className="w-4 h-4" />
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => openMedicalRecordModal(step)}
                          className="action-btn"
                          style={{
                            background: "#00b4c6",
                            color: "#fff",
                          }}
                        >
                          Kết quả
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Treatment Plan Notes */}
        {treatmentPlan.notes && (
          <div className="notes-card">
            <h3>Ghi chú kế hoạch điều trị</h3>
            <p>{treatmentPlan.notes}</p>
          </div>
        )}

        {/* Form Modal - Updated with new class names */}
        {activeForm && (
          <div className="form-modal-overlay">
            <div className="form-modal">
              <div className="form-modal-header">
                <h3 className="form-modal-title">
                  Cập nhật kế hoạch điều trị:{" "}
                  {treatmentSteps.find((s) => s.id === activeForm)?.name}
                </h3>
                <button onClick={closeForm} className="form-modal-close-btn">
                  ×
                </button>
              </div>

              <div className="form-modal-content">
                {/* Stage */}
                <div className="form-group">
                  <label className="form-label">Giai đoạn</label>
                  <input
                    type="text"
                    value={
                      formData.stage ||
                      treatmentSteps.find((s) => s.id === activeForm)?.stage ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stage: e.target.value,
                      }))
                    }
                    placeholder="Giai đoạn điều trị"
                    className="form-input"
                  />
                </div>

                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Tên bước điều trị</label>
                  <input
                    type="text"
                    value={
                      formData.title ||
                      treatmentSteps.find((s) => s.id === activeForm)?.name ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Tên bước điều trị"
                    className="form-input"
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    value={
                      formData.description ||
                      treatmentSteps.find((s) => s.id === activeForm)
                        ?.description ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Mô tả chi tiết về bước điều trị"
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                {/* Type */}
                <div className="form-group">
                  <label className="form-label">Loại</label>
                  <select
                    value={
                      formData.type ||
                      treatmentSteps.find((s) => s.id === activeForm)?.type ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="form-input"
                  >
                    <option value="">Chọn loại</option>
                    <option value="Khám">Khám</option>
                    <option value="Thủ thuật">Thủ thuật</option>
                    <option value="Xét nghiệm">Xét nghiệm</option>
                    <option value="Siêu âm">Siêu âm</option>
                  </select>
                </div>

                {/* Quantity & Unit */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Số lượng</label>
                    <input
                      type="number"
                      value={formData.quantity || 1}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          quantity: parseInt(e.target.value) || 1,
                        }))
                      }
                      min="1"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đơn vị</label>
                    <input
                      type="text"
                      value={formData.unit || "Lần"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          unit: e.target.value,
                        }))
                      }
                      placeholder="Đơn vị (Lần, Ngày, ...)"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Execution Date */}
                <div className="form-group">
                  <label className="form-label">Ngày thực hiện</label>
                  <input
                    type="datetime-local"
                    value={
                      formData.executionDate
                        ? new Date(formData.executionDate)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        executionDate: e.target.value,
                      }))
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ngày hẹn khám</label>
                  <input
                    type="datetime-local"
                    value={
                      formData.scheduledDates
                        ? formData.scheduledDates.join(",")
                        : treatmentSteps
                            .find((s) => s.id === activeForm)
                            ?.scheduledDates?.join(",") || ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledDates: e.target.value
                          .split(",")
                          .map((d) => d.trim())
                          .filter((d) => d),
                      }))
                    }
                    placeholder="2024-07-01,2024-07-05"
                    className="form-input"
                  />
                  {formError && (
                    <div className="form-error">
                      {formError}
                    </div>
                  )}
                </div>

                {/* Performed By */}
                <div className="form-group">
                  <label className="form-label">Người thực hiện</label>
                  <input
                    type="text"
                    value={formData.performedBy}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        performedBy: e.target.value,
                      }))
                    }
                    placeholder="Nhập tên bác sĩ/kỹ thuật viên"
                    className="form-input"
                  />
                </div>

                {getMetricFields(
                  treatmentSteps.find((s) => s.id === activeForm)?.name || ""
                ).length > 0 && (
                  <div className="metrics-section">
                    <label className="metrics-label">Chỉ số đặc biệt</label>
                    <div className="metrics-grid">
                      {getMetricFields(
                        treatmentSteps.find((s) => s.id === activeForm)?.name ||
                          ""
                      ).map((field) => (
                        <div key={field} className="metric-item">
                          <label className="metric-label">{field}</label>
                          <input
                            type="text"
                            value={formData.specialMetrics[field] || ""}
                            onChange={(e) =>
                              updateSpecialMetric(field, e.target.value)
                            }
                            className="metric-input"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="form-modal-footer">
                <button
                  onClick={closeForm}
                  className="form-btn-cancel"
                  disabled={updating}
                >
                  Hủy
                </button>
                <button
                  onClick={saveFormData}
                  className="form-btn-save"
                  disabled={updating}
                >
                  <Check className="w-4 h-4" />
                  {updating ? "Đang lưu..." : "Lưu kết quả"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medical Record Modal - Updated with new class names */}
        {medicalRecordModal.open && (
          <div className="medical-modal-overlay">
            <div className="medical-modal">
              <div className="medical-modal-header">
                <h3 className="medical-modal-title">
                  Nhập kết quả cho bước:{" "}
                  {medicalRecordModal.step?.name ||
                    medicalRecordModal.step?.title}
                </h3>
                <button
                  onClick={closeMedicalRecordModal}
                  className="medical-modal-close-btn"
                >
                  ×
                </button>
              </div>
              <div className="medical-modal-content">
                {medicalRecordModal.open && treatmentPlan && (
                  <div className="medical-record-form-wrapper">
                    <MedicalRecordForm
                      step={medicalRecordModal.step}
                      treatmentPlan={treatmentPlan}
                      medicalRecord={medicalRecordModal.medicalRecord || null}
                      onSuccess={() => {
                        closeMedicalRecordModal();
                        // TODO: reload treatment plan data nếu cần
                      }}
                      onCancel={closeMedicalRecordModal}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IVFTreatmentTracker;