// IVFTreatmentTracker.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, User, FileText, Edit3, Check, Clock, Plus, ArrowLeft } from 'lucide-react';
import './IVFTreatmentTracker.css';
import { useLocation, useNavigate } from 'react-router-dom';

interface TreatmentStep {
  id: string;
  name: string;
  date?: string;
  doctorNote?: string;
  specialMetrics?: { [key: string]: string | number };
  performedBy?: string;
  status: 'pending' | 'completed' | 'in-progress';
  category: string;
  stage?: string;
}

interface FormData {
  date: string;
  performedBy: string;
  doctorNote: string;
  specialMetrics: { [key: string]: string | number };
}

const IVFTreatmentTracker: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patientInfo = location.state as {
    patientId: string;
    patientName: string;
    patientCode: string;
    treatmentEvents?: TreatmentStep[];
  } | null;

  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([]);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    performedBy: '',
    doctorNote: '',
    specialMetrics: {}
  });
  const [drafts, setDrafts] = useState<{ [key: string]: FormData }>({});

  useEffect(() => {
    if (patientInfo?.treatmentEvents) {
      console.log("📦 Nhận thông tin bệnh nhân:", patientInfo);
      interface RawTreatmentEvent {
        _id?: string;
        title?: string;
        scheduledDates?: string[];
        description?: string;
        status?: string;
        type?: string;
        stage?: string;
      }

      const mappedSteps: TreatmentStep[] = patientInfo.treatmentEvents.map((event: RawTreatmentEvent, index: number) => ({
        id: event._id || `${index}`,
        name: event.title || "Không rõ",
        date: event.scheduledDates?.[0] || "",
        doctorNote: event.description || "",
        specialMetrics: {},
        performedBy: "",
        status: event.status === 'completed' ? 'completed' : event.status === 'in-progress' ? 'in-progress' : 'pending',
        category: mapEventTypeToCategory(event.type || ""),
        stage: event.stage || ""
      }));
      setTreatmentSteps(mappedSteps);
      console.log("📦 Bước điều trị đã được ánh xạ:", mappedSteps);
    }
  }, [patientInfo]);

  useEffect(() => {
    if (activeForm) {
      const timer = setTimeout(() => {
        setDrafts(prev => ({ ...prev, [activeForm]: formData }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, activeForm]);

  const openForm = (stepId: string) => {
    const step = treatmentSteps.find(s => s.id === stepId);
    if (step) {
          console.log("📦 Mở form cho bước:", step);

      setFormData({
        date: step.date || new Date().toISOString().split('T')[0],
        performedBy: step.performedBy || '',
        doctorNote: step.doctorNote || '',
        specialMetrics: step.specialMetrics || {}
      });
    }
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

  const saveStep = () => {
    if (!activeForm) return;
    setTreatmentSteps(prev => prev.map(step =>
      step.id === activeForm
        ? { ...step, ...formData, status: 'completed' as const }
        : step
    ));
    setDrafts(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[activeForm];
      return newDrafts;
    });
    closeForm();
  };

  const addNewVisit = () => {
    const newVisit: TreatmentStep = {
      id: Date.now().toString(),
      name: `Khám theo dõi ngày ${new Date().getDate()} chu kỳ`,
      category: 'Tư vấn',
      status: 'pending'
    };
    setTreatmentSteps(prev => {
      const lastConsultationIndex = prev.findIndex(step => !step.category.includes('Tư vấn'));
      if (lastConsultationIndex === -1) return [...prev, newVisit];
      const newSteps = [...prev];
      newSteps.splice(lastConsultationIndex, 0, newVisit);
      return newSteps;
    });
    setTimeout(() => openForm(newVisit.id), 100);
  };

  const handleBackToPatientList = () => {
    navigate('/doctor/patients');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="status-icon completed" />;
      case 'in-progress': return <Clock className="status-icon in-progress" />;
      default: return <div className="status-icon pending" />;
    }
  };

  const mapEventTypeToCategory = (type: string): string => {
    switch (type) {
      case 'Khám': return 'Tư vấn';
      case 'Siêu âm': return 'Kiểm tra';
      case 'Xét nghiệm': return 'Kiểm tra';
      case 'Thủ thuật': return 'Thủ thuật';
      case 'Lab': return 'Lab';
      default: return 'Tư vấn';
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
      return 'category-default';
  } 
};
const getMetricFields = (stepName: string): string[] => {
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
      case 'Khám với bác sĩ hỗ trợ sinh sản': // 👈 thêm dòng này
      return ['Lần khám', 'Phác đồ', 'Cân nặng (kg)', 'Huyết áp'];
    default:
      return [];
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

  return (
    <div className="ivf-tracker"> 
      <div className="container">
        {/* Header */}
        <div className="header">
           <div className="header-top">
            <button onClick={handleBackToPatientList} className="back-btn">
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách bệnh nhân
            </button>
          </div>
          
          {patientInfo && (
            <div className="patient-info">
              <h2 className="patient-name">{patientInfo.patientName}</h2>
              <p className="patient-code">Mã bệnh nhân: {patientInfo.patientCode}</p>
            </div>
          )}
       
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
                  <th>Mô tả</th>
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
                     <td className="table-cell">
                          {step.stage}
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