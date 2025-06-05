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
  Row,
  Col,
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

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        doctorId: selectedDoctorId,
        date: values.date.format("YYYY-MM-DD"),
      };
      await AppointmentService.createBooking(payload);
      toast.success("Đặt lịch thành công!");
      form.resetFields();
      setSelectedDoctorId(null);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đặt lịch.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (id: string) => {
    setSelectedDoctorId(id);
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
            initialValues={{ gender: "male" }}
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
              label="Chọn bác sĩ"
              required
              validateStatus={!selectedDoctorId ? "error" : "success"}
              help={!selectedDoctorId && "Vui lòng chọn bác sĩ"}
            >
              <Select
                placeholder="Chọn bác sĩ"
                value={selectedDoctorId}
                onChange={(value) => handleDoctorSelect(value)}
                style={{ width: "100%" }}
                optionFilterProp="children"
                showSearch
              >
                {doctors?.map((doc) => (
                  <Select.Option key={doc._id} value={doc._id}>
                    {doc?.user?.userName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="specialty"
              label="Chuyên khoa"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn chuyên khoa">
                {services?.map((service) => (
                  <Option value={service.method}>{service.name}</Option>
                ))}
              </Select>
            </Form.Item>

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
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>

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
                disabled={!selectedDoctorId}
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
