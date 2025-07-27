export interface TestResult {
  _id: string;
  testRegistration: string;
  patient: string;
  testPackage: {
    _id: string;
    name: string;
    type: string;
    tests: Array<{
      _id: string;
      testName: string;
      normalRange: string;
      unit: string;
    }>;
    duration: string;
    preparation: string;
    price: number;
  } | null;
  performedBy: {
    _id: string;
    user: {
      _id: string;
      userName: string;
    };
    degree: string;
    specialty: string;
  };
  reviewedBy?: {
    _id: string;
    user: string;
    degree: string;
    specialty: string;
  };
  testDate: string;
  results: Array<{
    testName: string;
    testCode: string;
    value: string;
    unit: string;
    normalRange: string;
    status: "normal" | "abnormal" | "borderline";
    notes?: string;
    _id: string;
  }>;
  overallStatus: "normal" | "abnormal" | "requires_attention";
  doctorNotes: string;
  recommendations: string;
  attachments: Array<{
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
  }>;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}
