import React, { useState } from 'react';
import './ExaminationResults.css';

interface ExaminationData {
  patientId: string;
  doctorNotes: string;
  examinationDate: string;
  examinationType: string;
  patientName: string;
}

const ExaminationResults: React.FC = () => {
  const [formData, setFormData] = useState<ExaminationData>({
    patientId: '',
    doctorNotes: '',
    examinationDate: '',
    examinationType: '',
    patientName: ''
  });

  const [submittedData, setSubmittedData] = useState<ExaminationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const examinationTypes = [
    { value: 'general', label: 'Khám tổng quát' },
    { value: 'specialized', label: 'Khám chuyên khoa' },
    { value: 'fertility', label: 'Khám hiếm muộn' },
    { value: 'prenatal', label: 'Khám thai sản' },
    { value: 'gynecology', label: 'Khám phụ khoa' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateForm = (): boolean => {
    const { patientId, doctorNotes, examinationDate, examinationType, patientName } = formData;
    
    if (!patientId.trim() || !doctorNotes.trim() || !examinationDate || !examinationType || !patientName.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Simulate API call delay
    setTimeout(() => {
      setSubmittedData({ ...formData });
      setIsSubmitting(false);
      
      // Optional: Reset form after successful submission
      // setFormData({
      //   patientId: '',
      //   doctorNotes: '',
      //   examinationDate: '',
      //   examinationType: '',
      //   patientName: ''
      // });
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorNotes: '',
      examinationDate: '',
      examinationType: '',
      patientName: ''
    });
    setSubmittedData(null);
    setErrorMessage('');
  };

  const getExaminationTypeLabel = (value: string): string => {
    const type = examinationTypes.find(type => type.value === value);
    return type ? type.label : value;
  };

  return (
    <div className="examination-container">
      <div className="examination-card">
        <div className="card-header">
          <h1 className="card-title">Kết quả khám bệnh</h1>
          <p className="card-subtitle">Nhập thông tin kết quả khám cho bệnh nhân</p>
        </div>

        <form onSubmit={handleSubmit} className="examination-form">
          <div className="form-group">
            <label htmlFor="patientName" className="form-label">
              Tên bệnh nhân <span className="required">*</span>
            </label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Nhập tên bệnh nhân"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="patientId" className="form-label">
              Mã bệnh nhân / Số điện thoại <span className="required">*</span>
            </label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Nhập mã bệnh nhân hoặc số điện thoại"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="examinationDate" className="form-label">
                Ngày khám <span className="required">*</span>
              </label>
              <input
                type="date"
                id="examinationDate"
                name="examinationDate"
                value={formData.examinationDate}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="examinationType" className="form-label">
                Loại khám <span className="required">*</span>
              </label>
              <select
                id="examinationType"
                name="examinationType"
                value={formData.examinationType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Chọn loại khám</option>
                {examinationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="doctorNotes" className="form-label">
              Ghi chú của bác sĩ <span className="required">*</span>
            </label>
            <textarea
              id="doctorNotes"
              name="doctorNotes"
              value={formData.doctorNotes}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Nhập ghi chú, chẩn đoán, và khuyến nghị điều trị..."
              rows={4}
              required
            />
          </div>

          {errorMessage && (
            <div className="error-message">
              <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Làm mới
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="btn-spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path d="M4,12a8,8 0 1,1 16,0" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                  Đang lưu...
                </>
              ) : (
                'Lưu kết quả khám'
              )}
            </button>
          </div>
        </form>

        {submittedData && (
          <div className="result-box">
            <div className="result-header">
              <svg className="success-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3>Kết quả khám đã được lưu thành công</h3>
            </div>
            
            <div className="result-content">
              <div className="result-item">
                <span className="result-label">Tên bệnh nhân:</span>
                <span className="result-value">{submittedData.patientName}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Mã bệnh nhân:</span>
                <span className="result-value">{submittedData.patientId}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Loại khám:</span>
                <span className="result-value">{getExaminationTypeLabel(submittedData.examinationType)}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Ngày khám:</span>
                <span className="result-value">
                  {new Date(submittedData.examinationDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              
              <div className="result-item notes">
                <span className="result-label">Ghi chú của bác sĩ:</span>
                <div className="result-notes">{submittedData.doctorNotes}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminationResults;