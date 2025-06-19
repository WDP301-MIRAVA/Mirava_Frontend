import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EditableTreatmentPlan.css';

interface Props {
  planId: string;
  onSuccess: () => void;
}

const EditTreatmentPlanForm: React.FC<Props> = ({ planId, onSuccess }) => {
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await axios.get(`https://mirava-f0rz.onrender.com/api/treatment-plan`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.data.find((p: any) => p._id === planId);
        setFormData(data);
      } catch (err) {
        console.error('Lỗi lấy kế hoạch điều trị:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateNested = (group: string, key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [group]: { ...prev[group], [key]: value }
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await axios.put(`https://mirava-f0rz.onrender.com/api/treatment-plan/${planId}`, {
        cycleStartDate: formData.cycleStartDate,
        ovarianStimulation: formData.ovarianStimulation,
        hcgInjection: formData.hcgInjection,
        eggRetrieval: formData.eggRetrieval,
        embryoTransfer: formData.embryoTransfer,
        postTransferMonitoring: formData.postTransferMonitoring,
        reminders: formData.reminders,
        notes: formData.notes,
        status: formData.status
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('✅ Cập nhật thành công!');
      onSuccess();
    } catch (err: any) {
      console.error('❌ Lỗi khi cập nhật:', err.response || err);
      alert('❌ Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) return <p>⏳ Đang tải dữ liệu kế hoạch...</p>;

  return (
    <div className="edit-treatment-container">
      <h3>✏️ Cập nhật kế hoạch điều trị</h3>

      <div className="edit-treatment-row">
        <span className="edit-treatment-label">📅 Ngày bắt đầu chu kỳ:</span>
        <input type="date" className="edit-treatment-input"
          value={formData.cycleStartDate?.split('T')[0]}
          onChange={(e) => handleChange('cycleStartDate', e.target.value)} />
      </div>

      <div className="edit-treatment-row">
        <span className="edit-treatment-label">📝 Ghi chú:</span>
        <textarea className="edit-treatment-textarea"
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)} />
      </div>

      {formData.ovarianStimulation && (
        <>
          <h4>🧬 Kích thích buồng trứng</h4>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày bắt đầu:</span>
            <input type="number" className="edit-treatment-input"
              value={formData.ovarianStimulation.startDay || ''}
              onChange={(e) => updateNested('ovarianStimulation', 'startDay', parseInt(e.target.value))} />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Số ngày:</span>
            <input type="number" className="edit-treatment-input"
              value={formData.ovarianStimulation.durationDays || ''}
              onChange={(e) => updateNested('ovarianStimulation', 'durationDays', parseInt(e.target.value))} />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Thuốc:</span>
            <input className="edit-treatment-input"
              value={formData.ovarianStimulation.medication || ''}
              onChange={(e) => updateNested('ovarianStimulation', 'medication', e.target.value)} />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Liều dùng:</span>
            <input className="edit-treatment-input"
              value={formData.ovarianStimulation.dailyDosage || ''}
              onChange={(e) => updateNested('ovarianStimulation', 'dailyDosage', e.target.value)} />
          </div>
        </>
      )}

      {formData.hcgInjection && (
        <>
          <h4>💉 Tiêm HCG</h4>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày tiêm:</span>
            <input type="datetime-local" className="edit-treatment-input"
              value={formData.hcgInjection.plannedDate?.slice(0, 16)}
              onChange={(e) => updateNested('hcgInjection', 'plannedDate', e.target.value)} />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Thuốc:</span>
            <input className="edit-treatment-input"
              value={formData.hcgInjection.medication || ''}
              onChange={(e) => updateNested('hcgInjection', 'medication', e.target.value)} />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Liều lượng:</span>
            <input className="edit-treatment-input"
              value={formData.hcgInjection.dosage || ''}
              onChange={(e) => updateNested('hcgInjection', 'dosage', e.target.value)} />
          </div>
        </>
      )}

      {formData.eggRetrieval && (
        <>
          <h4>🥚 Lấy trứng</h4>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày thực hiện:</span>
            <input type="datetime-local" className="edit-treatment-input"
              value={formData.eggRetrieval.plannedDate?.slice(0, 16)}
              onChange={(e) => updateNested('eggRetrieval', 'plannedDate', e.target.value)} />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Hướng dẫn:</span>
            <textarea className="edit-treatment-textarea"
              value={formData.eggRetrieval.instructions || ''}
              onChange={(e) => updateNested('eggRetrieval', 'instructions', e.target.value)} />
          </div>
        </>
      )}

      {formData.embryoTransfer && (
        <>
          <h4>🧫 Chuyển phôi</h4>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày chuyển:</span>
            <input type="datetime-local" className="edit-treatment-input"
              value={formData.embryoTransfer.plannedDate?.slice(0, 16)}
              onChange={(e) => updateNested('embryoTransfer', 'plannedDate', e.target.value)} />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Giai đoạn phôi:</span>
            <input className="edit-treatment-input"
              value={formData.embryoTransfer.embryoStage || ''}
              onChange={(e) => updateNested('embryoTransfer', 'embryoStage', e.target.value)} />
          </div>
        </>
      )}

      {formData.postTransferMonitoring && (
        <>
          <h4>🔬 Theo dõi sau chuyển phôi</h4>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày xét nghiệm Beta HCG:</span>
            <input type="datetime-local" className="edit-treatment-input"
              value={formData.postTransferMonitoring.betaHcgTestDate?.slice(0, 16)}
              onChange={(e) => updateNested('postTransferMonitoring', 'betaHcgTestDate', e.target.value)} />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày siêu âm kiểm tra:</span>
            <input type="datetime-local" className="edit-treatment-input"
              value={formData.postTransferMonitoring.ultrasoundCheckDate?.slice(0, 16)}
              onChange={(e) => updateNested('postTransferMonitoring', 'ultrasoundCheckDate', e.target.value)} />
          </div>
        </>
      )}

      <div className="edit-treatment-actions">
        <button className="save-button" onClick={handleSubmit} disabled={saving}>
          {saving ? '💾 Đang lưu...' : '💾 Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
};

export default EditTreatmentPlanForm;