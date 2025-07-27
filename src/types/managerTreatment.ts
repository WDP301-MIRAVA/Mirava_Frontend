export interface Patient {
  _id: string;
  userName: string;
  email: string;
  phone: string;
  patientCode: string;
  gender: string;
  address: string;
  treatmentPlans?: TreatmentPlan[];
}

export interface Doctor {
  _id: string;
  user: {
    userName: string;
  };
  specialty: string;
}

export interface MedicalRecord {
  _id: string;
  type: string;
  content: string;
  date: string;
}

export interface TreatmentEvent {
  _id: string;
  stage: string;
  title: string;
  description: string;
  type: string;
  status: string;
  scheduledDates: string[];
  executionDate: string | null;
  performedBy: string;
  medicalRecords: MedicalRecord[];
}

export interface TreatmentPlan {
  _id: string;
  patient: Patient;
  doctor: Doctor;
  treatmentType: string;
  cycleStartDate: string;
  status: string;
  treatmentEvents: TreatmentEvent[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  pausedPlans: number;
  totalPatients: number;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
