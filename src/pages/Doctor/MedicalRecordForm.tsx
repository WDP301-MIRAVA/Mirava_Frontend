import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import "./MedicalRecordForm.css";

const MedicalRecordForm = ({
  step,
  treatmentPlan,
  medicalRecord,
  onSuccess,
  onCancel,
}) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 16),
    type: step?.type || "Khám",
    title: step?.name || step?.title || "",
    findings: "",
    conclusion: "",
    attachments: [""],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  console.log("MedicalRecordForm mounted", step, treatmentPlan, medicalRecord);
  useEffect(() => {
    console.log("📦 Loaded medicalRecord:", medicalRecord);
    console.log("step:", step);
    console.log("medicalRecord:", medicalRecord);
    if (medicalRecord) {
      setForm({
        date: medicalRecord.date
          ? new Date(medicalRecord.date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        type: medicalRecord.type || step?.type || "Khám",
        title: medicalRecord.title || step?.name || step?.title || "",
        findings: medicalRecord.findings || "",
        conclusion: medicalRecord.conclusion || "",
        attachments: medicalRecord.attachments?.length
          ? medicalRecord.attachments
          : [""],
        notes: medicalRecord.notes || "",
      });
    } else {
      // Nếu chưa có, giữ form trống như mặc định
      setForm({
        date: new Date().toISOString().slice(0, 16),
        type: step?.type || "Khám",
        title: step?.name || step?.title || "",
        findings: step?.findings || "",
        conclusion: step?.conclusion || "",
        attachments: [""],
        notes: "",
      });
    }
  }, [medicalRecord, step]);

  // Lấy medicalRecordId nếu đã có
  const medicalRecordId =
    step?.medicalRecords && step.medicalRecords.length > 0
      ? step.medicalRecords[0]
      : null;

  const patientId = treatmentPlan?.patient;
  const doctorId = treatmentPlan?.doctor?._id;
  const type = form.type || step?.type || "Khám";

  // Lấy treatmentEventId từ step index
  let treatmentEventId = null;
  if (step?.id && treatmentPlan?.treatmentEvents) {
    const stepIndex = parseInt(step.id) - 1;
    if (stepIndex >= 0 && stepIndex < treatmentPlan.treatmentEvents.length) {
      treatmentEventId = treatmentPlan.treatmentEvents[stepIndex]._id;
    }
  }

  console.log("treatmentPlan:", treatmentEventId);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleAttachmentChange = (e, idx) => {
    const arr = [...form.attachments];
    arr[idx] = e.target.value;
    setForm({ ...form, attachments: arr });
  };

  const addAttachment = () => {
    setForm({ ...form, attachments: [...form.attachments, ""] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }

      // Validate dữ liệu bắt buộc
      if (!form.findings.trim()) {
        setError("Vui lòng nhập kết quả khám");
        setLoading(false);
        return;
      }
      if (!form.conclusion.trim()) {
        setError("Vui lòng nhập kết luận");
        setLoading(false);
        return;
      }
      if (!treatmentEventId) {
        setError("Không tìm thấy ID sự kiện điều trị. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      const requestData = {
        patientId,
        doctorId,
        treatmentPlanId: treatmentPlan._id,
        treatmentEventId,
        serviceId: step?.serviceId || null,
        date: new Date(form.date).toISOString(),
        type,
        title: form.title,
        findings: form.findings.trim(),
        conclusion: form.conclusion.trim(),
        attachments: form.attachments.filter((a) => a.trim() !== ""),
        notes: form.notes.trim(),
      };

      let response;
      if (medicalRecordId) {
        // Đã có record, cập nhật
        response = await axios.put(
          `https://mirava-f0rz.onrender.com/api/medicalRecord/${medicalRecordId}`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Chưa có record, tạo mới
        response = await axios.post(
          "https://mirava-f0rz.onrender.com/api/medicalRecord",
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.data.success) {
        message.success(
          medicalRecordId
            ? "Cập nhật hồ sơ thành công!"
            : "Tạo hồ sơ thành công!"
        );
        onSuccess(response.data.data);
      } else {
        setError(response.data.message || "Không thể lưu hồ sơ y tế");
      }
    } catch (err) {
      console.error("❌ Error creating/updating medical record:", err);
      setError("Có lỗi xảy ra khi lưu hồ sơ y tế. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medical-record-form">
      <h2>Nhập kết quả khám</h2>

      {error && (
        <div
          className="form-error"
          style={{
            marginBottom: 20,
            padding: 12,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Ngày khám <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Loại khám <span className="required">*</span>
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Chọn loại khám</option>
            <option value="Khám">Khám</option>
            <option value="Thủ thuật">Thủ thuật</option>
            <option value="Xét nghiệm">Xét nghiệm</option>
            <option value="Siêu âm">Siêu âm</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Tiêu đề <span className="required">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="form-input"
            placeholder="Nhập tiêu đề bài khám"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Kết quả khám <span className="required">*</span>
          </label>
          <textarea
            name="findings"
            value={form.findings}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Mô tả chi tiết kết quả khám..."
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Kết luận <span className="required">*</span>
          </label>
          <textarea
            name="conclusion"
            value={form.conclusion}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Kết luận và khuyến nghị..."
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">File đính kèm (URL)</label>
          <div className="attachment-section">
            {form.attachments.map((att, idx) => (
              <div key={idx} className="attachment-item">
                <input
                  type="text"
                  value={att}
                  onChange={(e) => handleAttachmentChange(e, idx)}
                  placeholder="https://yourdomain.com/uploads/scan1.jpg"
                  className="attachment-input"
                />
                {idx === form.attachments.length - 1 && (
                  <button
                    type="button"
                    onClick={addAttachment}
                    className="add-attachment-btn"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Ghi chú</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Ghi chú bổ sung..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Hủy
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Đang lưu...
              </>
            ) : (
              "Lưu kết quả"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalRecordForm;
