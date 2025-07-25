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
    vitals: {
      bloodPressure: "",
      heartRate: "",
      weight: "",
      temperature: "",
    },
    hormoneLevels: {
      fsh: "",
      lh: "",
      estradiol: "",
      progesterone: "",
    },
    ultrasound: {
      follicleCount: "",
      endometrialThickness: "",
      leftOvary: "",
      rightOvary: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);

  useEffect(() => {
    if (medicalRecord) {
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
        vitals: medicalRecord.vitals || {
          bloodPressure: "",
          heartRate: "",
          weight: "",
          temperature: "",
        },
        hormoneLevels: medicalRecord.hormoneLevels || {
          fsh: "",
          lh: "",
          estradiol: "",
          progesterone: "",
        },
        ultrasound: medicalRecord.ultrasound || {
          follicleCount: "",
          endometrialThickness: "",
          leftOvary: "",
          rightOvary: "",
        },
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
        vitals: {
          bloodPressure: "",
          heartRate: "",
          weight: "",
          temperature: "",
        },
        hormoneLevels: {
          fsh: "",
          lh: "",
          estradiol: "",
          progesterone: "",
        },
        ultrasound: {
          follicleCount: "",
          endometrialThickness: "",
          leftOvary: "",
          rightOvary: "",
        },
      });
    }
  }, [medicalRecord, step]);

  const medicalRecordId =
    step?.medicalRecords && step.medicalRecords.length > 0
      ? step.medicalRecords[0]
      : null;

  const patientId = treatmentPlan?.patient;
  const doctorId = treatmentPlan?.doctor?._id;
  const type = form.type || step?.type || "Khám";
  let treatmentEventId: string | null = null;
  if (step?.id && treatmentPlan?.treatmentEvents) {
    const stepIndex = parseInt(step.id) - 1;
    if (stepIndex >= 0 && stepIndex < treatmentPlan.treatmentEvents.length) {
      treatmentEventId = treatmentPlan.treatmentEvents[stepIndex]._id;
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const confirmDeleteAttachment = async () => {
    if (!deleteUrl) return;
    await handleDeleteAttachment(deleteUrl);
    setShowDeleteModal(false);
    setDeleteUrl(null);
  };

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
    console.log("✅ Submit form:");
    console.log("patientId:", patientId);
    console.log("doctorId:", doctorId);
    console.log("treatmentEventId:", treatmentEventId);
    console.log("form.attachments:", form.attachments);
    console.log("files:", files);
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
      formData.append("vitals", JSON.stringify(form.vitals));
      formData.append("hormoneLevels", JSON.stringify(form.hormoneLevels));
      formData.append("ultrasound", JSON.stringify(form.ultrasound));
      formData.append(
        "attachments",
        JSON.stringify(form.attachments.filter((a) => a.trim() !== ""))
      );

      if (files.length > 0) {
        files.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      let response;
      const isValidId =
        typeof medicalRecordId === "string" &&
        medicalRecordId.trim().length === 24;
      if (isValidId) {
        try {
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
        } catch (err: any) {
          // Nếu lỗi 404 thì fallback sang tạo mới
          if (err.response && err.response.status === 404) {
            console.warn("Không tìm thấy hồ sơ y tế, chuyển sang tạo mới!");
            response = await axiosInstance.post(
              "/api/medicalRecord",
              formData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          } else {
            throw err;
          }
        }
      } else {
        // Không có ID hợp lệ, tạo mới luôn
        console.warn("Không tìm thấy hồ sơ y tế, chuyển sang tạo mới!");
        response = await axiosInstance.post("/api/medicalRecord", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      console.log("Response backend:", response);
      if (response.data.success && response.data.data) {
        toast.success(
          medicalRecordId
            ? "Cập nhật hồ sơ thành công!"
            : "Tạo hồ sơ thành công!"
        );
        // Cập nhật toàn bộ form với dữ liệu mới từ backend
        const record = response.data.data;
        setForm({
          date: record.date
            ? new Date(record.date).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          type: record.type || step?.type || "Khám",
          title: record.title || step?.name || step?.title || "",
          findings: record.findings || "",
          conclusion: record.conclusion || "",
          attachments:
            Array.isArray(record.attachments) && record.attachments.length > 0
              ? record.attachments
              : [],
          notes: record.notes || "",
          vitals: record.vitals || {
            bloodPressure: "",
            heartRate: "",
            weight: "",
            temperature: "",
          },
          hormoneLevels: record.hormoneLevels || {
            fsh: "",
            lh: "",
            estradiol: "",
            progesterone: "",
          },
          ultrasound: record.ultrasound || {
            follicleCount: "",
            endometrialThickness: "",
            leftOvary: "",
            rightOvary: "",
          },
        });
        setFiles([]);
        if (onSuccess) {
          onSuccess(record);
        }
      } else {
        setError(response.data.message || "Không thể lưu hồ sơ y tế");
        console.error("❌ Error response:", response.data);
      }
    } catch (err: any) {
      console.error("❌ Error creating/updating medical record:", err);
      if (err.response) {
        console.error("Lỗi chi tiết từ backend:", err.response.data);
      }
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
              <div className="form-group">
                <label className="form-label">Dấu hiệu sinh tồn</label>
                <div className="vitals-row">
                  <input
                    type="text"
                    name="bloodPressure"
                    value={form.vitals.bloodPressure}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        vitals: {
                          ...prev.vitals,
                          bloodPressure: e.target.value,
                        },
                      }))
                    }
                    placeholder="Huyết áp (mmHg)"
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="heartRate"
                    value={form.vitals.heartRate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        vitals: { ...prev.vitals, heartRate: e.target.value },
                      }))
                    }
                    placeholder="Nhịp tim (lần/phút)"
                    className="form-input"
                  />
                  <input
                    type="number"
                    name="weight"
                    value={form.vitals.weight}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        vitals: { ...prev.vitals, weight: e.target.value },
                      }))
                    }
                    placeholder="Cân nặng (kg)"
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="temperature"
                    value={form.vitals.temperature}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        vitals: { ...prev.vitals, temperature: e.target.value },
                      }))
                    }
                    placeholder="Nhiệt độ (°C)"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Chỉ số hormone</label>
                <div className="hormone-row">
                  <input
                    type="number"
                    name="fsh"
                    value={form.hormoneLevels.fsh}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        hormoneLevels: {
                          ...prev.hormoneLevels,
                          fsh: e.target.value,
                        },
                      }))
                    }
                    placeholder="FSH"
                    className="form-input"
                  />
                  <input
                    type="number"
                    name="lh"
                    value={form.hormoneLevels.lh}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        hormoneLevels: {
                          ...prev.hormoneLevels,
                          lh: e.target.value,
                        },
                      }))
                    }
                    placeholder="LH"
                    className="form-input"
                  />
                  <input
                    type="number"
                    name="estradiol"
                    value={form.hormoneLevels.estradiol}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        hormoneLevels: {
                          ...prev.hormoneLevels,
                          estradiol: e.target.value,
                        },
                      }))
                    }
                    placeholder="Estradiol (E2)"
                    className="form-input"
                  />
                  <input
                    type="number"
                    name="progesterone"
                    value={form.hormoneLevels.progesterone}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        hormoneLevels: {
                          ...prev.hormoneLevels,
                          progesterone: e.target.value,
                        },
                      }))
                    }
                    placeholder="Progesterone (P4)"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Thông tin siêu âm</label>
                <div className="ultrasound-row">
                  <input
                    type="number"
                    name="follicleCount"
                    value={form.ultrasound.follicleCount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ultrasound: {
                          ...prev.ultrasound,
                          follicleCount: e.target.value,
                        },
                      }))
                    }
                    placeholder="Số nang noãn"
                    className="form-input"
                  />
                  <input
                    type="number"
                    name="endometrialThickness"
                    value={form.ultrasound.endometrialThickness}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ultrasound: {
                          ...prev.ultrasound,
                          endometrialThickness: e.target.value,
                        },
                      }))
                    }
                    placeholder="Độ dày nội mạc (mm)"
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="leftOvary"
                    value={form.ultrasound.leftOvary}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ultrasound: {
                          ...prev.ultrasound,
                          leftOvary: e.target.value,
                        },
                      }))
                    }
                    placeholder="Buồng trứng trái"
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="rightOvary"
                    value={form.ultrasound.rightOvary}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ultrasound: {
                          ...prev.ultrasound,
                          rightOvary: e.target.value,
                        },
                      }))
                    }
                    placeholder="Buồng trứng phải"
                    className="form-input"
                  />
                </div>
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
