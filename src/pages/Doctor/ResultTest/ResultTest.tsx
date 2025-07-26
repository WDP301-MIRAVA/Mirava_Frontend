import React, { useState, useEffect } from "react";
import axiosInstance from "../../../services/MainService";
import ResultDetailModal from "./ResultDetailModal";
import "./ResultTest.css";

// API Base URL
const BASE_URL = "https://mirava-f0rz.onrender.com";

interface TestResultDetail {
  testName: string;
  testCode: string;
  value: string;
  unit: string;
  normalRange: string;
  status: "normal" | "abnormal" | "borderline";
  notes?: string;
}

interface TestRegistration {
  _id: string;
  patient: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
    patientCode: string;
  };
  testPackage: {
    _id: string;
    name: string;
    type: string;
    tests: Array<{
      _id: string;
      testName: string;
      testCode: string;
      normalRange: string;
      unit: string;
    }>;
  };
  status: string;
  requestedDate: string;
}

interface DoctorTestResult {
  _id: string;
  patient: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
    patientCode: string;
  };
  testPackage: {
    _id: string;
    name: string;
    type: string;
  } | null;
  testDate: string;
  overallStatus: string;
  results: TestResultDetail[];
  doctorNotes: string;
  recommendations: string;
  attachments?: string[];
}

interface FormData {
  testRegistrationId: string;
  patientInfo: {
    id: string;
    name: string;
    phone: string;
    patientCode: string;
  } | null;
  testPackageInfo: {
    id: string;
    name: string;
    type: string;
    tests: Array<{
      _id: string;
      testName: string;
      testCode: string;
      normalRange: string;
      unit: string;
    }>;
  } | null;
  testDate: string;
  overallStatus: "normal" | "abnormal" | "requires_attention";
  doctorNotes: string;
  recommendations: string;
  attachments: string[];
  testResults: TestResultDetail[];
  nextAppointment: string;
}

const TestResults: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    testRegistrationId: "",
    patientInfo: null,
    testPackageInfo: null,
    testDate: "",
    overallStatus: "requires_attention",
    doctorNotes: "",
    recommendations: "",
    testResults: [],
    attachments: [],
    nextAppointment: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] =
    useState<DoctorTestResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "info"
  >("success");
  const [activeStep, setActiveStep] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Tab chuyển đổi
  const [viewMode, setViewMode] = useState<"registrations" | "results">(
    "registrations"
  );

  // States for test registrations
  const [testRegistrations, setTestRegistrations] = useState<
    TestRegistration[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [files, setFiles] = useState<File[]>([]);

  // States cho kết quả xét nghiệm của bác sĩ
  const [doctorTestResults, setDoctorTestResults] = useState<
    DoctorTestResult[]
  >([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  // xem chi tiết
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const steps = [
    "Chọn đăng ký xét nghiệm",
    "Nhập kết quả xét nghiệm",
    "Nhận xét và khuyến nghị",
    "Xác nhận",
  ];

  // Lấy danh sách đăng ký xét nghiệm của bác sĩ
  const fetchTestRegistrations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get(
        `${BASE_URL}/api/test-results/doctor/test-registrations`,
        {
          params: {
            search: searchQuery,
            status: statusFilter || undefined,
            page: currentPage,
            limit: 10,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTestRegistrations(response.data.data);
        setTotalPages(response.data.totalPages);
      } else {
        setTestRegistrations([]);
        setTotalPages(1);
      }
    } catch (error) {
      setTestRegistrations([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy danh sách kết quả xét nghiệm của bác sĩ
  const fetchDoctorTestResults = async () => {
    setIsLoadingResults(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get(
        `${BASE_URL}/api/test-results/doctor/my-results`,
        {
          params: {
            status: statusFilter || undefined,
            page: currentPage,
            limit: 10,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setDoctorTestResults(response.data.data);
        setTotalPages(response.data.totalPages);
      } else {
        setDoctorTestResults([]);
        setTotalPages(1);
      }
    } catch (error) {
      setDoctorTestResults([]);
      setTotalPages(1);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Debounced search cho tab đăng ký
  useEffect(() => {
    if (viewMode === "registrations") {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchTestRegistrations();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, statusFilter, viewMode]);

  // Fetch khi chuyển trang hoặc chuyển tab
  useEffect(() => {
    if (viewMode === "registrations") {
      fetchTestRegistrations();
    } else {
      fetchDoctorTestResults();
    }
  }, [currentPage, viewMode, statusFilter]);

  // Initial load
  useEffect(() => {
    if (viewMode === "registrations") {
      fetchTestRegistrations();
    } else {
      fetchDoctorTestResults();
    }
  }, []);

  // Chọn đăng ký xét nghiệm
  const handleSelectRegistration = (registration: TestRegistration) => {
    setFormData((prev) => ({
      ...prev,
      testRegistrationId: registration._id,
      patientInfo: {
        id: registration.patient._id,
        name: registration.patient.userName,
        phone: registration.patient.phone,
        patientCode: registration.patient.patientCode,
      },
      testPackageInfo: {
        id: registration.testPackage._id,
        name: registration.testPackage.name,
        type: registration.testPackage.type,
        tests: registration.testPackage.tests,
      },
      testDate: new Date().toISOString().split("T")[0],
      testResults: registration.testPackage.tests.map((test) => ({
        testName: test.testName,
        testCode: test.testCode,
        value: "",
        unit: test.unit,
        normalRange: test.normalRange,
        status: "normal" as const,
        notes: "",
      })),
      attachments: [],
    }));
    setFiles([]);
    setErrorMessage("");
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleTestResultChange = (
    index: number,
    field: keyof TestResultDetail,
    value: any
  ) => {
    const updatedResults = [...formData.testResults];
    updatedResults[index] = {
      ...updatedResults[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      testResults: updatedResults,
    }));
  };

  const addTestResult = () => {
    const newResult: TestResultDetail = {
      testName: "",
      testCode: "",
      value: "",
      unit: "",
      normalRange: "",
      status: "normal",
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      testResults: [...prev.testResults, newResult],
    }));
  };

  const removeTestResult = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      testResults: prev.testResults.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.testRegistrationId) {
      setErrorMessage("Vui lòng chọn đăng ký xét nghiệm");
      return false;
    }

    if (!formData.testDate || !formData.doctorNotes.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }

    if (formData.testResults.length === 0) {
      setErrorMessage("Vui lòng thêm ít nhất một kết quả xét nghiệm");
      return false;
    }

    for (const result of formData.testResults) {
      if (!result.testName.trim() || !result.value.trim()) {
        setErrorMessage(
          "Vui lòng điền đầy đủ thông tin cho tất cả các xét nghiệm"
        );
        return false;
      }
    }

    return true;
  };
  const handleViewDetails = async (resultId: string) => {
    try {
      const res = await axiosInstance.get(`/api/test-results/${resultId}`);
      setSelectedResult(res.data.data);
      setOpenModal(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết:", err);
    }
  };

  const handleSubmit = async () => {
    console.log("Files gửi lên:", files);
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formDataToSend = new FormData();
      formDataToSend.append("testRegistrationId", formData.testRegistrationId);
      formDataToSend.append(
        "testDate",
        new Date(formData.testDate).toISOString()
      );
      formDataToSend.append("results", JSON.stringify(formData.testResults));
      formDataToSend.append("overallStatus", formData.overallStatus.trim());
      formDataToSend.append("doctorNotes", formData.doctorNotes);
      formDataToSend.append("recommendations", formData.recommendations);

      // Gửi file lên backend
      files.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      const response = await axiosInstance.post(
        `${BASE_URL}/api/test-results/create`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSubmittedResult(response.data.data);
        setNotificationMessage("Kết quả xét nghiệm đã được tạo thành công!");
        setNotificationType("success");
        setShowNotification(true);
        setActiveStep(0);

        // Reset form và cập nhật attachments từ backend (Cloudinary)
        setFormData({
          testRegistrationId: "",
          patientInfo: null,
          testPackageInfo: null,
          testDate: "",
          overallStatus: "requires_attention",
          doctorNotes: "",
          recommendations: "",
          testResults: [],
          attachments: response.data.data.attachments || [],
          nextAppointment: "",
        });

        setFiles([]);
        fetchTestRegistrations();
      } else {
        throw new Error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi tạo kết quả";
      setNotificationMessage(errorMsg);
      setNotificationType("error");
      setShowNotification(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.testRegistrationId) {
        setErrorMessage("Vui lòng chọn đăng ký xét nghiệm");
        return;
      }
    }

    if (activeStep === 1) {
      if (formData.testResults.length === 0) {
        setErrorMessage("Vui lòng thêm ít nhất một kết quả xét nghiệm");
        return;
      }
    }

    setErrorMessage("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "Bình thường";
      case "abnormal":
        return "Bất thường";
      case "borderline":
        return "Cận biên";
      case "requires_attention":
        return "Cần theo dõi";
      case "confirmed":
        return "Đã xác nhận";
      case "completed":
        return "Hoàn thành";
      default:
        return "Chưa xác định";
    }
  };

  const calculateAbnormalCount = () => {
    return formData.testResults.filter((result) => result.status === "abnormal")
      .length;
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Hiển thị nội dung từng bước hoặc tab
  const renderStepContent = (step: number) => {
    if (viewMode === "results") {
      return (
        <div className="rt-step-content">
          <h3>Danh sách kết quả xét nghiệm đã tạo</h3>
          <div className="rt-controls">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rt-filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="normal">Bình thường</option>
              <option value="abnormal">Bất thường</option>
              <option value="requires_attention">Cần theo dõi</option>
            </select>
            <button className="rt-refresh-btn" onClick={fetchDoctorTestResults}>
              🔄 Làm mới
            </button>
          </div>
          {isLoadingResults ? (
            <div className="rt-loading">
              <div className="rt-loading-spinner"></div>
              <p>Đang tải kết quả...</p>
            </div>
          ) : doctorTestResults.length === 0 ? (
            <div className="rt-no-data">
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
              <p>Không có kết quả xét nghiệm nào</p>
            </div>
          ) : (
            <div className="rt-table-container">
              <div className="rt-table-wrapper">
                <table className="rt-table">
                  <thead>
                    <tr>
                      <th>Bệnh nhân</th>
                      <th>Mã BN</th>
                      <th>Gói xét nghiệm</th>
                      <th>Ngày xét nghiệm</th>
                      <th>Tình trạng</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorTestResults.map((result) => (
                      <tr key={result._id}>
                        <td>{result.patient?.userName}</td>
                        <td>{result.patient?.patientCode}</td>
                        <td>{result.testPackage?.name || "Không xác định"}</td>
                        <td>{formatDateForDisplay(result.testDate)}</td>
                        <td>
                          <span
                            className={`rt-status rt-status-${result.overallStatus}`}
                          >
                            {getStatusText(result.overallStatus)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="rt-action-btn rt-select-btn"
                            onClick={() => handleViewDetails(result._id)}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="rt-pagination">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={`rt-page-btn ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Tab đăng ký xét nghiệm (mặc định)
    switch (step) {
      case 0:
        return (
          <div className="rt-step-content">
            <h3>Danh sách đăng ký xét nghiệm</h3>
            <div className="rt-controls">
              <div className="rt-search-box">
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
                  placeholder="Tìm kiếm theo tên, mã bệnh nhân hoặc số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rt-filter-select"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Hoàn thành</option>
              </select>
              <button
                className="rt-refresh-btn"
                onClick={fetchTestRegistrations}
              >
                🔄 Làm mới
              </button>
            </div>
            {isLoading ? (
              <div className="rt-loading">
                <div className="rt-loading-spinner"></div>
                <p>Đang tải danh sách đăng ký...</p>
              </div>
            ) : testRegistrations.length === 0 ? (
              <div className="rt-no-data">
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
                <p>Không có đăng ký xét nghiệm nào</p>
              </div>
            ) : (
              <div className="rt-table-container">
                <div className="rt-table-wrapper">
                  <table className="rt-table">
                    <thead>
                      <tr>
                        <th>Bệnh nhân</th>
                        <th>Mã BN</th>
                        <th>Gói xét nghiệm</th>
                        <th>Ngày đăng ký</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testRegistrations.map((registration) => (
                        <tr key={registration._id}>
                          <td>{registration.patient.userName}</td>
                          <td>
                            <div className="rt-patient-code">
                              {registration.patient.patientCode}
                            </div>
                          </td>
                          <td>{registration.testPackage.name}</td>
                          <td>
                            {formatDateForDisplay(registration.requestedDate)}
                          </td>
                          <td>
                            <span
                              className={`rt-status rt-status-${registration.status}`}
                            >
                              {getStatusText(registration.status)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="rt-action-btn rt-select-btn"
                              onClick={() =>
                                handleSelectRegistration(registration)
                              }
                              disabled={registration.status === "completed"}
                            >
                              {registration.status === "completed"
                                ? "Đã có KQ"
                                : "Chọn"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="rt-pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          className={`rt-page-btn ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
            {formData.patientInfo && (
              <div className="rt-selected-info">
                <h4>Đã chọn:</h4>
                <div className="rt-selected-details">
                  <div className="rt-detail-item">
                    <strong>Bệnh nhân:</strong> {formData.patientInfo.name}
                  </div>
                  <div className="rt-detail-item">
                    <strong>Mã BN:</strong> {formData.patientInfo.patientCode}
                  </div>
                  <div className="rt-detail-item">
                    <strong>SĐT:</strong> {formData.patientInfo.phone}
                  </div>
                  <div className="rt-detail-item">
                    <strong>Gói XN:</strong> {formData.testPackageInfo?.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      // Các bước còn lại giữ nguyên như cũ
      case 1:
      case 2:
      case 3:
        // ...giữ nguyên code cũ...
        // Copy lại các bước 1, 2, 3 như bạn đã có
        // Không thay đổi logic
        return (
          // ...existing code...
          <>
            {step === 1 && (
              <div className="rt-step-content">
                <div className="rt-form-group">
                  <label className="rt-form-label">
                    Ngày thực hiện xét nghiệm *
                  </label>
                  <input
                    type="date"
                    className="rt-form-input"
                    value={formData.testDate}
                    onChange={(e) =>
                      handleInputChange("testDate", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="rt-section-header">
                  <h3>Chi tiết kết quả xét nghiệm</h3>
                  <button className="rt-add-btn" onClick={addTestResult}>
                    ➕ Thêm xét nghiệm
                  </button>
                </div>
                {formData.testResults.length === 0 ? (
                  <div className="rt-no-data">
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
                    <p>Chưa có kết quả xét nghiệm</p>
                    <p>Nhấn "Thêm xét nghiệm" để bắt đầu nhập kết quả</p>
                  </div>
                ) : (
                  <div className="rt-table-container">
                    <div className="rt-table-wrapper">
                      <table className="rt-table rt-results-table">
                        <thead>
                          <tr>
                            <th>Tên xét nghiệm</th>
                            <th>Mã XN</th>
                            <th>Giá trị</th>
                            <th>Đơn vị</th>
                            <th>Khoảng bình thường</th>
                            <th>Trạng thái</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.testResults.map((result, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  className="rt-table-input"
                                  value={result.testName}
                                  onChange={(e) =>
                                    handleTestResultChange(
                                      index,
                                      "testName",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Tên xét nghiệm"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="rt-table-input"
                                  value={result.testCode}
                                  onChange={(e) =>
                                    handleTestResultChange(
                                      index,
                                      "testCode",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Mã XN"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="rt-table-input"
                                  value={result.value}
                                  onChange={(e) =>
                                    handleTestResultChange(
                                      index,
                                      "value",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Giá trị"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="rt-table-input"
                                  value={result.unit}
                                  onChange={(e) =>
                                    handleTestResultChange(
                                      index,
                                      "unit",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Đơn vị"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="rt-table-input"
                                  value={result.normalRange}
                                  onChange={(e) =>
                                    handleTestResultChange(
                                      index,
                                      "normalRange",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Khoảng bình thường"
                                />
                              </td>
                              <td>
                                <select
                                  className="rt-table-select"
                                  value={result.status}
                                  onChange={(e) =>
                                    handleTestResultChange(
                                      index,
                                      "status",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="normal">Bình thường</option>
                                  <option value="abnormal">Bất thường</option>
                                  <option value="borderline">Cận biên</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="rt-table-input"
                                  value={result.notes || ""}
                                  onChange={(e) =>
                                    handleTestResultChange(
                                      index,
                                      "notes",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ghi chú"
                                />
                              </td>
                              <td>
                                <button
                                  className="rt-action-btn rt-delete-btn"
                                  onClick={() => removeTestResult(index)}
                                  title="Xóa"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            {step === 2 && (
              <div className="rt-step-content">
                <div className="rt-form-grid">
                  <div className="rt-form-group">
                    <label className="rt-form-label">
                      File đính kèm (ảnh, PDF...)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files)
                          setFiles(Array.from(e.target.files));
                      }}
                      className="rt-form-input"
                    />
                    <div style={{ marginTop: 8 }}>
                      {formData.attachments.map((url, idx) => (
                        <div key={idx} style={{ marginBottom: 4 }}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {`File đính kèm ${idx + 1}`}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rt-form-group">
                    <label className="rt-form-label">
                      Tình trạng tổng quát *
                    </label>
                    <select
                      className="rt-form-select"
                      value={formData.overallStatus}
                      onChange={(e) =>
                        handleInputChange("overallStatus", e.target.value)
                      }
                    >
                      <option value="normal">Bình thường</option>
                      <option value="abnormal">Bất thường</option>
                      <option value="requires_attention">Cần theo dõi</option>
                    </select>
                  </div>
                </div>
                <div className="rt-form-group">
                  <label className="rt-form-label">Nhận xét của bác sĩ *</label>
                  <textarea
                    className="rt-form-textarea"
                    rows={4}
                    value={formData.doctorNotes}
                    onChange={(e) =>
                      handleInputChange("doctorNotes", e.target.value)
                    }
                    placeholder="Nhập nhận xét, chẩn đoán và đánh giá kết quả..."
                    required
                  />
                </div>
                <div className="rt-form-group">
                  <label className="rt-form-label">Khuyến nghị điều trị</label>
                  <textarea
                    className="rt-form-textarea"
                    rows={3}
                    value={formData.recommendations}
                    onChange={(e) =>
                      handleInputChange("recommendations", e.target.value)
                    }
                    placeholder="Nhập khuyến nghị điều trị, thuốc, chế độ sinh hoạt..."
                  />
                </div>
                <div className="rt-form-group">
                  <label className="rt-form-label">
                    Lịch hẹn tái khám (nếu có)
                  </label>
                  <input
                    type="date"
                    className="rt-form-input"
                    value={formData.nextAppointment}
                    onChange={(e) =>
                      handleInputChange("nextAppointment", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="rt-step-content">
                <h3>Xác nhận thông tin kết quả xét nghiệm</h3>
                <div className="rt-confirmation-section">
                  <div className="rt-section-title">Thông tin bệnh nhân</div>
                  <div className="rt-info-grid">
                    <div className="rt-info-item">
                      <span className="rt-info-label">Mã bệnh nhân:</span>
                      <span className="rt-info-value">
                        {formData.patientInfo?.patientCode}
                      </span>
                    </div>
                    <div className="rt-info-item">
                      <span className="rt-info-label">Tên bệnh nhân:</span>
                      <span className="rt-info-value">
                        {formData.patientInfo?.name}
                      </span>
                    </div>
                    <div className="rt-info-item">
                      <span className="rt-info-label">Gói xét nghiệm:</span>
                      <span className="rt-info-value">
                        {formData.testPackageInfo?.name}
                      </span>
                    </div>
                    <div className="rt-info-item">
                      <span className="rt-info-label">Ngày xét nghiệm:</span>
                      <span className="rt-info-value">
                        {formatDateForDisplay(formData.testDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rt-confirmation-section">
                  <div className="rt-section-title">
                    Kết quả chi tiết ({formData.testResults.length} xét nghiệm)
                    {calculateAbnormalCount() > 0 && (
                      <span className="rt-abnormal-count">
                        {calculateAbnormalCount()} bất thường
                      </span>
                    )}
                  </div>
                  <div className="rt-table-container">
                    <div className="rt-table-wrapper">
                      <table className="rt-table rt-summary-table">
                        <thead>
                          <tr>
                            <th>Tên xét nghiệm</th>
                            <th>Mã XN</th>
                            <th>Giá trị</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.testResults.map((result, index) => (
                            <tr key={index}>
                              <td>{result.testName}</td>
                              <td>{result.testCode}</td>
                              <td>
                                {result.value} {result.unit}
                              </td>
                              <td>
                                <span
                                  className={`rt-status rt-status-${result.status}`}
                                >
                                  {getStatusText(result.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="rt-confirmation-section">
                  <div className="rt-section-title">
                    Nhận xét và khuyến nghị
                  </div>
                  <div className="rt-info-grid">
                    <div className="rt-info-item rt-full-width">
                      <span className="rt-info-label">
                        Tình trạng tổng quát:
                      </span>
                      <span
                        className={`rt-status rt-status-${formData.overallStatus}`}
                      >
                        {getStatusText(formData.overallStatus)}
                      </span>
                    </div>
                    <div className="rt-info-item rt-full-width">
                      <span className="rt-info-label">
                        Nhận xét của bác sĩ:
                      </span>
                      <span className="rt-info-value">
                        {formData.doctorNotes}
                      </span>
                    </div>
                    {formData.recommendations && (
                      <div className="rt-info-item rt-full-width">
                        <span className="rt-info-label">
                          Khuyến nghị điều trị:
                        </span>
                        <span className="rt-info-value">
                          {formData.recommendations}
                        </span>
                      </div>
                    )}
                    {formData.nextAppointment && (
                      <div className="rt-info-item rt-full-width">
                        <span className="rt-info-label">
                          Lịch hẹn tái khám:
                        </span>
                        <span className="rt-info-value">
                          {formatDateForDisplay(formData.nextAppointment)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rt-container">
      {/* Header */}
      <div className="rt-header">
        <div className="rt-header-content">
          <div className="rt-header-info">
            <h1 className="rt-title">Tạo Kết Quả Xét Nghiệm</h1>
            <p className="rt-subtitle">
              Hệ thống quản lý điều trị hiếm muộn MIRAVA
            </p>
          </div>
          <div className="rt-progress-bar">
            <div
              className="rt-progress-fill"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tab chuyển đổi */}
      <div className="rt-tabs">
        <button
          className={`rt-tab-btn ${
            viewMode === "registrations" ? "active" : ""
          }`}
          onClick={() => setViewMode("registrations")}
        >
          Đăng ký xét nghiệm
        </button>
        <button
          className={`rt-tab-btn ${viewMode === "results" ? "active" : ""}`}
          onClick={() => setViewMode("results")}
        >
          Kết quả đã tạo
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rt-error-message">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* Steps */}
      <div className="rt-steps-container">
        <div className="rt-steps">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`rt-step ${index <= activeStep ? "active" : ""} ${
                index === activeStep ? "current" : ""
              }`}
            >
              <div className="rt-step-number">{index + 1}</div>
              <div className="rt-step-title">{step}</div>
            </div>
          ))}
        </div>

        <div className="rt-step-content-container">
          {renderStepContent(activeStep)}

          {viewMode === "registrations" && (
            <div className="rt-step-actions">
              <button
                className="rt-btn rt-btn-primary"
                onClick={
                  activeStep === steps.length - 1 ? handleSubmit : handleNext
                }
                disabled={isSubmitting}
              >
                {activeStep === steps.length - 1
                  ? isSubmitting
                    ? "Đang tạo..."
                    : "💾 Tạo kết quả"
                  : "Tiếp theo"}
              </button>
              <button
                className="rt-btn rt-btn-secondary"
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Quay lại
              </button>
              {activeStep === steps.length - 1 && (
                <button
                  className="rt-btn rt-btn-outline"
                  onClick={() => setShowPreviewModal(true)}
                >
                  🖨️ Xem trước
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Result */}
      {submittedResult && (
        <div className="rt-success-container">
          <div className="rt-success-header">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
            <h2>Kết quả xét nghiệm đã được tạo thành công!</h2>
          </div>
          <div className="rt-success-details">
            <div className="rt-detail-item">
              <strong>Bệnh nhân:</strong> {submittedResult.patient?.userName}
            </div>
            <div className="rt-detail-item">
              <strong>Gói xét nghiệm:</strong>{" "}
              {submittedResult.testPackage?.name}
            </div>
            <div className="rt-detail-item">
              <strong>Số lượng xét nghiệm:</strong>{" "}
              {submittedResult.results?.length || 0}
            </div>
            <div className="rt-detail-item">
              <strong>Tình trạng:</strong>
              <span
                className={`rt-status rt-status-${submittedResult.overallStatus}`}
              >
                {getStatusText(submittedResult.overallStatus)}
              </span>
            </div>
          </div>
          <div className="rt-success-actions">
            <button
              className="rt-btn rt-btn-primary"
              onClick={() => {
                setSubmittedResult(null);
                setActiveStep(0);
              }}
            >
              ➕ Tạo kết quả mới
            </button>
            <button
              className="rt-btn rt-btn-outline"
              onClick={() => setShowPreviewModal(true)}
            >
              🖨️ In kết quả
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div
          className="rt-modal-overlay"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="rt-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rt-modal-header">
              <h2>🖨️ Xem trước kết quả xét nghiệm</h2>
              <button
                className="rt-close-button"
                onClick={() => setShowPreviewModal(false)}
              >
                ✖
              </button>
            </div>
            <div className="rt-modal-body">
              <p>
                Chức năng xem trước sẽ hiển thị định dạng in của kết quả xét
                nghiệm
              </p>
            </div>
            <div className="rt-modal-actions">
              <button
                className="rt-btn rt-btn-secondary"
                onClick={() => setShowPreviewModal(false)}
              >
                Đóng
              </button>
              <button
                className="rt-btn rt-btn-primary"
                onClick={() => window.print()}
              >
                🖨️ In ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {showNotification && (
        <div className={`rt-notification rt-notification-${notificationType}`}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {notificationType === "success" && (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            )}
            {notificationType === "error" && <circle cx="12" cy="12" r="10" />}
          </svg>
          {notificationMessage}
          <button
            className="rt-notification-close"
            onClick={() => setShowNotification(false)}
          >
            ✖
          </button>
        </div>
      )}
      {submittedResult &&
        submittedResult.attachments &&
        submittedResult.attachments.length > 0 && (
          <div className="rt-success-attachments">
            <h4>File đính kèm:</h4>
            {submittedResult.attachments.map((file, idx) => (
              <div key={idx}>
                <a href={file} target="_blank" rel="noopener noreferrer">
                  {`File đính kèm ${idx + 1}`}
                </a>
              </div>
            ))}
          </div>
        )}
      <ResultDetailModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        result={selectedResult}
      />
    </div>
  );
};

export default TestResults;
