import React, { useState, useEffect } from "react";
import type { JSX } from "react";
import {
  Calendar,
  User,
  Edit3,
  Check,
  Clock,
  Plus,
  ArrowLeft,
  Search,
  RefreshCw,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Eye,
  Save,
  X,
  Stethoscope,
  TestTube,
  Syringe,
  Clipboard,
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import axiosInstance from "@/services/MainService";
import "./IVFTreatmentTracker.css";
import MedicalRecordForm from "../MedicalRecordForm";
import type {
  TreatmentStep,
  FormData,
  MedicalRecordModalState,
} from "@/types/treatment.types";
import { useTreatmentPlan } from "@/hooks/useTreatmentLogic";

const IVFTreatmentTracker: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    treatmentPlan,
    treatmentSteps,
    loading,
    error,
    updateTreatmentPlan,
    updateTreatmentSteps,
    updateCycleStartDate,
  } = useTreatmentPlan({
    patientId,
    locationState: location.state,
  });

  const [filteredSteps, setFilteredSteps] = useState<TreatmentStep[]>([]);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    performedBy: "",
    doctorNote: "",
    specialMetrics: {},
  });
  const [drafts, setDrafts] = useState<{ [key: string]: FormData }>({});
  const [updating, setUpdating] = useState<boolean>(false);
  const [medicalRecordModal, setMedicalRecordModal] =
    useState<MedicalRecordModalState>({
      open: false,
      step: null,
      medicalRecord: null,
    });
  const [formError, setFormError] = useState<string | null>(null);

  // ✅ State cho filter và search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "in-progress" | "completed"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // ✅ State cho cập nhật ngày bắt đầu chu kỳ
  const [editingCycleStart, setEditingCycleStart] = useState<boolean>(false);
  const [newCycleStartDate, setNewCycleStartDate] = useState<string>("");
  const [viewOnlyFormId, setViewOnlyFormId] = useState<string | null>(null);

  const BASE_URL = "https://mirava-f0rz.onrender.com";
  useEffect(() => {
    setFilteredSteps(treatmentSteps);
  }, [treatmentSteps]);
  // ✅ Filter treatment steps
  useEffect(() => {
    let filtered = treatmentSteps;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (step) =>
          step.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          step.stage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          step.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((step) => step.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((step) => step.category === categoryFilter);
    }

    setFilteredSteps(filtered);
  }, [treatmentSteps, searchTerm, statusFilter, categoryFilter]);

  // ✅ Hàm cập nhật ngày bắt đầu chu kỳ
  const handleUpdateCycleStartDate = async (): Promise<void> => {
    if (!newCycleStartDate) {
      message.error("Vui lòng chọn ngày bắt đầu chu kỳ");
      return;
    }

    try {
      await updateCycleStartDate(newCycleStartDate);
      setEditingCycleStart(false);
    } catch (error) {
      // Error đã được handle trong hook
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

  const openForm = (stepId: string, viewOnly: boolean = false): void => {
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

    if (drafts[stepId]) {
      setFormData(drafts[stepId]);
    }

    setActiveForm(stepId);
    setViewOnlyFormId(viewOnly ? stepId : null);
  };

  const closeForm = (): void => {
    setActiveForm(null);
    setViewOnlyFormId(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      performedBy: "",
      doctorNote: "",
      specialMetrics: {},
    });
  };

  const saveFormData = async (): Promise<void> => {
    if (!activeForm || !treatmentPlan) return;
    setFormError(null);

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

      const response = await axiosInstance.put(
        `${BASE_URL}/api/treatment-plan/${treatmentPlan._id}/events/${stepIndex}/status`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const updatedTreatmentPlan = response.data.data.treatmentPlan;
        updateTreatmentPlan(updatedTreatmentPlan);

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
        updateTreatmentSteps(updatedSteps);

        message.success("Cập nhật kế hoạch điều trị thành công!");

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
    } catch (err: unknown) {
      console.error("❌ Error updating treatment step:", err);

      if (axios.isAxiosError(err)) {
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
      } else {
        message.error("Có lỗi xảy ra khi cập nhật");
      }
    } finally {
      setUpdating(false);
    }
  };

  const addNewVisit = (): void => {
    const newVisit: TreatmentStep = {
      id: (treatmentSteps.length + 1).toString(),
      name: `Khám theo dõi ngày ${new Date().getDate()} chu kỳ`,
      category: "Tư vấn",
      status: "pending",
    };
    const updatedSteps = [...treatmentSteps];
    const lastConsultationIndex = updatedSteps.findIndex(
      (step) => !step.category.includes("Tư vấn")
    );

    if (lastConsultationIndex === -1) {
      updatedSteps.push(newVisit);
    } else {
      updatedSteps.splice(lastConsultationIndex, 0, newVisit);
    }

    updateTreatmentSteps(updatedSteps);
    setTimeout(() => openForm(newVisit.id), 100);
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case "completed":
        return <CheckCircle className="status-icon completed" size={20} />;
      case "in-progress":
        return <Clock className="status-icon in-progress" size={20} />;
      default:
        return <AlertCircle className="status-icon pending" size={20} />;
    }
  };

  const getCategoryIcon = (category: string): JSX.Element => {
    switch (category) {
      case "Tư vấn":
        return <Stethoscope size={16} />;
      case "Lab":
        return <TestTube size={16} />;
      case "Thủ thuật":
        return <Syringe size={16} />;
      case "Kiểm tra":
        return <Activity size={16} />;
      default:
        return <Clipboard size={16} />;
    }
  };

  const getCategoryClass = (category: string): string => {
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

  const quickToggleStatus = async (stepId: string): Promise<void> => {
    if (!treatmentPlan) return;
    const stepIndex = treatmentSteps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) return;

    const current = treatmentSteps[stepIndex].status;
    let next: "pending" | "in-progress" | "completed";
    if (current === "pending") next = "in-progress";
    else if (current === "in-progress") next = "completed";
    else next = "pending";

    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");

      const response = await axiosInstance.patch(
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
        updateTreatmentPlan(updatedTreatmentPlan);

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
        updateTreatmentSteps(updatedSteps);

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

  const openMedicalRecordModal = async (step: TreatmentStep): Promise<void> => {
    let medicalRecord = null;
    if (step.medicalRecords && step.medicalRecords.length > 0) {
      const recordId = step.medicalRecords[0];
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axiosInstance.get(
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

  const closeMedicalRecordModal = (): void => {
    setMedicalRecordModal({ open: false, step: null });
  };

  const handleBackToPatientList = (): void => {
    navigate("/doctor/patients");
  };

  // const updateSpecialMetric = (key: string, value: string): void => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     specialMetrics: {
  //       ...prev.specialMetrics,
  //       [key]: value,
  //     },
  //   }));
  // };

  const getMetricFields = (stepName: string): string[] => {
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

  const getUniqueCategories = (): string[] => {
    return [...new Set(treatmentSteps.map((step) => step.category))];
  };

  if (loading) {
    return (
      <div className="ivf-tracker">
        <div className="ivf-container">
          <div className="ivf-loading">
            <div className="ivf-loading-spinner"></div>
            <p>Đang tải kế hoạch điều trị...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !treatmentPlan) {
    return (
      <div className="ivf-tracker">
        <div className="ivf-container">
          <div className="ivf-error">
            <AlertCircle size={48} className="error-icon" />
            <h3>Có lỗi xảy ra</h3>
            <p>{error || "Không tìm thấy kế hoạch điều trị"}</p>
            <div className="error-actions">
              <button
                onClick={handleBackToPatientList}
                className="ivf-btn-primary"
              >
                <ArrowLeft size={16} />
                Quay lại danh sách bệnh nhân
              </button>
              <button
                onClick={() => window.location.reload()}
                className="ivf-btn-secondary"
              >
                <RefreshCw size={16} />
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  console.log("treatmentPlan:", treatmentPlan);
  console.log("treatmentPlan.patient:", treatmentPlan?.patient);
  return (
    <div className="ivf-tracker">
      <div className="ivf-container">
        {/* ✅ Header with patient info */}
        <div className="ivf-header">
          <div className="ivf-header-top">
            <button onClick={handleBackToPatientList} className="ivf-back-btn">
              <ArrowLeft size={16} />
              Quay lại danh sách
            </button>
          </div>
          <div className="ivf-header-content">
            <div className="ivf-patient-info">
              <h1 className="ivf-title">
                Kế hoạch điều trị IVF - {treatmentPlan.patient?.userName}
              </h1>
              <div className="ivf-patient-details">
                <div className="ivf-detail-item">
                  <span>Mã BN:</span>
                  <strong>{treatmentPlan?.patient?.patientCode}</strong>
                </div>
                <div className="ivf-detail-item">
                  <span>SĐT:</span>
                  <strong>{treatmentPlan.patient?.phone}</strong>
                </div>
                <div className="ivf-detail-item">
                  <span>Email:</span>
                  <strong>{treatmentPlan.patient?.email}</strong>
                </div>
                <div className="ivf-detail-item">
                  <span>Bác sĩ:</span>
                  <strong>{treatmentPlan.doctor?.user?.userName}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Stats Cards */}
        <div className="ivf-stats">
          <div className="ivf-stat-card">
            <div className="ivf-stat-icon">
              <Clipboard size={24} />
            </div>
            <div className="ivf-stat-content">
              <h3>Tổng bước</h3>
              <p>{treatmentSteps.length}</p>
            </div>
          </div>
          <div className="ivf-stat-card">
            <div className="ivf-stat-icon completed">
              <CheckCircle size={24} />
            </div>
            <div className="ivf-stat-content">
              <h3>Hoàn thành</h3>
              <p>
                {
                  treatmentSteps.filter((step) => step.status === "completed")
                    .length
                }
              </p>
            </div>
          </div>
          <div className="ivf-stat-card">
            <div className="ivf-stat-icon in-progress">
              <Clock size={24} />
            </div>
            <div className="ivf-stat-content">
              <h3>Đang thực hiện</h3>
              <p>
                {
                  treatmentSteps.filter((step) => step.status === "in-progress")
                    .length
                }
              </p>
            </div>
          </div>
          <div className="ivf-stat-card">
            <div className="ivf-stat-icon pending">
              <AlertCircle size={24} />
            </div>
            <div className="ivf-stat-content">
              <h3>Chờ thực hiện</h3>
              <p>
                {
                  treatmentSteps.filter((step) => step.status === "pending")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Cycle Start Date Section */}
        <div className="ivf-cycle-section">
          <div className="ivf-cycle-info">
            <h3>Ngày bắt đầu chu kỳ</h3>
            {editingCycleStart ? (
              <div className="ivf-cycle-edit">
                <input
                  type="datetime-local"
                  value={newCycleStartDate}
                  onChange={(e) => setNewCycleStartDate(e.target.value)}
                  className="ivf-cycle-input"
                />
                <button
                  onClick={handleUpdateCycleStartDate}
                  className="ivf-btn-save"
                >
                  <Save size={16} />
                  Lưu
                </button>
                <button
                  onClick={() => setEditingCycleStart(false)}
                  className="ivf-btn-cancel"
                >
                  <X size={16} />
                  Hủy
                </button>
              </div>
            ) : (
              <div className="ivf-cycle-view">
                <span className="ivf-cycle-date">
                  {new Date(treatmentPlan.cycleStartDate).toLocaleString(
                    "vi-VN",
                    {
                      timeZone: "Asia/Ho_Chi_Minh",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
                <button
                  onClick={() => {
                    setEditingCycleStart(true);
                    setNewCycleStartDate(
                      treatmentPlan.cycleStartDate
                        ? new Date(treatmentPlan.cycleStartDate)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    );
                  }}
                  className="ivf-btn-edit"
                >
                  <Edit3 size={16} />
                  Sửa
                </button>
              </div>
            )}
          </div>
          <div className="ivf-status-badge">
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

        {/* ✅ Controls */}
        <div className="ivf-controls">
          <div className="ivf-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bước, giai đoạn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="ivf-filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ thực hiện</option>
            <option value="in-progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="ivf-filter-select"
          >
            <option value="all">Tất cả loại</option>
            {getUniqueCategories().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button onClick={addNewVisit} className="ivf-add-btn">
            <Plus size={20} />
            Thêm bước mới
          </button>
        </div>

        {/* ✅ Table */}
        <div className="ivf-table-container">
          <div className="ivf-table-header">
            <h2>Kế hoạch điều trị ({filteredSteps.length})</h2>
          </div>

          {filteredSteps.length === 0 ? (
            <div className="ivf-no-data">
              <FileText size={40} />
              <p>Không có bước điều trị nào phù hợp với tiêu chí tìm kiếm</p>
            </div>
          ) : (
            <div className="ivf-table-wrapper">
              <table className="ivf-table">
                <thead>
                  <tr>
                    <th>Trạng thái</th>
                    <th>Bước điều trị</th>
                    <th>Giai đoạn</th>
                    <th>Ngày thực hiện</th>
                    <th>Người thực hiện</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSteps.map((step) => (
                    <tr
                      key={step.id}
                      className={`ivf-table-row ${step.status}`}
                    >
                      <td>
                        <button
                          className="ivf-status-btn"
                          onClick={() => quickToggleStatus(step.id)}
                          title="Đổi trạng thái"
                          disabled={updating}
                        >
                          {getStatusIcon(step.status)}
                        </button>
                      </td>
                      <td>
                        <div className="ivf-step-info">
                          <div className="ivf-step-name">{step.name}</div>
                          <div
                            className={`ivf-category-badge ${getCategoryClass(
                              step.category
                            )}`}
                          >
                            {getCategoryIcon(step.category)}
                            <span>{step.category}</span>
                          </div>
                          {drafts[step.id] && (
                            <span className="ivf-draft-badge">Draft</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {step.stage && (
                          <span className="ivf-stage-badge">{step.stage}</span>
                        )}
                      </td>
                      <td>
                        {step.executionDate ? (
                          <div className="ivf-date-info">
                            <Calendar size={16} />
                            <span>{step.executionDate}</span>
                          </div>
                        ) : (
                          <span className="ivf-no-data-text">
                            Chưa thực hiện
                          </span>
                        )}
                      </td>
                      <td>
                        {step.performedBy ? (
                          <div className="ivf-user-info">
                            <User size={16} />
                            <span>{step.performedBy}</span>
                          </div>
                        ) : (
                          <span className="ivf-no-data-text">-</span>
                        )}
                      </td>
                      <td>
                        <div className="ivf-notes">
                          {step.description ? (
                            <span className="ivf-notes-text">
                              {step.description}
                            </span>
                          ) : (
                            <span className="ivf-no-data-text">
                              Chưa có ghi chú
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="ivf-action-buttons">
                          <button
                            onClick={() => openMedicalRecordModal(step)}
                            className="ivf-action-btn ivf-edit-btn"
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => openForm(step.id, true)}
                            className="ivf-action-btn ivf-record-btn"
                            title="Xem"
                          >
                            <Eye size={16} />
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

        {/* ✅ Treatment Plan Notes */}
        {treatmentPlan.notes && (
          <div className="ivf-notes-card">
            <h3>Ghi chú kế hoạch điều trị</h3>
            <p>{treatmentPlan.notes}</p>
          </div>
        )}

        {/* ✅ Form Modal */}
        {activeForm && (
          <div className="ivf-modal-overlay" onClick={closeForm}>
            <div
              className="ivf-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ivf-modal-header">
                <h3>
                  Thông tin chi tiết:{" "}
                  {treatmentSteps.find((s) => s.id === activeForm)?.name}
                </h3>
                <button onClick={closeForm} className="ivf-close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="ivf-modal-body">
                {/* Stage */}
                <div className="ivf-form-group">
                  <label className="ivf-form-label">Giai đoạn</label>
                  <input
                    type="text"
                    value={
                      formData.stage ||
                      treatmentSteps.find((s) => s.id === activeForm)?.stage ||
                      ""
                    }
                    readOnly={!!viewOnlyFormId}
                    className="ivf-form-input"
                  />
                </div>

                {/* Title */}
                <div className="ivf-form-group">
                  <label className="ivf-form-label">Tên bước điều trị</label>
                  <input
                    type="text"
                    value={
                      formData.title ||
                      treatmentSteps.find((s) => s.id === activeForm)?.name ||
                      ""
                    }
                    readOnly={!!viewOnlyFormId}
                    className="ivf-form-input"
                  />
                </div>

                {/* Description */}
                <div className="ivf-form-group">
                  <label className="ivf-form-label">Mô tả</label>
                  <textarea
                    value={
                      formData.description ||
                      treatmentSteps.find((s) => s.id === activeForm)
                        ?.description ||
                      ""
                    }
                    readOnly={!!viewOnlyFormId}
                    className="ivf-form-textarea"
                    rows={3}
                  />
                </div>

                {/* Execution Date */}
                <div className="ivf-form-group">
                  <label className="ivf-form-label">Ngày thực hiện</label>
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
                    className="ivf-form-input"
                  />
                </div>

                {/* Performed By */}
                <div className="ivf-form-group">
                  <label className="ivf-form-label">Người thực hiện</label>
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
                    className="ivf-form-input"
                  />
                </div>

                {/* Doctor Note */}
                <div className="ivf-form-group">
                  <label className="ivf-form-label">Ghi chú bác sĩ</label>
                  <textarea
                    value={formData.doctorNote}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        doctorNote: e.target.value,
                      }))
                    }
                    placeholder="Ghi chú từ bác sĩ"
                    className="ivf-form-textarea"
                    rows={3}
                  />
                </div>

                {/* Special Metrics */}
                {getMetricFields(
                  treatmentSteps.find((s) => s.id === activeForm)?.name || ""
                ).length > 0 && (
                  <div className="ivf-metrics-section">
                    <label className="ivf-form-label">Chỉ số đặc biệt</label>
                    <div className="ivf-metrics-grid">
                      {getMetricFields(
                        treatmentSteps.find((s) => s.id === activeForm)?.name ||
                          ""
                      ).map((field) => (
                        <div key={field} className="ivf-metric-item">
                          <label className="ivf-metric-label">{field}</label>
                          <input
                            type="text"
                            value={formData.specialMetrics[field] || ""}
                            readOnly={!!viewOnlyFormId}
                            className="ivf-metric-input"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formError && <div className="ivf-form-error">{formError}</div>}
              </div>

              {!viewOnlyFormId && (
                <div className="ivf-modal-footer">
                  <button
                    onClick={closeForm}
                    className="ivf-btn-cancel"
                    disabled={updating}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={saveFormData}
                    className="ivf-btn-save"
                    disabled={updating}
                  >
                    <Check size={16} />
                    {updating ? "Đang lưu..." : "Lưu kết quả"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ Medical Record Modal */}
        {medicalRecordModal.open && (
          <div className="ivf-medical-modal-overlay">
            <div className="ivf-medical-modal">
              <div className="ivf-medical-modal-header">
                <h3>Nhập kết quả cho bước: {medicalRecordModal.step?.name}</h3>
                <button
                  onClick={closeMedicalRecordModal}
                  className="ivf-close-btn"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="ivf-medical-modal-content">
                {medicalRecordModal.open &&
                  treatmentPlan &&
                  medicalRecordModal.step && (
                    <MedicalRecordForm
                      step={{
                        id: medicalRecordModal.step.id,
                        type: medicalRecordModal.step.type,
                        name: medicalRecordModal.step.name,
                        title: medicalRecordModal.step.name,
                        serviceId: medicalRecordModal.step.serviceId,
                        medicalRecords:
                          medicalRecordModal.step.medicalRecords?.map(
                            (record) =>
                              typeof record === "string"
                                ? record
                                : record.toString()
                          ),
                      }}
                      treatmentPlan={{
                        _id: treatmentPlan._id,
                        patient: treatmentPlan.patient._id,
                        doctor: {
                          _id: treatmentPlan.doctor._id,
                        },
                        treatmentEvents: treatmentPlan.treatmentEvents.map(
                          (event) => ({
                            _id: event._id || `temp-${Math.random()}`,
                          })
                        ),
                      }}
                      medicalRecord={
                        medicalRecordModal.medicalRecord || undefined
                      }
                      onSuccess={() => {
                        closeMedicalRecordModal();
                      }}
                      onCancel={closeMedicalRecordModal}
                    />
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
