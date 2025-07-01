import React, { useState } from "react";
import "./SearchResult.css";
import Header from "../../components/Header/index";
import Footer from "../../components/Footer/index";
import { useNavigate } from "react-router-dom";
import { loginByPatientCode } from "../../services/auth.services";

interface TreatmentResult {
  patientName: string;
  treatmentMethod: "IUI" | "IVF";
  startDate: string;
  status: "Đang điều trị" | "Hoàn tất" | "Thất bại";
}

const SearchResult: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [result, setResult] = useState<TreatmentResult | null>(null);
  const [showNotFound, setShowNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginPatient = async () => {
    if (!searchInput.trim()) return;

    setIsLoading(true);
    setResult(null);
    setShowNotFound(false);

    try {
      const { ok, data } = await loginByPatientCode(searchInput.trim());

      if (!ok || !data.accessToken) {
        setResult(null);
        setShowNotFound(true);
        setIsLoading(false);
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      const tokenPayload = JSON.parse(atob(data.accessToken.split(".")[1]));
      localStorage.setItem("role", tokenPayload.role);
      localStorage.setItem("userInfo", JSON.stringify(tokenPayload));
      localStorage.setItem("patientId", tokenPayload.id);
      if (tokenPayload.role === "Customer") {
        navigate("/customer");
        return;
      } else {
        setResult(null);
        setShowNotFound(true);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      setResult(null);
      setShowNotFound(true);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLoginPatient();
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đang điều trị":
        return "status-ongoing";
      case "Hoàn tất":
        return "status-completed";
      case "Thất bại":
        return "status-failed";
      default:
        return "";
    }
  };

  return (
    <>
      <Header />
      <div className="search-result-container">
        <div className="search-result-card">
          <h1 className="page-title">Tra cứu kết quả điều trị</h1>

          <div className="search-form">
            <div className="input-group">
              <label htmlFor="searchInput" className="input-label">
                Mã bệnh nhân hoặc Số điện thoại
              </label>
              <input
                id="searchInput"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập mã bệnh nhân hoặc số điện thoại"
                className="search-input"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleLoginPatient}
              disabled={isLoading || !searchInput.trim()}
              className="search-button"
            >
              {isLoading ? "Đang tra cứu..." : "Tra cứu kết quả"}
            </button>
          </div>

          {result && (
            <div className="result-card">
              <h2 className="result-title">Kết quả điều trị</h2>
              <div className="result-content">
                <div className="result-row">
                  <span className="result-label">Họ tên bệnh nhân:</span>
                  <span className="result-value">{result.patientName}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Phương pháp điều trị:</span>
                  <span className="result-value treatment-method">
                    {result.treatmentMethod}
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label">Ngày bắt đầu:</span>
                  <span className="result-value">{result.startDate}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Trạng thái điều trị:</span>
                  <span
                    className={`result-value status ${getStatusClass(
                      result.status
                    )}`}
                  >
                    {result.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {showNotFound && (
            <div className="not-found-alert">
              <div className="alert-icon">ℹ️</div>
              <div className="alert-content">
                <p className="alert-title">Không tìm thấy kết quả</p>
                <p className="alert-description">
                  Vui lòng kiểm tra lại mã bệnh nhân hoặc số điện thoại và thử
                  lại.
                </p>
              </div>
            </div>
          )}

          <div className="demo-info">
            <p className="demo-title">Demo - Thử với:</p>
            <ul className="demo-list">
              <li>BN001 (Đang điều trị)</li>
              <li>0912345678 (Hoàn tất)</li>
              <li>BN002 (Thất bại)</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchResult;
