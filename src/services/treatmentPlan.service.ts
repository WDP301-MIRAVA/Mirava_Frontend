import axiosInstance from "./MainService";

// Types
export interface User {
  _id: string;
  userName: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  _id: string;
  user: User;
  degree: string;
  specialty: string;
  workSchedule: string[];
  description: string;
  imageUrl: string;
  rating: number;
  feedbacks: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringSchedule {
  _id: string;
  day: number;
  type: string;
  notes: string;
  instructions?: string;
  time?: string;
}

export interface OvarianStimulation {
  startDay: number;
  durationDays: number;
  medication: string;
  dailyDosage: string;
  instructions: string;
  time: string;
  monitoringSchedule: MonitoringSchedule[];
}

export interface HcgInjection {
  plannedDate: string;
  medication: string;
  dosage: string;
  instructions?: string;
  time?: string;
}

export interface EggRetrieval {
  plannedDate: string;
  notes: string;
  instructions?: string;
  time?: string;
}

export interface EmbryoTransfer {
  plannedDate: string;
  embryoStage: string;
  instructions?: string;
  time?: string;
}

export interface PostTransferMonitoring {
  betaHcgTestDate: string; // Ngày kiểm tra beta HCG
  betaHcgTestInstructions?: string; // Hướng dẫn kiểm tra beta HCG
  betaHcgTestTime?: string; // Thời gian kiểm tra beta HCG
  ultrasoundCheckDate: string; // Ngày kiểm tra siêu âm
  ultrasoundCheckInstructions?: string; // Hướng dẫn kiểm tra siêu âm
  ultrasoundCheckTime?: string; // Thời gian kiểm tra siêu âm
}

export interface Reminder {
  type: string;
  content: string;
  sendTime: string;
  sent: boolean;
  _id: string;
}

export interface TreatmentPlan {
  _id: string;
  patient: string;
  doctor: Doctor;
  cycleStartDate: string;
  ovarianStimulation: OvarianStimulation;
  hcgInjection: HcgInjection;
  eggRetrieval: EggRetrieval;
  embryoTransfer: EmbryoTransfer;
  postTransferMonitoring: PostTransferMonitoring;
  reminders: Reminder[];
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TreatmentPlanResponse {
  success: boolean;
  count: number;
  data: TreatmentPlan[];
}

export const TreatmentPlanService = {
  // Lấy kế hoạch điều trị của bệnh nhân theo patientId
  getTreatmentPlanByPatientId: (patientId: string) =>
    axiosInstance.get(`/api/treatment-plan/patient/${patientId}`),

  // Lấy chi tiết kế hoạch điều trị theo ID
  getTreatmentPlanById: (treatmentPlanId: string) =>
    axiosInstance.get(`/api/treatment-plan/${treatmentPlanId}`),
  // cập nhật kế hoạch điều trị instructions và time
  updateTreatmentPlan: (
    treatmentPlanId: string,
    data: Partial<TreatmentPlan>
  ) =>
    axiosInstance.patch(
      `/api/treatment-plan/${treatmentPlanId}/instructions`,
      data
    ),
};
