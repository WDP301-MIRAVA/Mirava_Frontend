import { Modal, message } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { WorkScheduleService } from "@/services/work-schedule.service";
import toast from "react-hot-toast";

export default function SpecialDateModal({
  open,
  onClose,
  doctorId,
  onSuccess,
}) {
  const [formState, setFormState] = useState({
    date: "",
    isWorking: false,
    startTime: "",
    endTime: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formState.date) {
      return message.error("Vui lòng chọn ngày");
    }

    try {
      const payload = {
        date: formState.date,
        isWorking: formState.isWorking,
        startTime: formState.startTime,
        endTime: formState.endTime,
        note: formState.note,
      };

      setLoading(true);
      await WorkScheduleService.addSpecialDate(doctorId, payload);
      toast.success("Cập nhật ngày đặc biệt thành công");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Lỗi khi thêm ngày đặc biệt:", err);
      toast.error(
        err?.response?.data?.message ?? "Thêm ngày đặc biệt thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Thêm ngày đặc biệt"
      onCancel={onClose}
      onOk={handleSubmit}
      okText={loading ? "Đang lưu..." : "Lưu"}
      okButtonProps={{ disabled: loading }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Ngày</label>
          <input
            type="date"
            value={formState.date}
            onChange={(e) => handleChange("date", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Có làm việc không?</label>
          <input
            type="checkbox"
            checked={formState.isWorking}
            onChange={(e) => handleChange("isWorking", e.target.checked)}
            style={{ transform: "scale(1.3)" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Giờ bắt đầu</label>
            <input
              type="time"
              value={formState.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Giờ kết thúc</label>
            <input
              type="time"
              value={formState.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Ghi chú</label>
          <input
            type="text"
            value={formState.note}
            onChange={(e) => handleChange("note", e.target.value)}
            placeholder="Ghi chú thêm (nếu có)"
            style={inputStyle}
          />
        </div>
      </div>
    </Modal>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: 4,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 500,
};
