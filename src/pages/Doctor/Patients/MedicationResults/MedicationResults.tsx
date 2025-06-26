import React, { useState } from 'react';
import './MedicationResults.css';

interface MedicationData {
  patientId: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  injectionDate: string;
  medicationType: string;
  comments: string;
}

const MedicationResults: React.FC = () => {
  const [formData, setFormData] = useState<MedicationData>({
    patientId: '',
    patientName: '',
    medicationName: '',
    dosage: '',
    injectionDate: '',
    medicationType: 'Injection',
    comments: ''
  });

  const [showResults, setShowResults] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (showError) {
      setShowError(false);
    }
  };

  const validateForm = (): boolean => {
    return !!(
      formData.patientId.trim() &&
      formData.patientName.trim() &&
      formData.medicationName.trim() &&
      formData.dosage.trim() &&
      formData.injectionDate.trim() &&
      formData.medicationType.trim()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowResults(true);
      setShowError(false);
    } else {
      setShowError(true);
      setShowResults(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      patientName: '',
      medicationName: '',
      dosage: '',
      injectionDate: '',
      medicationType: 'Injection',
      comments: ''
    });
    setShowResults(false);
    setShowError(false);
  };

  return (
    <div className="medication-container">
      <div className="medication-card">
        <div className="card-header">
          <h1 className="card-title">Kết Quả Tiêm Thuốc</h1>
          <p className="card-subtitle">Phòng khám điều trị hiếm muộn</p>
        </div>

        <form onSubmit={handleSubmit} className="medication-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="patientId" className="form-label">
                Mã bệnh nhân / Số điện thoại *
              </label>
              <input
                type="text"
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nhập mã bệnh nhân hoặc số điện thoại"
              />
            </div>

            <div className="form-group">
              <label htmlFor="patientName" className="form-label">
                Tên bệnh nhân *
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nhập tên bệnh nhân"
              />
            </div>

            <div className="form-group">
              <label htmlFor="medicationName" className="form-label">
                Tên thuốc *
              </label>
              <input
                type="text"
                id="medicationName"
                name="medicationName"
                value={formData.medicationName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nhập tên thuốc đã tiêm"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dosage" className="form-label">
                Liều lượng *
              </label>
              <input
                type="text"
                id="dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ví dụ: 10mg, 2ml, 1 viên"
              />
            </div>

            <div className="form-group">
              <label htmlFor="injectionDate" className="form-label">
                Ngày tiêm thuốc *
              </label>
              <input
                type="date"
                id="injectionDate"
                name="injectionDate"
                value={formData.injectionDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="medicationType" className="form-label">
                Phương thức tiêm *
              </label>
              <select
                id="medicationType"
                name="medicationType"
                value={formData.medicationType}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="Injection">Tiêm (Injection)</option>
                <option value="Oral">Uống (Oral)</option>
                <option value="Intravenous">Tiêm tĩnh mạch (Intravenous)</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="comments" className="form-label">
              Ghi chú / Nhận xét
            </label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Nhập ghi chú hoặc nhận xét thêm..."
              rows={4}
            />
          </div>

          {showError && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <span>Vui lòng điền đầy đủ thông tin bắt buộc</span>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Lưu kết quả tiêm thuốc
            </button>
            <button type="button" onClick={resetForm} className="reset-button">
              Làm mới
            </button>
          </div>
        </form>

        {showResults && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">Kết Quả Đã Lưu</h2>
              <div className="success-icon">✅</div>
            </div>
            
            <div className="results-grid">
              <div className="result-item">
                <span className="result-label">Tên bệnh nhân:</span>
                <span className="result-value">{formData.patientName}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Tên thuốc:</span>
                <span className="result-value">{formData.medicationName}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Liều lượng:</span>
                <span className="result-value">{formData.dosage}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Ngày tiêm:</span>
                <span className="result-value">{new Date(formData.injectionDate).toLocaleDateString('vi-VN')}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Phương thức:</span>
                <span className="result-value">{formData.medicationType}</span>
              </div>
              
              {formData.comments && (
                <div className="result-item full-width">
                  <span className="result-label">Ghi chú:</span>
                  <span className="result-value">{formData.comments}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationResults;