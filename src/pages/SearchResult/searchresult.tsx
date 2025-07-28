import React, { useState } from "react";
import axiosInstance from "../../services/MainService";
import "./searchresult.css"; // Import your CSS styles

const SearchResultPage: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/api/search-result`, {
        params: { keyword },
      });
      if (res.data.success) {
        setTestResults(res.data.data.testResults);
        setMedicalRecords(res.data.data.medicalRecords);
      } else {
        setError(res.data.message || "Không tìm thấy kết quả");
      }
    } catch (err: any) {
      setError("Có lỗi xảy ra khi tra cứu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-result-container">
      <h2 className="sr-title">Tra cứu kết quả</h2>
      <div className="sr-search-bar">
        <input
          type="text"
          placeholder="Nhập mã BN, tên hoặc SĐT"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="sr-input"
        />
        <button onClick={handleSearch} disabled={loading} className="sr-btn">
          {loading ? "Đang tra cứu..." : "Tra cứu"}
        </button>
        <button
          type="button"
          className="sr-btn sr-back-btn"
          style={{ marginLeft: 8, background: "#eee", color: "#333" }}
          onClick={() => window.history.back()}
        >
          ← Quay lại
        </button>
      </div>
      {error && <div className="sr-error">{error}</div>}

      <div className="sr-result-section">
        <h3 className="sr-section-title">Kết quả xét nghiệm</h3>
        {testResults.length === 0 ? (
          <p className="sr-empty">Không có kết quả xét nghiệm</p>
        ) : (
          <div className="sr-test-result-list">
            {testResults.map((result: any) => (
              <div className="sr-test-result-card" key={result._id}>
                <div className="sr-test-header">
                  <div>
                    <span className="sr-test-package">
                      {result.testPackage?.name}
                    </span>
                    <span className="sr-test-date">
                      {new Date(result.testDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div
                    className={`sr-status-badge sr-status-${result.overallStatus}`}
                  >
                    {result.overallStatus === "normal"
                      ? "Bình thường"
                      : result.overallStatus === "abnormal"
                      ? "Bất thường"
                      : result.overallStatus === "requires_attention"
                      ? "Cần theo dõi"
                      : "Khác"}
                  </div>
                </div>
                <div className="sr-test-details">
                  <div className="sr-info-row">
                    <span>
                      <strong>Bác sĩ:</strong>{" "}
                      {result.performedBy?.user?.userName || "-"}
                    </span>
                  </div>
                  <div className="sr-info-row">
                    <span>
                      <strong>Ghi chú bác sĩ:</strong>{" "}
                      {result.doctorNotes || "-"}
                    </span>
                  </div>
                  <div className="sr-info-row">
                    <span>
                      <strong>Khuyến nghị:</strong>{" "}
                      {result.recommendations || "-"}
                    </span>
                  </div>
                  <div className="sr-table-wrapper">
                    <table className="sr-test-table">
                      <thead>
                        <tr>
                          <th>Tên xét nghiệm</th>
                          <th>Kết quả</th>
                          <th>Đơn vị</th>
                          <th>Khoảng bình thường</th>
                          <th>Trạng thái</th>
                          <th>Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results?.map((item: any) => (
                          <tr key={item._id}>
                            <td>{item.testName}</td>
                            <td>{item.value}</td>
                            <td>{item.unit}</td>
                            <td>{item.normalRange}</td>
                            <td>
                              <span
                                className={`sr-status-badge sr-status-${item.status}`}
                              >
                                {item.status === "normal"
                                  ? "Bình thường"
                                  : item.status === "abnormal"
                                  ? "Bất thường"
                                  : "Khác"}
                              </span>
                            </td>
                            <td>{item.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.attachments && result.attachments.length > 0 && (
                    <div className="sr-test-attachments">
                      <strong>File đính kèm:</strong>
                      <div className="sr-attachment-list">
                        {result.attachments.map((url: string, idx: number) => {
                          const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(
                            url
                          );
                          return isImage ? (
                            <img
                              key={idx}
                              src={url}
                              alt={`attachment-${idx + 1}`}
                              className="sr-attachment-image"
                              onClick={() => setPreviewImage(url)}
                            />
                          ) : (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="sr-attachment-link"
                            >
                              Xem file {idx + 1}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <h3 className="sr-section-title">Hồ sơ y tế</h3>
        {medicalRecords.length === 0 ? (
          <p className="sr-empty">Không có hồ sơ y tế</p>
        ) : (
          <div className="sr-medical-record-list">
            {medicalRecords.map((record: any) => (
              <div className="sr-medical-record-card" key={record._id}>
                <div className="sr-record-header">
                  <span className="sr-record-title">
                    {record.title || "Hồ sơ y tế"}
                  </span>
                  <span className="sr-record-date">
                    {new Date(record.date).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="sr-record-details">
                  <div className="sr-info-row">
                    <span>
                      <strong>Bác sĩ:</strong> <strong>Bác sĩ:</strong>{" "}
                      {record.doctorId?.user?.userName || "-"}
                    </span>
                  </div>
                  <div className="sr-info-row">
                    <span>
                      <strong>Loại:</strong> {record.type || "-"}
                    </span>
                  </div>
                  <div className="sr-info-row">
                    <span>
                      <strong>Kết luận:</strong> {record.conclusion || "-"}
                    </span>
                  </div>
                  <div className="sr-info-row">
                    <span>
                      <strong>Ghi chú:</strong> {record.notes || "-"}
                    </span>
                  </div>
                  {record.attachments && record.attachments.length > 0 && (
                    <div className="sr-record-attachments">
                      <strong>File đính kèm:</strong>
                      <div className="sr-attachment-list">
                        {record.attachments.map((url: string, idx: number) => {
                          const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(
                            url
                          );
                          return isImage ? (
                            <img
                              key={idx}
                              src={url}
                              alt={`attachment-${idx + 1}`}
                              className="sr-attachment-image"
                              onClick={() => setPreviewImage(url)}
                            />
                          ) : (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="sr-attachment-link"
                            >
                              Xem file {idx + 1}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {previewImage && (
          <div
            className="sr-image-modal"
            onClick={() => setPreviewImage(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 1000,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={previewImage}
              alt="Xem ảnh lớn"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: 8,
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                background: "#fff",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultPage;
