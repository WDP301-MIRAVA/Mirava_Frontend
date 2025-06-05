import axios from "axios";
import { BASE_URL } from "./config";

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
  day: number;
  type: string;
  notes: string;
  _id: string;
}

export interface OvarianStimulation {
  startDay: number;
  durationDays: number;
  medication: string;
  dailyDosage: string;
  monitoringSchedule: MonitoringSchedule[];
}

export interface HcgInjection {
  plannedDate: string;
  medication: string;
  dosage: string;
}

export interface EggRetrieval {
  plannedDate: string;
  notes: string;
}

export interface EmbryoTransfer {
  plannedDate: string;
  embryoStage: string;
}

export interface PostTransferMonitoring {
  betaHcgTestDate: string;
  ultrasoundCheckDate: string;
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
    axios.get<TreatmentPlanResponse>(`${BASE_URL}/api/treatment-plan/patient/${patientId}`, {
      headers: { "Content-Type": "application/json" },
    }),



  // Lấy chi tiết kế hoạch điều trị theo ID
  getTreatmentPlanById: (treatmentPlanId: string) =>
    axios.get<TreatmentPlanResponse>(`${BASE_URL}/api/treatment-plan/${treatmentPlanId}`, {
      headers: { "Content-Type": "application/json" },
    }),
};