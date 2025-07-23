import React, { useState, useEffect } from "react";
import axiosInstance from "@/services/MainService";
import { message } from "antd";
import { toast } from "react-hot-toast";
import "./MedicalRecordForm.css";

interface MedicalRecordFormProps {
  step: any;
  treatmentPlan: any;
  medicalRecord: any;
  onSuccess: (data?: any) => void;
  onCancel: () => void;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
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
  const [files, setFiles] = useState<File[]>([]);
  // State để quản lý modal xóa file đính kèm
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  useEffect(() => {
    if (medicalRecord) {
      console.log("Dữ liệu attachments từ API:", medicalRecord.attachments);
      setForm({
        date: medicalRecord.date
          ? new Date(medicalRecord.date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        type: medicalRecord.type || step?.type || "Khám",
        title: medicalRecord.title || step?.name || step?.title || "",
        findings: medicalRecord.findings || "",
        conclusion: medicalRecord.conclusion || "",
        attachments:
          Array.isArray(medicalRecord.attachments) &&
          medicalRecord.attachments.length > 0
            ? medicalRecord.attachments
            : [],
        notes: medicalRecord.notes || "",
      });
    } else {
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
  let treatmentEventId: string | null = null;
  if (step?.id && treatmentPlan?.treatmentEvents) {
    const stepIndex = parseInt(step.id) - 1;
    if (stepIndex >= 0 && stepIndex < treatmentPlan.treatmentEvents.length) {
      treatmentEventId = treatmentPlan.treatmentEvents[stepIndex]._id;
    }
  }
  console.log("treatmentPlan:", treatmentPlan);
  console.log("treatmentPlan.patient:", treatmentPlan?.patient);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };
  // Hàm xác nhận xóa file
  const confirmDeleteAttachment = async () => {
    if (!deleteUrl) return;
    await handleDeleteAttachment(deleteUrl);
    setShowDeleteModal(false);
    setDeleteUrl(null);
  };

  // Hàm xóa file đính kèm
  const handleDeleteAttachment = async (url: string) => {
    if (!medicalRecord?._id) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.delete(
        `https://mirava-f0rz.onrender.com/api/medicalRecord/${medicalRecord._id}/attachments`,
        {
          data: { url },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setForm((prev) => ({
          ...prev,
          attachments: prev.attachments.filter((item) => item !== url),
        }));
        message.success("Đã xóa file đính kèm!");
      } else {
        message.error("Không thể xóa file đính kèm!");
      }
    } catch (err) {
      message.error("Có lỗi khi xóa file!");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      console.log("Submitting medical record with data:", {
        patientId,
      });
      // Chuẩn bị dữ liệu gửi đi
      const formData = new FormData();
      formData.append("patientId", patientId);
      formData.append("doctorId", doctorId);
      formData.append("treatmentPlanId", treatmentPlan._id);
      formData.append("treatmentEventId", treatmentEventId);
      if (step?.serviceId) {
        formData.append("serviceId", step.serviceId);
      }
      formData.append("date", new Date(form.date).toISOString());
      formData.append("type", type);
      formData.append("title", form.title);
      formData.append("findings", form.findings.trim());
      formData.append("conclusion", form.conclusion.trim());
      formData.append("notes", form.notes.trim());

      formData.append(
        "attachments",
        JSON.stringify(form.attachments.filter((a) => a.trim() !== ""))
      );

      // Đính kèm file upload CHỈ KHI TẠO MỚI
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      let response;
      if (medicalRecordId) {
        // Đã có record, cập nhật (không hỗ trợ cập nhật file, chỉ cập nhật thông tin)
        response = await axiosInstance.patch(
          `https://mirava-f0rz.onrender.com/api/medicalRecord/${medicalRecordId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Tạo mới, gửi kèm file
        response = await axiosInstance.post(
          "https://mirava-f0rz.onrender.com/api/medicalRecord",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(
          medicalRecordId
            ? "Cập nhật hồ sơ thành công!"
            : "Tạo hồ sơ thành công!"
        );
        if (response.data.data && response.data.data.attachments) {
          setForm((prev) => ({
            ...prev,
            attachments: response.data.data.attachments,
          }));
        }
        // Nếu muốn reset file upload
        setFiles([]);
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
          <label className="form-label">File đính kèm (hình ảnh, PDF)</label>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="form-input"
          />

          {/* Hiển thị file đính kèm đã lưu trong database */}
          {form.attachments && form.attachments.length > 0 && (
            <div className="attachments-preview">
              <label className="form-label">File đã lưu:</label>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {form.attachments.map((url, idx) =>
                  url ? (
                    <div
                      key={idx}
                      className={
                        /\.(jpg|jpeg|png|gif)$/i.test(url)
                          ? "attachment-image"
                          : "attachment-link"
                      }
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      {/\.(jpg|jpeg|png|gif)$/i.test(url) ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Xem ảnh lớn"
                        >
                          <img src={url} alt={`attachment-${idx + 1}`} />
                        </a>
                      ) : (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {url.split("/").pop()}
                        </a>
                      )}
                      {/* Nút X xóa file */}
                      <button
                        type="button"
                        className="attachment-delete-btn"
                        onClick={() => {
                          setDeleteUrl(url);
                          setShowDeleteModal(true);
                        }}
                        title="Xóa file"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
          {showDeleteModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowDeleteModal(false)}
            >
              <div
                className="modal-confirm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Xác nhận xóa file đính kèm</h3>
                </div>
                <div className="modal-body">
                  <p>Bạn có chắc chắn muốn xóa file này?</p>
                  {deleteUrl && /\.(jpg|jpeg|png|gif)$/i.test(deleteUrl) ? (
                    <div
                      style={{
                        margin: "12px 0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={deleteUrl}
                        alt="Ảnh muốn xóa"
                        style={{
                          maxWidth: 180,
                          maxHeight: 180,
                          borderRadius: 8,
                          border: "1px solid #eee",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                        }}
                      />
                    </div>
                  ) : (
                    <p style={{ wordBreak: "break-all", color: "#2563eb" }}>
                      {deleteUrl && deleteUrl.split("/").pop()}
                    </p>
                  )}
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={confirmDeleteAttachment}
                    disabled={loading}
                  >
                    Xác nhận xóa
                  </button>
                </div>
              </div>
            </div>
          )}
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
