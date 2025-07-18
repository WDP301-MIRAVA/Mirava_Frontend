import React, { useState } from "react";
import "./TestResults.css";

interface TestResult {
  patientId: string;
  patientName: string;
  testType: string;
  testDate: string;
  testResults: string;
  resultStatus: "Normal" | "Abnormal" | "Borderline";
}

const TestResults: React.FC = () => {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    testType: "",
    testDate: "",
    testResults: "",
  });

  const [submittedResult, setSubmittedResult] = useState<TestResult | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const testTypes = [
    { value: "", label: "Chọn loại xét nghiệm" },
    { value: "blood", label: "Xét nghiệm máu" },
    { value: "hormone", label: "Xét nghiệm nội tiết" },
    { value: "ultrasound", label: "Siêu âm" },
    { value: "genetic", label: "Xét nghiệm di truyền" },
    { value: "sperm", label: "Xét nghiệm tinh dịch" },
    { value: "other", label: "Khác" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const validateForm = (): boolean => {
    if (
      !formData.patientId.trim() ||
      !formData.patientName.trim() ||
      !formData.testType ||
      !formData.testDate ||
      !formData.testResults.trim()
    ) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin");
      return false;
    }
    return true;
  };

  const determineResultStatus = (
    results: string
  ): "Normal" | "Abnormal" | "Borderline" => {
    const lowerResults = results.toLowerCase();
    if (
      lowerResults.includes("bình thường") ||
      lowerResults.includes("normal") ||
      lowerResults.includes("âm tính")
    ) {
      return "Normal";
    } else if (
      lowerResults.includes("bất thường") ||
      lowerResults.includes("abnormal") ||
      lowerResults.includes("dương tính")
    ) {
      return "Abnormal";
    }
    return "Borderline";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const result: TestResult = {
        ...formData,
        resultStatus: determineResultStatus(formData.testResults),
      };

      setSubmittedResult(result);
      setIsSubmitting(false);

      // Reset form
      setFormData({
        patientId: "",
        patientName: "",
        testType: "",
        testDate: "",
        testResults: "",
      });
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "status-normal";
      case "Abnormal":
        return "status-abnormal";
      default:
        return "status-pending";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Normal":
        return "Bình thường";
      case "Abnormal":
        return "Bất thường";
      default:
        return "Chờ đánh giá";
    }
  };

  const getTestTypeLabel = (value: string) => {
    const testType = testTypes.find((type) => type.value === value);
    return testType ? testType.label : value;
  };

  return (
    <div className="test-results-container">
      <div className="test-results-card">
        <div className="header">
          <div className="header-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L13.09 8.26L19 7L17.26 13.09L23 12L21.74 18.26L18 17L19.26 23L13 21.74L12 18L11 21.74L4.74 23L6 17L2 18.26L3.26 12L9 13.09L7 7L12.91 8.26L12 2Z"
                fill="#00B4C6"
              />
            </svg>
          </div>
          <h1 className="title">Nhập Kết Quả Xét Nghiệm</h1>
          <p className="subtitle">Phòng khám Sản phụ khoa</p>
        </div>

        {errorMessage && (
          <div className="error-message">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
              <line
                x1="15"
                y1="9"
                x2="9"
                y2="15"
                stroke="#ef4444"
                strokeWidth="2"
              />
              <line
                x1="9"
                y1="9"
                x2="15"
                y2="15"
                stroke="#ef4444"
                strokeWidth="2"
              />
            </svg>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patientId" className="label">
                Mã bệnh nhân / Số điện thoại
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                placeholder="Nhập mã BN hoặc SĐT"
                className="input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="patientName" className="label">
                Tên bệnh nhân
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                placeholder="Nhập họ tên đầy đủ"
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="testType" className="label">
                Loại xét nghiệm
                <span className="required">*</span>
              </label>
              <select
                id="testType"
                name="testType"
                value={formData.testType}
                onChange={handleInputChange}
                className="select"
              >
                {testTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="testDate" className="label">
                Ngày xét nghiệm
                <span className="required">*</span>
              </label>
              <input
                type="date"
                id="testDate"
                name="testDate"
                value={formData.testDate}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="testResults" className="label">
              Kết quả xét nghiệm
              <span className="required">*</span>
            </label>
            <textarea
              id="testResults"
              name="testResults"
              value={formData.testResults}
              onChange={handleInputChange}
              placeholder="Nhập chi tiết kết quả xét nghiệm..."
              rows={6}
              className="textarea"
            />
          </div>

          <button
            type="submit"
            className={`submit-button ${isSubmitting ? "submitting" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <polyline
                    points="17,21 17,13 7,13 7,21"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <polyline
                    points="7,3 7,8 15,8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Lưu kết quả xét nghiệm
              </>
            )}
          </button>
        </form>

        {submittedResult && (
          <div className="result-box">
            <div className="result-header">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  stroke="#00B4C6"
                  strokeWidth="2"
                />
                <polyline
                  points="22,4 12,14.01 9,11.01"
                  stroke="#00B4C6"
                  strokeWidth="2"
                />
              </svg>
              <h3>Kết quả đã được lưu thành công</h3>
            </div>

            <div className="result-content">
              <div className="result-item">
                <span className="result-label">Tên bệnh nhân:</span>
                <span className="result-value">
                  {submittedResult.patientName}
                </span>
              </div>

              <div className="result-item">
                <span className="result-label">Mã bệnh nhân:</span>
                <span className="result-value">
                  {submittedResult.patientId}
                </span>
              </div>

              <div className="result-item">
                <span className="result-label">Loại xét nghiệm:</span>
                <span className="result-value">
                  {getTestTypeLabel(submittedResult.testType)}
                </span>
              </div>

              <div className="result-item">
                <span className="result-label">Ngày xét nghiệm:</span>
                <span className="result-value">
                  {new Date(submittedResult.testDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </span>
              </div>

              <div className="result-item">
                <span className="result-label">Trạng thái:</span>
                <span
                  className={`result-status ${getStatusColor(
                    submittedResult.resultStatus
                  )}`}
                >
                  {getStatusText(submittedResult.resultStatus)}
                </span>
              </div>

              <div className="result-item full-width">
                <span className="result-label">Kết quả chi tiết:</span>
                <div className="result-details">
                  {submittedResult.testResults}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResults;
