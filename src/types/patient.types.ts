export interface TreatmentEvent {
  id: string;
  type: string;
  date: string;
  description?: string;
  status: string;
  result?: string;
}

export interface Patient {
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
  treatmentEvents?: TreatmentEvent[];
}

export interface RawPlan {
  patient: {
    _id: string;
    userName: string;
    email?: string;
    phone?: string;
    address?: string;
    gender?: string;
    patientCode?: string;
  };
  doctor?: {
    user?: {
      userName: string;
    };
    specialty?: string;
  };
  status?: "planned" | "in_progress" | "completed" | "cancelled";
  cycleStartDate?: string;
  hcgInjection?: {
    time?: string;
  };
  notes?: string;
  treatmentEvents?: TreatmentEvent[];
}
