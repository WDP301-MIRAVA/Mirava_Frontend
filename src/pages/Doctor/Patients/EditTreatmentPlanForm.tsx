import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EditableTreatmentPlan.css";
import { TreatmentPlanService } from "../../../services/treatmentPlan.service";
import { toast } from "react-hot-toast";

interface Props {
  planId: string;
  onCancel?: () => void;
}

const EditTreatmentPlanForm: React.FC<Props> = ({ planId, onCancel }) => {
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await axios.get(
          `https://mirava-f0rz.onrender.com/api/treatment-plan`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data.data.find((p: any) => p._id === planId);

        // Thêm patientId và doctorId vào formData
        setFormData({
          ...data,
          patientId:
            typeof data.patient === "string" ? data.patient : data.patient?._id,
          doctorId:
            typeof data.doctor === "string" ? data.doctor : data.doctor?._id,
        });
      } catch (err) {
        console.error("Lỗi lấy kế hoạch điều trị:", err);
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
      [group]: { ...prev[group], [key]: value },
    }));
  };

  useEffect(() => {
    if (
      formData?.ovarianStimulation?.durationDays !== undefined &&
      formData.ovarianStimulation.dailyDetails
    ) {
      const newDays = formData.ovarianStimulation.durationDays;
      const prevDetails = formData.ovarianStimulation.dailyDetails;
      let newArr = [...prevDetails];

      // Nếu số ngày mới nhỏ hơn, chỉ cắt bớt mảng
      if (newDays < prevDetails.length) {
        newArr = prevDetails.slice(0, newDays);
      }
      // Nếu số ngày mới lớn hơn, thêm các phần tử mới với dữ liệu mặc định
      else if (newDays > prevDetails.length) {
        for (let i = prevDetails.length; i < newDays; i++) {
          newArr[i] = {
            medication: formData.ovarianStimulation.medication || "",
            dosage: formData.ovarianStimulation.dailyDosage || "",
            instructions: formData.ovarianStimulation.instructions || "",
            time: formData.ovarianStimulation.time || "",
          };
        }
      }

      setFormData((prevForm: any) => ({
        ...prevForm,
        ovarianStimulation: {
          ...prevForm.ovarianStimulation,
          dailyDetails: newArr,
        },
      }));
    }
    // eslint-disable-next-line
  }, [formData?.ovarianStimulation?.durationDays]);

  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Đảm bảo dailyDetails luôn là mảng đủ số ngày
      const durationDays = formData.ovarianStimulation.durationDays || 0;
      const dailyDetails = [];
      for (let i = 0; i < durationDays; i++) {
        const d = formData.ovarianStimulation.dailyDetails?.[i];
        dailyDetails[i] =
          d && typeof d === "object"
            ? {
                medication: d.medication || "",
                dosage: d.dosage || "",
                instructions: d.instructions || "",
                time: d.time || "",
              }
            : { medication: "", dosage: "", instructions: "", time: "" };
      }
      // Đảm bảo monitoringSchedule đủ trường
      const monitoringSchedule = (
        formData.ovarianStimulation.monitoringSchedule || []
      ).map((item: any) => ({
        day: item.day,
        type: item.type,
        notes: item.notes,
        instructions: item.instructions || "",
        time: item.time || "",
      }));

      const payload = {
        patient: formData.patientId,
        doctor: formData.doctorId,
        cycleStartDate: formData.cycleStartDate,
        ovarianStimulation: {
          startDay: formData.ovarianStimulation.startDay,
          durationDays: formData.ovarianStimulation.durationDays,
          medication: formData.ovarianStimulation.medication,
          dailyDosage: formData.ovarianStimulation.dailyDosage,
          monitoringSchedule,
          instructions: formData.ovarianStimulation.instructions || "",
          time: formData.ovarianStimulation.time || "",
          dailyDetails,
        },
        hcgInjection: formData.hcgInjection,
        eggRetrieval: formData.eggRetrieval,
        embryoTransfer: formData.embryoTransfer,
        postTransferMonitoring: formData.postTransferMonitoring,
        reminders: formData.reminders,
        notes: formData.notes,
        status: formData.status,
      };

      // Log để kiểm tra trước khi gửi
      console.log("Payload gửi lên:", payload);

      const response = await TreatmentPlanService.updateTreatmentPlanById(
        planId,
        payload
      );
      console.log("Dữ liệu đã lưu vào database:", response.data.data);
      toast.success("Cập nhật kế hoạch điều trị thành công!", {
        duration: 2000,
        position: "top-right",
      });
      if (onCancel) {
        setTimeout(() => onCancel(), 1500);
      }
    } catch (err: any) {
      console.error("Lỗi khi cập nhật:", err.response || err);
      toast.error("❌ Cập nhật thất bại!", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) return <p>⏳ Đang tải dữ liệu kế hoạch...</p>;

  return (
    <div className="edit-treatment-container">
      <h3>✏️ Cập nhật kế hoạch điều trị</h3>

      <div className="edit-treatment-row">
        <span className="edit-treatment-label">Trạng thái:</span>
        <select
          className="edit-treatment-input"
          value={formData.status || "planned"}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="planned">Đã lên kế hoạch</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="edit-treatment-row">
        <span className="edit-treatment-label">📅 Ngày bắt đầu chu kỳ:</span>
        <input
          type="date"
          className="edit-treatment-input"
          value={formData.cycleStartDate?.split("T")[0]}
          onChange={(e) => handleChange("cycleStartDate", e.target.value)}
        />
      </div>

      <div className="edit-treatment-row">
        <span className="edit-treatment-label">📝 Ghi chú:</span>
        <textarea
          className="edit-treatment-textarea"
          value={formData.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value)}
        />
      </div>

      {formData.ovarianStimulation && (
        <>
          <h4>🧬 Kích thích buồng trứng</h4>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày bắt đầu:</span>
            <input
              type="number"
              className="edit-treatment-input"
              value={formData.ovarianStimulation.startDay || ""}
              onChange={(e) =>
                updateNested(
                  "ovarianStimulation",
                  "startDay",
                  parseInt(e.target.value)
                )
              }
            />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Số ngày:</span>
            <input
              type="number"
              className="edit-treatment-input"
              value={formData.ovarianStimulation.durationDays || ""}
              onChange={(e) =>
                updateNested(
                  "ovarianStimulation",
                  "durationDays",
                  parseInt(e.target.value)
                )
              }
            />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Thuốc:</span>
            <input
              className="edit-treatment-input"
              value={formData.ovarianStimulation.medication || ""}
              onChange={(e) =>
                updateNested("ovarianStimulation", "medication", e.target.value)
              }
            />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Liều dùng:</span>
            <input
              className="edit-treatment-input"
              value={formData.ovarianStimulation.dailyDosage || ""}
              onChange={(e) =>
                updateNested(
                  "ovarianStimulation",
                  "dailyDosage",
                  e.target.value
                )
              }
            />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Hướng dẫn dùng thuốc:</span>
            <textarea
              className="edit-treatment-textarea"
              value={formData.ovarianStimulation.instructions || ""}
              onChange={(e) =>
                updateNested(
                  "ovarianStimulation",
                  "instructions",
                  e.target.value
                )
              }
            />
          </div>

          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Giờ dùng thuốc:</span>
            <input
              type="time"
              className="edit-treatment-input"
              value={formData.ovarianStimulation.time || ""}
              onChange={(e) =>
                updateNested("ovarianStimulation", "time", e.target.value)
              }
            />
          </div>
          <div style={{ margin: "12px 0" }}>
            <b>Lịch theo dõi:</b>
            {formData.ovarianStimulation.monitoringSchedule?.map(
              (item: any, idx: number) => (
                <div
                  key={idx}
                  className="edit-treatment-row"
                  style={{ border: "1px solid #eee", margin: 4, padding: 8 }}
                >
                  <span className="edit-treatment-label">Ngày thứ:</span>
                  <input
                    type="number"
                    className="edit-treatment-input"
                    value={item.day || ""}
                    onChange={(e) => {
                      const newSchedule = [
                        ...formData.ovarianStimulation.monitoringSchedule,
                      ];
                      newSchedule[idx] = {
                        ...newSchedule[idx],
                        day: parseInt(e.target.value),
                      };
                      updateNested(
                        "ovarianStimulation",
                        "monitoringSchedule",
                        newSchedule
                      );
                    }}
                  />
                  <span className="edit-treatment-label">Loại:</span>
                  <input
                    className="edit-treatment-input"
                    value={item.type || ""}
                    onChange={(e) => {
                      const newSchedule = [
                        ...formData.ovarianStimulation.monitoringSchedule,
                      ];
                      newSchedule[idx] = {
                        ...newSchedule[idx],
                        type: e.target.value,
                      };
                      updateNested(
                        "ovarianStimulation",
                        "monitoringSchedule",
                        newSchedule
                      );
                    }}
                  />
                  <span className="edit-treatment-label">Ghi chú:</span>
                  <input
                    className="edit-treatment-input"
                    value={item.notes || ""}
                    onChange={(e) => {
                      const newSchedule = [
                        ...formData.ovarianStimulation.monitoringSchedule,
                      ];
                      newSchedule[idx] = {
                        ...newSchedule[idx],
                        notes: e.target.value,
                      };
                      updateNested(
                        "ovarianStimulation",
                        "monitoringSchedule",
                        newSchedule
                      );
                    }}
                  />
                  <span className="edit-treatment-label">Hướng dẫn:</span>
                  <input
                    className="edit-treatment-input"
                    value={item.instructions || ""}
                    onChange={(e) => {
                      const newSchedule = [
                        ...formData.ovarianStimulation.monitoringSchedule,
                      ];
                      newSchedule[idx] = {
                        ...newSchedule[idx],
                        instructions: e.target.value,
                      };
                      updateNested(
                        "ovarianStimulation",
                        "monitoringSchedule",
                        newSchedule
                      );
                    }}
                  />
                  <span className="edit-treatment-label">Thời gian:</span>
                  <input
                    className="edit-treatment-input"
                    value={item.time || ""}
                    onChange={(e) => {
                      const newSchedule = [
                        ...formData.ovarianStimulation.monitoringSchedule,
                      ];
                      newSchedule[idx] = {
                        ...newSchedule[idx],
                        time: e.target.value,
                      };
                      updateNested(
                        "ovarianStimulation",
                        "monitoringSchedule",
                        newSchedule
                      );
                    }}
                  />
                </div>
              )
            )}
          </div>
        </>
      )}

      {formData.ovarianStimulation.dailyDetails?.length > 0 && (
        <>
          <h5>📋 Chi tiết theo ngày</h5>
          {formData.ovarianStimulation.dailyDetails.map(
            (detail: any, index: number) => (
              <div key={index} className="edit-treatment-row">
                <span className="edit-treatment-label">Ngày {index + 1}:</span>
                <input
                  className="edit-treatment-input"
                  placeholder="Thuốc"
                  value={detail.medication}
                  onChange={(e) => {
                    const updated = [
                      ...formData.ovarianStimulation.dailyDetails,
                    ];
                    updated[index].medication = e.target.value;
                    updateNested("ovarianStimulation", "dailyDetails", updated);
                  }}
                />
                <input
                  className="edit-treatment-input"
                  placeholder="Liều"
                  value={detail.dosage}
                  onChange={(e) => {
                    const updated = [
                      ...formData.ovarianStimulation.dailyDetails,
                    ];
                    updated[index].dosage = e.target.value;
                    updateNested("ovarianStimulation", "dailyDetails", updated);
                  }}
                />
                <input
                  className="edit-treatment-input"
                  placeholder="Hướng dẫn"
                  value={detail.instructions}
                  onChange={(e) => {
                    const updated = [
                      ...formData.ovarianStimulation.dailyDetails,
                    ];
                    updated[index].instructions = e.target.value;
                    updateNested("ovarianStimulation", "dailyDetails", updated);
                  }}
                />
                <input
                  className="edit-treatment-input"
                  placeholder="Giờ"
                  value={detail.time}
                  onChange={(e) => {
                    const updated = [
                      ...formData.ovarianStimulation.dailyDetails,
                    ];
                    updated[index].time = e.target.value;
                    updateNested("ovarianStimulation", "dailyDetails", updated);
                  }}
                />
              </div>
            )
          )}
        </>
      )}

      {formData.hcgInjection && (
        <>
          <h4>💉 Tiêm HCG</h4>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày tiêm:</span>
            <input
              type="datetime-local"
              className="edit-treatment-input"
              value={formData.hcgInjection.plannedDate?.slice(0, 16)}
              onChange={(e) =>
                updateNested("hcgInjection", "plannedDate", e.target.value)
              }
            />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Thuốc:</span>
            <input
              className="edit-treatment-input"
              value={formData.hcgInjection.medication || ""}
              onChange={(e) =>
                updateNested("hcgInjection", "medication", e.target.value)
              }
            />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Liều lượng:</span>
            <input
              className="edit-treatment-input"
              value={formData.hcgInjection.dosage || ""}
              onChange={(e) =>
                updateNested("hcgInjection", "dosage", e.target.value)
              }
            />
          </div>
        </>
      )}

      {formData.eggRetrieval && (
        <>
          <h4>🥚 Lấy trứng</h4>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày thực hiện:</span>
            <input
              type="datetime-local"
              className="edit-treatment-input"
              value={formData.eggRetrieval.plannedDate?.slice(0, 16)}
              onChange={(e) =>
                updateNested("eggRetrieval", "plannedDate", e.target.value)
              }
            />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Hướng dẫn:</span>
            <textarea
              className="edit-treatment-textarea"
              value={formData.eggRetrieval.instructions || ""}
              onChange={(e) =>
                updateNested("eggRetrieval", "instructions", e.target.value)
              }
            />
          </div>
        </>
      )}

      {formData.embryoTransfer && (
        <>
          <h4>🧫 Chuyển phôi</h4>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày chuyển:</span>
            <input
              type="datetime-local"
              className="edit-treatment-input"
              value={formData.embryoTransfer.plannedDate?.slice(0, 16)}
              onChange={(e) =>
                updateNested("embryoTransfer", "plannedDate", e.target.value)
              }
            />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Giai đoạn phôi:</span>
            <input
              className="edit-treatment-input"
              value={formData.embryoTransfer.embryoStage || ""}
              onChange={(e) =>
                updateNested("embryoTransfer", "embryoStage", e.target.value)
              }
            />
          </div>
        </>
      )}

      {formData.postTransferMonitoring && (
        <>
          <h4>🔬 Theo dõi sau chuyển phôi</h4>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">
              Ngày xét nghiệm Beta HCG:
            </span>
            <input
              type="datetime-local"
              className="edit-treatment-input"
              value={formData.postTransferMonitoring.betaHcgTestDate?.slice(
                0,
                16
              )}
              onChange={(e) =>
                updateNested(
                  "postTransferMonitoring",
                  "betaHcgTestDate",
                  e.target.value
                )
              }
            />
          </div>
          <div className="edit-treatment-row">
            <span className="edit-treatment-label">Ngày siêu âm kiểm tra:</span>
            <input
              type="datetime-local"
              className="edit-treatment-input"
              value={formData.postTransferMonitoring.ultrasoundCheckDate?.slice(
                0,
                16
              )}
              onChange={(e) =>
                updateNested(
                  "postTransferMonitoring",
                  "ultrasoundCheckDate",
                  e.target.value
                )
              }
            />
          </div>
        </>
      )}

      <div className="edit-treatment-actions">
        <button
          className="back-button"
          onClick={onCancel}
          style={{
            backgroundColor: "#f0f0f0",
            color: "#333",
            marginRight: "10px",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ⬅️ Quay lại
        </button>
        <button
          className="save-button"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "💾 Đang lưu..." : "💾 Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
};

export default EditTreatmentPlanForm;
