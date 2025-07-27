import { Modal, message } from "antd";
import { useState, useEffect } from "react";
import { WorkScheduleService } from "@/services/work-schedule.service";
import toast from "react-hot-toast";

const daysOfWeek = [
  { label: "Chủ nhật", value: 0 },
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
];
export interface ScheduleItem {
  dayOfWeek: string | number;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  maxPatients: number;
}
interface CreateScheduleModalProps {
  open: boolean;
  onClose?: () => void;
  doctorId: string;
  onSuccess?: () => void;
  currentSchedules: ScheduleItem[];
}

export default function CreateScheduleModal({
  open,
  onClose,
  doctorId,
  onSuccess,
  currentSchedules = [],
}: CreateScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([
    {
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      breakStartTime: "",
      breakEndTime: "",
      maxPatients: 1,
    },
  ]);
  // Thêm useEffect để fill dữ liệu khi mở modal
  useEffect(() => {
    if (open) {
      if (currentSchedules && currentSchedules.length > 0) {
        setSchedules(
          currentSchedules.map((item) => ({
            dayOfWeek: String(item.dayOfWeek ?? ""),
            startTime: item.startTime ?? "",
            endTime: item.endTime ?? "",
            breakStartTime: item.breakStartTime ?? "",
            breakEndTime: item.breakEndTime ?? "",
            maxPatients: item.maxPatients ?? 1,
          }))
        );
      } else {
        setSchedules([
          {
            dayOfWeek: "",
            startTime: "",
            endTime: "",
            breakStartTime: "",
            breakEndTime: "",
            maxPatients: 1,
          },
        ]);
      }
    }
  }, [open, currentSchedules]);

  interface ScheduleItem {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    breakStartTime: string;
    breakEndTime: string;
    maxPatients: number;
  }

  type ScheduleField = keyof ScheduleItem;

  const handleChange = (
    index: number,
    field: ScheduleField,
    value: string | number
  ) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value as never;
    setSchedules(newSchedules);
  };

  const handleAdd = () => {
    setSchedules([
      ...schedules,
      {
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        breakStartTime: "",
        breakEndTime: "",
        maxPatients: 1,
      },
    ]);
  };

  const handleRemove = (index: number): void => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      schedules.some(
        (s) => !s.dayOfWeek || !s.startTime || !s.endTime || !s.maxPatients
      )
    ) {
      message.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const payload = {
      doctorId,
      schedules: schedules.map((s) => ({
        ...s,
        dayOfWeek: parseInt(s.dayOfWeek),
        maxPatients:
          typeof s.maxPatients === "string"
            ? parseInt(s.maxPatients)
            : s.maxPatients,
      })),
    };

    try {
      setLoading(true);
      await WorkScheduleService.createSchedule(payload);
      toast.success("Tạo lịch thành công");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo lịch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={loading ? "Đang lưu..." : "Lưu lịch"}
      okButtonProps={{ disabled: loading }}
      title="Tạo lịch làm việc"
      width={1000}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {schedules.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              borderBottom: "1px solid #eee",
              paddingBottom: 10,
            }}
          >
            <div style={{ flex: "0 0 120px" }}>
              <label style={{ fontWeight: 500 }}>Thứ</label>
              <select
                value={item.dayOfWeek}
                onChange={(e) =>
                  handleChange(index, "dayOfWeek", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "6px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">-- Chọn --</option>
                {daysOfWeek.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: "0 0 120px" }}>
              <label style={{ fontWeight: 500 }}>Giờ bắt đầu</label>
              <input
                type="time"
                value={item.startTime}
                onChange={(e) =>
                  handleChange(index, "startTime", e.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div style={{ flex: "0 0 120px" }}>
              <label style={{ fontWeight: 500 }}>Giờ kết thúc</label>
              <input
                type="time"
                value={item.endTime}
                onChange={(e) => handleChange(index, "endTime", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ flex: "0 0 120px" }}>
              <label style={{ fontWeight: 500 }}>Nghỉ bắt đầu</label>
              <input
                type="time"
                value={item.breakStartTime}
                onChange={(e) =>
                  handleChange(index, "breakStartTime", e.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div style={{ flex: "0 0 120px" }}>
              <label style={{ fontWeight: 500 }}>Nghỉ kết thúc</label>
              <input
                type="time"
                value={item.breakEndTime}
                onChange={(e) =>
                  handleChange(index, "breakEndTime", e.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div style={{ flex: "0 0 100px" }}>
              <label style={{ fontWeight: 500 }}>Tối đa BN</label>
              <input
                type="number"
                min={1}
                value={item.maxPatients}
                onChange={(e) =>
                  handleChange(index, "maxPatients", e.target.value)
                }
                style={inputStyle}
              />
            </div>

            <button
              onClick={() => handleRemove(index)}
              style={{
                background: "#ff4d4f",
                color: "#fff",
                padding: "6px 10px",
                border: "none",
                borderRadius: 4,
                marginTop: 22,
                cursor: "pointer",
              }}
            >
              Xoá
            </button>
          </div>
        ))}

        <div>
          <button
            onClick={handleAdd}
            style={{
              padding: "8px 16px",
              background: "#1677ff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            + Thêm dòng
          </button>
        </div>
      </div>
    </Modal>
  );
}

const inputStyle = {
  width: "100%",
  padding: "6px",
  borderRadius: 4,
  border: "1px solid #ccc",
};
