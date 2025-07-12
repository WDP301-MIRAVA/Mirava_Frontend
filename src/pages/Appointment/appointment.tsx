import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Radio,
  Card,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "./appointment.css";
import { AppointmentService } from "@/services/appointment.service";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DoctorService } from "@/services/doctor.service";
import type { Doctor } from "@/services/doctor.service";
import { Service } from "@/services/service";
import toast from "react-hot-toast";
import { Modal } from "antd";
import axios from "axios";

const { TextArea } = Input;
const { Text } = Typography;

const Appointment = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [appointmentInfo, setAppointmentInfo] = useState<any>(null);

  const fetchDoctors = async () => {
    try {
      const response = await DoctorService.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await Service.getServices();
      setServices(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchServices();
  }, []);

  const handleDoctorSelect = (id: string) => {
    setSelectedDoctorId(id);
    setSelectedTimeSlot(null);
    setAvailableTimeSlots([]);
    setSelectedDate(null); // Reset ngày đã chọn

    const doctor = doctors.find((d) => d._id === id);
    if (doctor?.workSchedule) {
      const days = doctor.workSchedule.map(
        (item: string) => item.split(" ")[0]
      );
      setWorkDays(days);
    } else {
      setWorkDays([]);
    }
  };

  const isDayDisabled = (current: any) => {
    if (!current || !workDays.length) return true;
    if (current < dayjs().startOf("day")) return true;

    const dayOfWeek = current.format("dddd");
    return !workDays.includes(dayOfWeek);
  };

  const getAvailableTimeSlots = async (date: dayjs.Dayjs, doctorId: string) => {
    if (!doctorId || !date) return [];
    try {
      const res = await AppointmentService.getAvailableTimeSlots(
        doctorId,
        date.format("YYYY-MM-DD")
      );
      if (res.success && Array.isArray(res.availableSlots)) {
        return res.availableSlots.map((slot: any) => slot.startTime);
      }
      toast.error(res.message || "Không lấy được khung giờ trống!");
      return [];
    } catch (error: any) {
      console.error("Error fetching time slots:", error);
      toast.error(
        error?.response?.data?.message ||
          "Không thể kết nối tới máy chủ để lấy khung giờ trống!"
      );
      return [];
    }
  };

  const handleDateChange = async (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    if (date && selectedDoctorId) {
      const slots = await getAvailableTimeSlots(date, selectedDoctorId);
      setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
    }
  };

  const handleTimeSlotSelect = (slot: string) => {
    setSelectedTimeSlot(slot);
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Validate dữ liệu
      if (!values.fullName || !values.email || !values.phone) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
      }

      if (!selectedDoctorId) {
        toast.error("Vui lòng chọn bác sĩ!");
        return;
      }

      if (!selectedTimeSlot || !selectedDate) {
        toast.error("Vui lòng chọn ngày và khung giờ!");
        return;
      }

      const appointmentDateTime = `${selectedDate.format(
        "YYYY-MM-DD"
      )}T${selectedTimeSlot}:00+07:00`;

      // Format dữ liệu gửi lên server
      const appointmentData = {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address?.trim() || "",
        doctorId: selectedDoctorId,
        gender: values.gender || "Male",
        date: appointmentDateTime, // Chỉ gửi ngày
        timeSlot: selectedTimeSlot,
        note: values.note?.trim() || "",
      };

      // Log để debug
      console.log("Appointment data to send:", appointmentData);

      // Gọi API tạo cuộc hẹn
      const response = await axios.post(
        "https://mirava-f0rz.onrender.com/api/appointment",
        appointmentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data && response.data.success) {
        setAppointmentInfo({
          ...response.data.data,
          patientCode: response.data.data.patientCode,
        });
        setModalVisible(true);

        // Reset form
        form.resetFields();
        setSelectedDoctorId(null);
        setWorkDays([]);
        setSelectedDate(null);
        setAvailableTimeSlots([]);
        setSelectedTimeSlot(null);

        toast.success("Đặt lịch thành công!");
      } else {
        toast.error("Có lỗi xảy ra khi đặt lịch.");
      }
    } catch (error) {
      console.error("Error tạo cuộc hẹn:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        const statusCode = error.response?.status;

        console.error("API Error:", {
          status: statusCode,
          message: errorMessage,
          data: error.response?.data,
        });

        switch (statusCode) {
          case 400:
            toast.error(`Dữ liệu không hợp lệ: ${errorMessage}`);
            break;
          case 401:
            toast.error("Bạn cần đăng nhập để đặt lịch");
            break;
          case 404:
            toast.error("Bác sĩ không tồn tại");
            break;
          case 500:
            toast.error("Lỗi server, vui lòng thử lại sau");
            break;
          default:
            toast.error(`Có lỗi xảy ra: ${errorMessage}`);
        }
      } else {
        toast.error("Có lỗi xảy ra khi đặt lịch");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="appointment-container">
        <Card title="Đặt lịch khám bệnh" className="appointment-card">
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            initialValues={{ gender: "Male" }}
          >
            <Form.Item
              name="fullName"
              label="Họ tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên" },
                { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
              ]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>

            <Form.Item
              label="Chọn bác sĩ"
              rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
            >
              <Select
                placeholder="Chọn bác sĩ"
                value={selectedDoctorId}
                onChange={(value) => handleDoctorSelect(value)}
                style={{ width: "100%" }}
                optionFilterProp="children"
                showSearch
                allowClear
              >
                {doctors.map((doc: any) => (
                  <Select.Option key={doc._id} value={doc._id}>
                    {doc?.user?.userName} - {doc?.specialty}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedDoctorId && (
              <div style={{ marginBottom: 16 }}>
                {(() => {
                  const selectedDoctor = doctors.find(
                    (doc) => doc._id === selectedDoctorId
                  );
                  if (!selectedDoctor) return null;

                  return (
                    <div
                      style={{
                        padding: "10px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "6px",
                      }}
                    >
                      <Text strong>Thời gian làm việc:</Text>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                        {selectedDoctor.workSchedule?.map((schedule, idx) => (
                          <li key={idx}>{schedule}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            )}

            <Form.Item name="gender" label="Giới tính">
              <Radio.Group>
                <Radio value="Male">Nam</Radio>
                <Radio value="Female">Nữ</Radio>
                <Radio value="Other">Khác</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="date"
              label="Ngày khám"
              rules={[{ required: true, message: "Vui lòng chọn ngày khám" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                disabledDate={isDayDisabled}
                onChange={handleDateChange}
                placeholder="Chọn ngày khám"
              />
            </Form.Item>

            {availableTimeSlots.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Chọn khung giờ:</Text>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  {availableTimeSlots.map((slot) => (
                    <Button
                      key={slot}
                      onClick={() => handleTimeSlotSelect(slot)}
                      style={{
                        backgroundColor:
                          selectedTimeSlot === slot ? "#13c2c2" : "#e6f7ff",
                        color: selectedTimeSlot === slot ? "#fff" : "#000",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 12px",
                      }}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Form.Item name="note" label="Ghi chú">
              <TextArea rows={3} placeholder="Ghi chú thêm (nếu có)" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="btn-submit"
                disabled={
                  !selectedDoctorId || !selectedTimeSlot || !selectedDate
                }
              >
                Đặt lịch khám
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        title="Thông tin cuộc hẹn"
      >
        {appointmentInfo && (
          <div>
            <p>
              <b>Họ tên:</b> {appointmentInfo.fullName}
            </p>
            <p>
              <b>Email:</b> {appointmentInfo.email}
            </p>
            <p>
              <b>Số điện thoại:</b> {appointmentInfo.phone}
            </p>
            <p>
              <b>Bác sĩ:</b>{" "}
              {appointmentInfo.doctor?.user?.userName || "Chưa xác định"}
            </p>
            <p>
              <b>Chuyên khoa:</b>{" "}
              {appointmentInfo.doctor?.specialty || "Chưa xác định"}
            </p>
            <p>
              <b>Ngày giờ:</b>{" "}
              {new Date(appointmentInfo.date).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              <b>Ghi chú:</b> {appointmentInfo.note || "Không có"}
            </p>
            <p style={{ color: "red" }}>
              <b>Mã bệnh nhân:</b> {appointmentInfo.patientCode}
            </p>
          </div>
        )}
      </Modal>
      <Footer />
    </>
  );
};

export default Appointment;
