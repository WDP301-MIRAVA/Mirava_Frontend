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
import { Service } from "@/services/service";
import toast from "react-hot-toast";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const Appointment = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
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

  const getAvailableTimeSlots = (date: dayjs.Dayjs, doctorId: string) => {
    const doctor = doctors.find((d) => d._id === doctorId);
    if (!doctor || !doctor.workSchedule) return [];

    const dayOfWeek = date.format("dddd");
    const schedule = doctor.workSchedule.find((s: string) =>
      s.startsWith(dayOfWeek)
    );
    if (!schedule) return [];

    const timeParts = schedule.split(" ").slice(1);
    const timeSlots: string[] = [];

    timeParts.forEach((part: string) => {
      const [start, end] = part.split("-");
      let current = dayjs(
        `${date.format("YYYY-MM-DD")} ${start}`,
        "YYYY-MM-DD HH:mm"
      );
      const endTime = dayjs(
        `${date.format("YYYY-MM-DD")} ${end}`,
        "YYYY-MM-DD HH:mm"
      );

      while (current <= endTime) {
        timeSlots.push(current.format("HH:mm"));
        current = current.add(30, "minute");
      }
    });

    return timeSlots;
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    if (date && selectedDoctorId) {
      const slots = getAvailableTimeSlots(date, selectedDoctorId);
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
      if (!selectedTimeSlot || !selectedDate) {
        toast.error("Vui lòng chọn ngày và khung giờ!");
        return;
      }

      const dateWithTime = `${selectedDate.format(
        "YYYY-MM-DD"
      )} ${selectedTimeSlot}`;
      const payload = {
        ...values,
        doctorId: selectedDoctorId,
        date: dateWithTime,
      };
      await AppointmentService.createBooking(payload);
      toast.success("Đặt lịch thành công!");
      form.resetFields();
      setSelectedDoctorId(null);
      setWorkDays([]);
      setSelectedDate(null);
      setAvailableTimeSlots([]);
      setSelectedTimeSlot(null);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đặt lịch.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy tất cả các chuyên khoa duy nhất từ danh sách bác sĩ
  const specialties = Array.from(
    new Set(
      doctors.flatMap((doc: any) => (doc.specialty ? [doc.specialty] : []))
    )
  );

  // Lọc bác sĩ theo chuyên khoa đã chọn
  const filteredDoctors = selectedSpecialty
    ? doctors.filter((doc: any) => doc.specialty === selectedSpecialty)
    : doctors;

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
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>

            <Form.Item
              name="specialty"
              label="Chuyên khoa"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Chọn chuyên khoa"
                onChange={(value) => {
                  setSelectedSpecialty(value);
                  setSelectedDoctorId(null); // reset chọn bác sĩ khi đổi chuyên khoa
                }}
                value={selectedSpecialty}
              >
                {specialties.map((specialty) => (
                  <Option key={specialty} value={specialty}>
                    {specialty}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Chọn bác sĩ" required>
              <Select
                placeholder="Chọn bác sĩ"
                value={selectedDoctorId}
                onChange={(value) => handleDoctorSelect(value)}
                style={{ width: "100%" }}
                optionFilterProp="children"
                showSearch
                disabled={!selectedSpecialty}
              >
                {filteredDoctors.map((doc: any) => (
                  <Select.Option key={doc._id} value={doc._id}>
                    {doc?.user?.userName}
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
              rules={[{ required: true }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                disabledDate={isDayDisabled}
                onChange={handleDateChange}
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
                disabled={!selectedDoctorId || !selectedTimeSlot}
              >
                Đặt lịch khám
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default Appointment;
