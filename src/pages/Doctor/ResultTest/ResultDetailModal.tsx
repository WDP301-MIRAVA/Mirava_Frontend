import React from "react";
import { useEffect } from "react";
import "./ResultTest.css";
interface TestResultDetail {
  testName: string;
  testCode: string;
  value: string;
  unit: string;
  normalRange: string;
  status: "normal" | "abnormal" | "borderline";
  notes?: string;
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

interface ResultDetailModalProps {
  open: boolean;
  onClose: () => void;
  result: DoctorTestResult | null;
}

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

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const ResultDetailModal: React.FC<ResultDetailModalProps> = ({
  open,
  onClose,
  result,
}) => {
  useEffect(() => {
    if (open) {
      document.body.classList.add("body-modal-open");
    } else {
      document.body.classList.remove("body-modal-open");
    }
    // Cleanup khi unmount
    return () => {
      document.body.classList.remove("body-modal-open");
    };
  }, [open]);

  if (!open || !result) return null;

  return (
    <div className="rt-modal-overlay" onClick={onClose}>
      <div
        className="rt-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 700, width: "100%" }}
      >
        <div className="rt-modal-header">
          <h2>Chi tiết kết quả xét nghiệm</h2>
          <button className="rt-close-button" onClick={onClose}>
            ✖
          </button>
        </div>
        <div className="rt-modal-body">
          <div className="rt-info-grid">
            <div className="rt-info-item">
              <span className="rt-info-label">Tên bệnh nhân:</span>
              <span className="rt-info-value">{result.patient?.userName}</span>
            </div>
            <div className="rt-info-item">
              <span className="rt-info-label">Mã BN:</span>
              <span className="rt-info-value">
                {result.patient?.patientCode}
              </span>
            </div>
            <div className="rt-info-item">
              <span className="rt-info-label">Gói xét nghiệm:</span>
              <span className="rt-info-value">{result.testPackage?.name}</span>
            </div>
            <div className="rt-info-item">
              <span className="rt-info-label">Ngày xét nghiệm:</span>
              <span className="rt-info-value">
                {formatDate(result.testDate)}
              </span>
            </div>
            <div className="rt-info-item">
              <span className="rt-info-label">Tình trạng tổng quát:</span>
              <span className={`rt-status rt-status-${result.overallStatus}`}>
                {getStatusText(result.overallStatus)}
              </span>
            </div>
          </div>

          <div style={{ margin: "16px 0" }}>
            <h4>Chi tiết các xét nghiệm</h4>
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
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.testName}</td>
                        <td>{item.testCode}</td>
                        <td>{item.value}</td>
                        <td>{item.unit}</td>
                        <td>{item.normalRange}</td>
                        <td>
                          <span
                            className={`rt-status rt-status-${item.status}`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </td>
                        <td>{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ margin: "16px 0" }}>
            <div>
              <strong>Nhận xét của bác sĩ:</strong>
              <div style={{ marginBottom: 8 }}>
                {result.doctorNotes || "Không có"}
              </div>
              {result.recommendations && (
                <>
                  <strong>Khuyến nghị:</strong>
                  <div>{result.recommendations}</div>
                </>
              )}
            </div>
          </div>

          {result.attachments && result.attachments.length > 0 && (
            <div style={{ margin: "16px 0" }}>
              <h4>File đính kèm</h4>
              <div className="attachments-grid">
                {result.attachments.map((url, idx) => (
                  <div className="attachment-img-wrapper" key={idx}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`File đính kèm ${idx + 1}`}
                        className="attachment-image"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="rt-modal-actions">
          <button className="rt-btn rt-btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailModal;
