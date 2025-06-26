import React, { useState, useEffect } from 'react';
import { Calendar, User, FileText, Edit3, Check, Clock, Plus } from 'lucide-react';
import './IVFTreatmentTracker.css';

// Types
interface TreatmentStep {
  id: string;
  name: string;
  date?: string;
  doctorNote?: string;
  specialMetrics?: { [key: string]: string | number };
  performedBy?: string;
  status: 'pending' | 'completed' | 'in-progress';
  category: string;
}

interface FormData {
  date: string;
  performedBy: string;
  doctorNote: string;
  specialMetrics: { [key: string]: string | number };
}

const IVFTreatmentTracker: React.FC = () => {
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([
    {
      id: '1',
      name: 'Khám tư vấn ban đầu',
      category: 'Tư vấn',
      status: 'completed',
      date: '2025-05-15',
      doctorNote: 'Tư vấn phác đồ điều trị, hướng dẫn sử dụng thuốc kích trứng',
      specialMetrics: { 'Lần khám': 'Ban đầu', 'Phác đồ': 'IVF Protocol 1' },
      performedBy: 'BS. Chuyên khoa HSTSS'
    },
    {
      id: '2',
      name: 'Khám theo dõi ngày 1 chu kỳ',
      category: 'Tư vấn',
      status: 'completed',
      date: '2025-05-20',
      doctorNote: 'Bắt đầu chu kỳ kích trứng, siêu âm baseline',
      specialMetrics: { 'Ngày chu kỳ': 1, 'Nang cơ bản': '2-3mm', 'Liều thuốc': 'Gonal-F 225IU' },
      performedBy: 'BS. Chuyên khoa HSTSS'
    },
    {
      id: '3',
      name: 'Khám theo dõi ngày 5 chu kỳ',
      category: 'Tư vấn',
      status: 'completed',
      date: '2025-05-24',
      doctorNote: 'Theo dõi phản ứng kích trứng, điều chỉnh liều thuốc',
      specialMetrics: { 'Ngày chu kỳ': 5, 'Nang lớn nhất': '8-10mm', 'Điều chỉnh liều': 'Giảm xuống 150IU' },
      performedBy: 'BS. Chuyên khoa HSTSS'
    },
    {
      id: '4',
      name: 'Khám theo dõi ngày 8 chu kỳ',
      category: 'Tư vấn',
      status: 'completed',
      date: '2025-05-27',
      doctorNote: 'Nang phát triển tốt, chuẩn bị tiêm thuốc kích thích rụng trứng',
      specialMetrics: { 'Ngày chu kỳ': 8, 'Nang lớn nhất': '14-16mm', 'Số nang >12mm': 8 },
      performedBy: 'BS. Chuyên khoa HSTSS'
    },
    {
      id: '5',
      name: 'Khám theo dõi ngày 10 chu kỳ',
      category: 'Tư vấn',
      status: 'completed',
      date: '2025-05-29',
      doctorNote: 'Nang chín, lên lịch chọc hút noãn sau 36h tiêm HCG',
      specialMetrics: { 'Ngày chu kỳ': 10, 'Nang lớn nhất': '18-20mm', 'HCG': 'Ovitrelle 250mcg' },
      performedBy: 'BS. Chuyên khoa HSTSS'
    },
    {
      id: '6',
      name: 'Siêu âm noãn',
      category: 'Kiểm tra',
      status: 'completed',
      date: '2025-06-05',
      doctorNote: 'Nang trái 16mm, nang phải 14mm',
      specialMetrics: { 'Nang trái (mm)': 16, 'Nang phải (mm)': 14 },
      performedBy: 'BS. Nguyễn Văn A'
    },
    {
      id: '7',
      name: 'Chọc hút noãn',
      category: 'Thủ thuật',
      status: 'completed',
      date: '2025-06-15',
      doctorNote: 'Thu được 10 noãn chất lượng tốt',
      specialMetrics: { 'Số noãn thu được': 10, 'Chất lượng': 'Tốt' },
      performedBy: 'BS. Trần Thị B'
    },
    {
      id: '8',
      name: 'Thụ tinh IVF',
      category: 'Lab',
      status: 'in-progress',
      date: '2025-06-16',
      doctorNote: 'Đang tiến hành thụ tinh',
      specialMetrics: { 'Tinh trùng sau lọc': '15M/ml' },
      performedBy: 'KTV. Lab'
    },
    {
      id: '9',
      name: 'Nuôi cấy phôi',
      category: 'Lab',
      status: 'pending'
    },
    {
      id: '10',
      name: 'Chuyển phôi',
      category: 'Thủ thuật',
      status: 'pending'
    }
  ]);

  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    performedBy: '',
    doctorNote: '',
    specialMetrics: {}
  });

  const [drafts, setDrafts] = useState<{ [key: string]: FormData }>({});

  // Auto-save draft
  useEffect(() => {
    if (activeForm) {
      const timer = setTimeout(() => {
        setDrafts(prev => ({
          ...prev,
          [activeForm]: formData
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, activeForm]);

  const openForm = (stepId: string) => {
    const step = treatmentSteps.find(s => s.id === stepId);
    if (step) {
      setFormData({
        date: step.date || new Date().toISOString().split('T')[0],
        performedBy: step.performedBy || '',
        doctorNote: step.doctorNote || '',
        specialMetrics: step.specialMetrics || {}
      });
    }
    
    // Load draft if exists
    if (drafts[stepId]) {
      setFormData(drafts[stepId]);
    }
    
    setActiveForm(stepId);
  };

  const closeForm = () => {
    setActiveForm(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      performedBy: '',
      doctorNote: '',
      specialMetrics: {}
    });
  };

  const addNewVisit = () => {
    const newVisit: TreatmentStep = {
      id: Date.now().toString(),
      name: `Khám theo dõi ngày ${new Date().getDate()} chu kỳ`,
      category: 'Tư vấn',
      status: 'pending'
    };
    
    setTreatmentSteps(prev => {
      // Find the last consultation visit index
      const lastConsultationIndex = prev.findIndex(step => !step.category.includes('Tư vấn'));
      if (lastConsultationIndex === -1) {
        // If no non-consultation steps, add at the end of consultations
        return [...prev, newVisit];
      } else {
        // Insert before the first non-consultation step
        const newSteps = [...prev];
        newSteps.splice(lastConsultationIndex, 0, newVisit);
        return newSteps;
      }
    });
    
    // Immediately open form for the new visit
    setTimeout(() => openForm(newVisit.id), 100);
  };

  const saveStep = () => {
    if (!activeForm) return;

    setTreatmentSteps(prev => prev.map(step => 
      step.id === activeForm 
        ? {
            ...step,
            ...formData,
            status: 'completed' as const
          }
        : step
    ));

    // Remove draft after saving
    setDrafts(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[activeForm];
      return newDrafts;
    });

    closeForm();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="status-icon completed" />;
      case 'in-progress':
        return <Clock className="status-icon in-progress" />;
      default:
        return <div className="status-icon pending" />;
    }
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'Tư vấn':
        return 'category-consultation';
      case 'Kiểm tra':
        return 'category-check';
      case 'Thủ thuật':
        return 'category-procedure';
      case 'Lab':
        return 'category-lab';
      default:
        return 'category-consultation';
    }
  };

  const updateSpecialMetric = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specialMetrics: {
        ...prev.specialMetrics,
        [key]: value
      }
    }));
  };

  const getMetricFields = (stepName: string) => {
    switch (stepName) {
      case 'Khám tư vấn ban đầu':
        return ['Lần khám', 'Phác đồ', 'Cân nặng (kg)', 'Huyết áp'];
      case 'Khám theo dõi ngày 1 chu kỳ':
        return ['Ngày chu kỳ', 'Nang cơ bản', 'Liều thuốc', 'E2 (pg/ml)'];
      case 'Khám theo dõi ngày 5 chu kỳ':
        return ['Ngày chu kỳ', 'Nang lớn nhất', 'Điều chỉnh liều', 'E2 (pg/ml)'];
      case 'Khám theo dõi ngày 8 chu kỳ':
        return ['Ngày chu kỳ', 'Nang lớn nhất', 'Số nang >12mm', 'E2 (pg/ml)'];
      case 'Khám theo dõi ngày 10 chu kỳ':
        return ['Ngày chu kỳ', 'Nang lớn nhất', 'HCG', 'Lịch chọc hút'];
      case 'Siêu âm noãn':
        return ['Nang trái (mm)', 'Nang phải (mm)', 'Nội mạc tử cung (mm)'];
      case 'Chọc hút noãn':
        return ['Số noãn thu được', 'Chất lượng'];
      case 'Thụ tinh IVF':
        return ['Tinh trùng sau lọc', 'Tỷ lệ thụ tinh (%)'];
      case 'Nuôi cấy phôi':
        return ['Số phôi ngày 3', 'Số phôi ngày 5', 'Chất lượng phôi'];
      case 'Chuyển phôi':
        return ['Số phôi chuyển', 'Vị trí chuyển', 'Độ dày nội mạc (mm)'];
      default:
        return [];
    }
  };

  return (
    <div className="ivf-tracker">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="header-title">
            Hệ thống Quản lý Điều trị IVF
          </h1>
          <p className="header-subtitle">Theo dõi và ghi chép từng bước điều trị một cách chi tiết</p>
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="step-count">
            Tổng cộng: <span className="step-count-number">{treatmentSteps.length}</span> bước điều trị
          </div>
          <button onClick={addNewVisit} className="add-visit-btn">
            <Plus className="w-4 h-4" />
            Thêm lần khám mới
          </button>
        </div>

        {/* Main Card */}
        <div className="main-card">
          <div className="card-header">
            <h2 className="card-header-title">
              <FileText className="w-6 h-6" />
              Tiến trình điều trị
            </h2>
          </div>
          
          <div className="table-container">
            <table className="treatment-table">
              <thead className="table-header">
                <tr>
                  <th>Trạng thái</th>
                  <th>Bước điều trị</th>
                  <th>Ngày thực hiện</th>
                  <th>Người thực hiện</th>
                  <th>Ghi chú</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {treatmentSteps.map((step) => (
                  <tr key={step.id} className={`table-row ${step.status}`}>
                    <td className="table-cell">
                      {getStatusIcon(step.status)}
                    </td>
                    <td className="table-cell" >
                      <div className="step-info">
                        <span className="step-name">{step.name}</span>
                        <span className={`category-badge ${getCategoryClass(step.category)}`}>
                          {step.category}
                        </span>
                        {drafts[step.id] && (
                          <span className="draft-badge">
                            Draft
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {step.date ? (
                        <div className="info-item">
                          <Calendar className="w-4 h-4" />
                          {step.date}
                        </div>
                      ) : (
                        <span className="info-item empty">Chưa thực hiện</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {step.performedBy ? (
                        <div className="info-item">
                          <User className="w-4 h-4" />
                          {step.performedBy}
                        </div>
                      ) : (
                        <span className="info-item empty">-</span>
                      )}
                    </td>
                    <td className="table-cell notes-cell">
                      {step.doctorNote ? (
                        <span className="notes-text">{step.doctorNote}</span>
                      ) : (
                        <span className="notes-text empty">Chưa có ghi chú</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <button onClick={() => openForm(step.id)} className="action-btn">
                        <Edit3 className="w-4 h-4" />
                        {step.status === 'completed' ? 'Chỉnh sửa' : 'Ghi kết quả'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        {activeForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3 className="modal-title">
                  Ghi kết quả: {treatmentSteps.find(s => s.id === activeForm)?.name}
                </h3>
              </div>
              
              <div className="modal-content">
                {/* Date */}
                <div className="form-group">
                  <label className="form-label">
                    Ngày thực hiện
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="form-input"
                  />
                </div>

                {/* Performed By */}
                <div className="form-group">
                  <label className="form-label">
                    Người thực hiện
                  </label>
                  <input
                    type="text"
                    value={formData.performedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, performedBy: e.target.value }))}
                    placeholder="Nhập tên bác sĩ/kỹ thuật viên"
                    className="form-input"
                  />
                </div>

                {/* Special Metrics */}
                {getMetricFields(treatmentSteps.find(s => s.id === activeForm)?.name || '').length > 0 && (
                  <div className="metrics-section">
                    <label className="metrics-label">
                      Chỉ số đặc biệt
                    </label>
                    <div className="metrics-grid">
                      {getMetricFields(treatmentSteps.find(s => s.id === activeForm)?.name || '').map((field) => (
                        <div key={field} className="metric-item">
                          <label className="metric-label">{field}</label>
                          <input
                            type="text"
                            value={formData.specialMetrics[field] || ''}
                            onChange={(e) => updateSpecialMetric(field, e.target.value)}
                            className="metric-input"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Note */}
                <div className="form-group">
                  <label className="form-label">
                    Ghi chú bác sĩ
                  </label>
                  <textarea
                    value={formData.doctorNote}
                    onChange={(e) => setFormData(prev => ({ ...prev, doctorNote: e.target.value }))}
                    placeholder="Nhập ghi chú chi tiết về kết quả..."
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="modal-footer">
                <button onClick={closeForm} className="btn-cancel">
                  Hủy
                </button>
                <button onClick={saveStep} className="btn-save">
                  <Check className="w-4 h-4" />
                  Lưu kết quả
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IVFTreatmentTracker;