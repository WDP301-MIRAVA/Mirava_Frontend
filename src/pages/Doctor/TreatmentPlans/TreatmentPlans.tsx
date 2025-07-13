import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { DoctorService } from "@/services/doctor.service";
import { message, Select, DatePicker, Input, Form, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { userServ } from "../../../services/userServie";
import { LogoutOutlined } from "@ant-design/icons";
import axios from "axios";
import "./TreatmentPlans.css";
import moment from "moment";
import { BASE_URL } from "@/services/config";

const { Option } = Select;
const { TextArea } = Input;

interface Doctor {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
  };
  degree: string;
  specialty: string;
  workSchedule: string[];
  description: string;
  imageUrl: string;
}

interface Patient {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
  };
}

type TreatmentMethod = "IUI" | "IVF" | null;

interface MonitoringItem {
  day: number;
  type: string;
  notes: string;
  instructions?: string; // Optional field for additional instructions
  time?: string; // Optional field for time of the monitoring
}
interface DailyDetail {
  medication: string;
  dosage: string;
  instructions?: string; // Optional field for additional instructions
  time?: string; // Optional field for time of the medication
}

interface TreatmentPlanData {
  patientCodeOrPhone: string;
  doctor: string;
  cycleStartDate: string;
  ovarianStimulation: {
    startDay: number;
    durationDays: number;
    medication: string;
    dailyDosage: string;
    monitoringSchedule: MonitoringItem[];
    dailyDetails: DailyDetail[];
    instructions?: string; // Optional field for additional instructions
    time?: string; // Optional field for time of the stimulation
  };
  hcgInjection: {
    plannedDate: string;
    medication: string;
    dosage: string;
  };
  eggRetrieval: {
    plannedDate: string;
    notes: string;
  };
  embryoTransfer: {
    plannedDate: string;
    embryoStage: string;
  };
  postTransferMonitoring: {
    betaHcgTestDate: string;
    ultrasoundCheckDate: string;
  };
  reminders: {
    type: string;
    content: string;
    sendTime: string;
  }[];
  status: string;
  notes: string;
}

const TreatmentPlans: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<"selection" | "form">(
    "selection"
  );
  const [selectedMethod, setSelectedMethod] = useState<TreatmentMethod>(null);
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dailyDetails, setDailyDetails] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [monitoringSchedule, setMonitoringSchedule] = useState<
    MonitoringItem[]
  >([{ day: 5, type: "ultrasound", notes: "Kiểm tra kích thước nang trứng" }]);
  const [reminders, setReminders] = useState<any[]>([
    {
      type: "medication_reminder",
      content: "Nhớ tiêm thuốc vào buổi tối",
      sendTime: moment().add(1, "days").format(),
    },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorInfoAndPatients = async () => {
      setIsLoading(true);
      try {
        // Lấy thông tin bác sĩ
        const doctorRes = await DoctorService.getDoctorAppointments();
        const doctorData = doctorRes.data;
        if (
          doctorData.success &&
          Array.isArray(doctorData.data) &&
          doctorData.data.length > 0 &&
          doctorData.data[0].doctor
        ) {
          setDoctorInfo(doctorData.data[0].doctor);
        } else {
          console.error("Không tìm thấy thông tin bác sĩ");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          message.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setTimeout(() => navigate("/login"), 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorInfoAndPatients();
  }, [navigate]);

  const handleMethodSelect = (method: TreatmentMethod) => {
    setSelectedMethod(method);
    setCurrentPage("form");
  };

  const addMonitoringSchedule = () => {
    setMonitoringSchedule([
      ...monitoringSchedule,
      { day: 0, type: "ultrasound", notes: "" },
    ]);
  };

  const updateMonitoringSchedule = (
    index: number,
    field: string,
    value: any
  ) => {
    const updatedSchedule = [...monitoringSchedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setMonitoringSchedule(updatedSchedule);
  };

  const removeMonitoringSchedule = (index: number) => {
    const updatedSchedule = [...monitoringSchedule];
    updatedSchedule.splice(index, 1);
    setMonitoringSchedule(updatedSchedule);
  };

  const addReminder = () => {
    setReminders([
      ...reminders,
      { type: "medication_reminder", content: "", sendTime: moment().format() },
    ]);
  };

  const updateReminder = (index: number, field: string, value: any) => {
    const updatedReminders = [...reminders];
    updatedReminders[index] = { ...updatedReminders[index], [field]: value };
    setReminders(updatedReminders);
  };

  const removeReminder = (index: number) => {
    const updatedReminders = [...reminders];
    updatedReminders.splice(index, 1);
    setReminders(updatedReminders);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const treatmentPlanData = {
        patientCodeOrPhone: values.patientInput,
        cycleStartDate: moment(values.cycleStartDate).format("YYYY-MM-DD"),
        treatmentType: selectedMethod, // "IVF" hoặc "IUI"
        notes: values.notes,
        status: values.status,
        reminders: reminders.map((item) => ({
          ...item,
          sent: false,
        })),
      };

      // Gửi dữ liệu đến API
      const response = await axios.post(
        `${BASE_URL}/api/treatment-plan`,
        treatmentPlanData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data.success) {
        message.success("Kế hoạch điều trị đã được tạo thành công!");
        setCurrentPage("selection");
        form.resetFields();
      } else {
        message.error("Có lỗi xảy ra: " + response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi tạo kế hoạch điều trị:", error);
      if (axios.isAxiosError(error)) {
        message.error(
          `Lỗi: ${
            error.response?.data?.message || "Đã xảy ra lỗi khi gửi dữ liệu"
          }`
        );
      } else {
        message.error("Đã xảy ra lỗi khi tạo kế hoạch điều trị");
      }
    }
  };

  const handleBack = () => {
    setCurrentPage("selection");
    setSelectedMethod(null);
    form.resetFields();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");
      if (refreshToken && accessToken) {
        await userServ.postLogout(refreshToken, accessToken);
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      message.success("Đăng xuất thành công!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Đăng xuất thất bại!");
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin bác sĩ...</p>
      </div>
    );
  }

  if (!doctorInfo) {
    return (
      <div className="loading-container">
        <div className="error-message">
          <h2>Không thể tải thông tin bác sĩ</h2>
          <p>
            Phiên làm việc đã hết hạn hoặc đã xảy ra lỗi. Vui lòng đăng nhập
            lại.
          </p>
          <button
            className="login-again-button"
            onClick={() => navigate("/login")}
            style={{
              padding: "10px 20px",
              background: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "15px",
            }}
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  const handleDailyDetailChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setDailyDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="view-appointment-container">
      {/* Doctor Header - Giống với ViewAppointment */}
      <div className="doctor-header">
        <div className="doctor-avatar">
          <img
            src={doctorInfo.imageUrl || "https://via.placeholder.com/150"}
            alt="Doctor avatar"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/150";
            }}
          />
        </div>
        <div className="doctor-info">
          <h1 className="doctor-name">
            {doctorInfo.user?.userName || "Bác sĩ"}
          </h1>
          <div className="doctor-details">
            <div className="detail-item">
              <GraduationCap size={16} />
              <span>{doctorInfo.degree || "Chưa cập nhật"}</span>
            </div>
            <div className="detail-item">
              <User size={16} />
              <span>{doctorInfo.specialty || "Chưa cập nhật"}</span>
            </div>
            <div className="detail-item">
              <Mail size={16} />
              <span>{doctorInfo.user?.email || "Chưa cập nhật"}</span>
            </div>
            <div className="detail-item">
              <Phone size={16} />
              <span>{doctorInfo.user?.phone || "Chưa cập nhật"}</span>
            </div>
          </div>
          <p className="doctor-description">
            {doctorInfo.description || "Chưa có mô tả"}
          </p>
          <div className="work-schedule">
            <Clock size={16} />
            <span>
              Lịch làm việc:{" "}
              {doctorInfo.workSchedule?.join(", ") || "Chưa cập nhật"}
            </span>
          </div>
        </div>
        
      </div>

      {currentPage === "selection" ? (
        <div className="method-selection-container">
          <h2 className="method-selection-title">Tạo Kế Hoạch Điều Trị</h2>
          <p className="method-selection-subtitle">
            Vui lòng chọn phương pháp điều trị phù hợp cho bệnh nhân
          </p>

          {/* IUI */}
          <div
            className="method-option method-iui"
            onClick={() => handleMethodSelect("IUI")}
          >
            <div className="method-circle iui-circle">IUI</div>
            <div className="method-title">Thụ tinh nhân tạo trong tử cung</div>
            <p className="method-description">
              Phương pháp đưa tinh trùng đã được xử lý trực tiếp vào tử cung của
              người phụ nữ vào thời điểm rụng trứng.
            </p>
            <span className="method-choose">
              Chọn phương pháp này <ChevronRight size={16} />
            </span>
          </div>

          {/* IVF */}
          <div
            className="method-option method-ivf"
            onClick={() => handleMethodSelect("IVF")}
          >
            <div className="method-circle ivf-circle">IVF</div>
            <div className="method-title">Thụ tinh ống nghiệm</div>
            <p className="method-description">
              Phương pháp thụ tinh trứng với tinh trùng bên ngoài cơ thể, sau đó
              chuyển phôi về tử cung.
            </p>
            <span className="method-choose">
              Chọn phương pháp này <ChevronRight size={16} />
            </span>
          </div>
        </div>
      ) : (
        <div className="treatment-form-container">
          <div className="treatment-form-header">
            <div>
              <h2>
                {selectedMethod === "IVF"
                  ? "Kế hoạch điều trị IVF"
                  : "Kế hoạch điều trị IUI"}
              </h2>
              <p>Vui lòng điền đầy đủ thông tin kế hoạch điều trị</p>
            </div>
            <button className="treatment-form-button" onClick={handleBack}>
              Quay lại
            </button>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: "planned",
            }}
          >
            <h3 className="section-title">Thông tin cơ bản</h3>
            <div className="form-grid">
              <Form.Item
                label="Số điện thoại hoặc mã bệnh nhân"
                name="patientInput"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại hoặc mã bệnh nhân!",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại hoặc mã bệnh nhân" />
              </Form.Item>

              <Form.Item
                label="Ngày bắt đầu chu kỳ"
                name="cycleStartDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </div>

            <h3 className="section-title">Nhắc nhở</h3>
            {reminders.map((item, index) => (
              <div
                key={index}
                className="reminder-item"
                style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
              >
                <div style={{ flex: "1" }}>
                  <label>Loại nhắc nhở</label>
                  <Select
                    value={item.type}
                    onChange={(value) => updateReminder(index, "type", value)}
                    style={{ width: "100%" }}
                  >
                    <Option value="medication_reminder">Nhắc uống thuốc</Option>
                    <Option value="appointment_reminder">Nhắc lịch hẹn</Option>
                    <Option value="test_reminder">Nhắc xét nghiệm</Option>
                    <Option value="other_reminder">Khác</Option>
                  </Select>
                </div>
                <div style={{ flex: "2" }}>
                  <label>Nội dung</label>
                  <Input
                    value={item.content}
                    onChange={(e) =>
                      updateReminder(index, "content", e.target.value)
                    }
                  />
                </div>
                <div style={{ flex: "1" }}>
                  <label>Thời gian gửi</label>
                  <DatePicker
                    showTime
                    format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
                    value={moment(item.sendTime)}
                    onChange={(date) =>
                      updateReminder(
                        index,
                        "sendTime",
                        date ? date.toISOString() : null
                      )
                    }
                    style={{ width: "100%" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <Button danger onClick={() => removeReminder(index)}>
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={addReminder}
              style={{ marginBottom: "20px" }}
            >
              + Thêm nhắc nhở
            </Button>

            <h3 className="section-title">Thông tin khác</h3>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select>
                <Option value="planned">Đã lên kế hoạch</Option>
                <Option value="in_progress">Đang thực hiện</Option>
                <Option value="completed">Hoàn thành</Option>
                <Option value="cancelled">Đã hủy</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <TextArea
                rows={4}
                placeholder="Ghi chú bổ sung cho kế hoạch điều trị..."
              />
            </Form.Item>

            <div className="button-actions">
              <Button onClick={handleBack}>Hủy bỏ</Button>
              <Button type="primary" onClick={handleSubmit}>
                Tạo kế hoạch điều trị
              </Button>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlans;
