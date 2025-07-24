import React from "react";
import { X, Check } from "lucide-react";
import type { TreatmentStep, FormData } from "@/types/treatment.types";
import { getMetricFields } from "../utils/ivfHelpers";

interface StepFormModalProps {
  step: TreatmentStep;
  formData: FormData;
  onChange: (data: FormData) => void;
  onCancel: () => void;
  onSave: () => void;
  formError?: string | null;
  updating?: boolean;
}

const StepFormModal: React.FC<StepFormModalProps> = ({
  step,
  formData,
  onChange,
  onCancel,
  onSave,
  formError,
  updating,
}) => {
  const handleInput = (key: keyof FormData, value: any) => {
    onChange({ ...formData, [key]: value });
  };

  const updateSpecialMetric = (key: string, value: string): void => {
    onChange({
      ...formData,
      specialMetrics: {
        ...formData.specialMetrics,
        [key]: value,
      },
    });
  };

  const metricFields = getMetricFields(step.name);

  return (
    <div className="ivf-modal-overlay" onClick={onCancel}>
      <div className="ivf-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ivf-modal-header">
          <h3>Thông tin chi tiết: {step.name}</h3>
          <button onClick={onCancel} className="ivf-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="ivf-modal-body">
          <div className="ivf-form-group">
            <label className="ivf-form-label">Giai đoạn</label>
            <input
              type="text"
              value={formData.stage || step.stage || ""}
              onChange={(e) => handleInput("stage", e.target.value)}
              placeholder="Giai đoạn điều trị"
              className="ivf-form-input"
            />
          </div>

          <div className="ivf-form-group">
            <label className="ivf-form-label">Tên bước điều trị</label>
            <input
              type="text"
              value={formData.title || step.name || ""}
              onChange={(e) => handleInput("title", e.target.value)}
              placeholder="Tên bước điều trị"
              className="ivf-form-input"
            />
          </div>

          <div className="ivf-form-group">
            <label className="ivf-form-label">Mô tả</label>
            <textarea
              value={formData.description || step.description || ""}
              onChange={(e) => handleInput("description", e.target.value)}
              placeholder="Mô tả chi tiết về bước điều trị"
              className="ivf-form-textarea"
              rows={3}
            />
          </div>

          <div className="ivf-form-group">
            <label className="ivf-form-label">Loại</label>
            <select
              value={formData.type || step.type || ""}
              onChange={(e) => handleInput("type", e.target.value)}
              className="ivf-form-input"
            >
              <option value="">Chọn loại</option>
              <option value="Khám">Khám</option>
              <option value="Thủ thuật">Thủ thuật</option>
              <option value="Xét nghiệm">Xét nghiệm</option>
              <option value="Siêu âm">Siêu âm</option>
            </select>
          </div>

          <div className="ivf-form-group">
            <label className="ivf-form-label">Ngày thực hiện</label>
            <input
              type="datetime-local"
              value={formData.executionDate || ""}
              onChange={(e) => handleInput("executionDate", e.target.value)}
              className="ivf-form-input"
            />
          </div>

          <div className="ivf-form-group">
            <label className="ivf-form-label">Người thực hiện</label>
            <input
              type="text"
              value={formData.performedBy}
              onChange={(e) => handleInput("performedBy", e.target.value)}
              placeholder="Nhập tên bác sĩ/kỹ thuật viên"
              className="ivf-form-input"
            />
          </div>

          <div className="ivf-form-group">
            <label className="ivf-form-label">Ghi chú bác sĩ</label>
            <textarea
              value={formData.doctorNote}
              onChange={(e) => handleInput("doctorNote", e.target.value)}
              placeholder="Ghi chú từ bác sĩ"
              className="ivf-form-textarea"
              rows={3}
            />
          </div>

          {metricFields.length > 0 && (
            <div className="ivf-metrics-section">
              <label className="ivf-form-label">Chỉ số đặc biệt</label>
              <div className="ivf-metrics-grid">
                {metricFields.map((field) => (
                  <div key={field} className="ivf-metric-item">
                    <label className="ivf-metric-label">{field}</label>
                    <input
                      type="text"
                      value={formData.specialMetrics?.[field] || ""}
                      onChange={(e) =>
                        updateSpecialMetric(field, e.target.value)
                      }
                      className="ivf-metric-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {formError && <div className="ivf-form-error">{formError}</div>}
        </div>

        <div className="ivf-modal-footer">
          <button
            onClick={onCancel}
            className="ivf-btn-cancel"
            disabled={updating}
          >
            Hủy
          </button>
          <button onClick={onSave} className="ivf-btn-save" disabled={updating}>
            <Check size={16} />
            {updating ? "Đang lưu..." : "Lưu kết quả"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepFormModal;
