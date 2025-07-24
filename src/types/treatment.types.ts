export interface TreatmentStep {
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
  medicalRecords?: MedicalRecord[] | string[];
  serviceId?: string;
}

export interface MedicalRecord {
  date: string;
  type: string;
  title: string;
  findings: string;
  conclusion: string;
  attachments: string[];
  notes: string;
}

export interface FormData {
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
  medicalRecords?: MedicalRecord[] | string[];
  medicalNotes?: string;
}

export interface TreatmentPlan {
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
    _id?: string;
    stage: string;
    title: string;
    description: string;
    type: string;
    status: string;
    scheduledDates: string[];
    medicalRecords: unknown[];
  }>;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordModalState {
  open: boolean;
  step: TreatmentStep | null;
  medicalRecord?: MedicalRecord | null;
}
export type StatusType = "pending" | "completed" | "in-progress";
export type CategoryType = "Tư vấn" | "Lab" | "Thủ thuật" | "Kiểm tra";
export type FilterType = "all" | StatusType;