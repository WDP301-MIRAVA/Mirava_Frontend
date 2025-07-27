import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import axiosInstance from "@/services/MainService";
import type {
  TreatmentPlan,
  TreatmentStep,
  MedicalRecord,
} from "@/types/treatment.types";

interface UseTreatmentPlanProps {
  patientId?: string;
  locationState?: any;
}

interface UseTreatmentPlanReturn {
  treatmentPlan: TreatmentPlan | null;
  treatmentSteps: TreatmentStep[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTreatmentPlan: (updatedPlan: TreatmentPlan) => void;
  updateTreatmentSteps: (updatedSteps: TreatmentStep[]) => void;
  updateCycleStartDate: (newDate: string) => Promise<void>;
}

const BASE_URL = "https://mirava-f0rz.onrender.com";

export const useTreatmentPlan = ({
  patientId,
  locationState,
}: UseTreatmentPlanProps): UseTreatmentPlanReturn => {
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(
    null
  );
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const fetchTreatmentPlan = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }

      // Lấy patientId từ nhiều nguồn
      let targetPatientId = patientId;

      if (!targetPatientId && locationState?.patientId) {
        targetPatientId = locationState.patientId;
      }

      if (!targetPatientId) {
        const storedPatientId = localStorage.getItem("selectedPatientId");
        if (storedPatientId) {
          targetPatientId = storedPatientId;
        }
      }

      if (!targetPatientId) {
        const urlParams = new URLSearchParams(window.location.search);
        targetPatientId = urlParams.get("patientId") || undefined;
      }

      if (!targetPatientId) {
        setError("Không tìm thấy ID bệnh nhân");
        message.error("Không tìm thấy thông tin bệnh nhân");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(
        `${BASE_URL}/api/treatment-plan/patient/${targetPatientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const plan = response.data.data[0];
        setTreatmentPlan(plan);

        // Convert treatment events to treatment steps
        const steps: TreatmentStep[] = plan.treatmentEvents.map(
          (event: unknown, index: number) => {
            const typedEvent = event as {
              _id?: string;
              title: string;
              description: string;
              type: string;
              status: string;
              stage: string;
              scheduledDates: string[];
              executionDate?: string;
              medicalRecords?: unknown[];
            };

            return {
              id: `${index + 1}`,
              _id: typedEvent._id,
              name: typedEvent.title,
              category: mapTypeToCategory(typedEvent.type),
              status: mapStatusToDisplayStatus(typedEvent.status),
              stage: typedEvent.stage,
              description: typedEvent.description,
              type: typedEvent.type,
              scheduledDates: typedEvent.scheduledDates,
              executionDate: typedEvent.executionDate
                ? new Date(typedEvent.executionDate).toISOString().split("T")[0]
                : undefined,
              date:
                typedEvent.scheduledDates &&
                typedEvent.scheduledDates.length > 0
                  ? new Date(typedEvent.scheduledDates[0])
                      .toISOString()
                      .split("T")[0]
                  : undefined,
              doctorNote: typedEvent.description,
              performedBy:
                typedEvent.status === "completed"
                  ? plan.doctor.user.userName
                  : undefined,
              specialMetrics: {},
              medicalRecords: (typedEvent.medicalRecords ||
                []) as MedicalRecord[],
            };
          }
        );

        setTreatmentSteps(steps);
      } else {
        setError("Bệnh nhân chưa có kế hoạch điều trị nào");
        message.warning("Bệnh nhân chưa có kế hoạch điều trị nào");
      }
    } catch (err: unknown) {
      console.error("Error fetching treatment plan:", err);

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
  }, [patientId, locationState, navigate]);

  // Function để update treatment plan từ component
  const updateTreatmentPlan = useCallback((updatedPlan: TreatmentPlan) => {
    setTreatmentPlan(updatedPlan);
  }, []);

  // Function để update treatment steps từ component
  const updateTreatmentSteps = useCallback((updatedSteps: TreatmentStep[]) => {
    setTreatmentSteps(updatedSteps);
  }, []);

  // Function để update cycle start date
  const updateCycleStartDate = useCallback(
    async (newDate: string): Promise<void> => {
      if (!treatmentPlan) {
        message.error("Không tìm thấy kế hoạch điều trị");
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const res = await axiosInstance.patch(
          `${BASE_URL}/api/treatment-plan/${treatmentPlan._id}/cycle-start-date`,
          { cycleStartDate: newDate },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          message.success("Cập nhật ngày bắt đầu chu kỳ thành công!");
          setTreatmentPlan((prev) =>
            prev ? { ...prev, cycleStartDate: newDate } : prev
          );
          return Promise.resolve();
        } else {
          message.error(res.data.message || "Cập nhật thất bại");
          return Promise.reject(
            new Error(res.data.message || "Cập nhật thất bại")
          );
        }
      } catch (err: unknown) {
        console.error("Error updating cycle start date:", err);
        message.error("Có lỗi khi cập nhật ngày bắt đầu chu kỳ");
        return Promise.reject(err);
      }
    },
    [treatmentPlan]
  );

  useEffect(() => {
    fetchTreatmentPlan();
  }, [fetchTreatmentPlan]);

  return {
    treatmentPlan,
    treatmentSteps,
    loading,
    error,
    refetch: fetchTreatmentPlan,
    updateTreatmentPlan,
    updateTreatmentSteps,
    updateCycleStartDate,
  };
};
