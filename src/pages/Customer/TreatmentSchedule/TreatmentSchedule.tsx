import React, { useState } from "react";
import {
  Card,
  Typography,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
} from "antd";
import "./TreatmentSchedule.css";

const { Title } = Typography;
const { Option } = Select;

const initialSchedules = [
  {
    key: "1",
    date: "2025-07-01",
    time: "08:30",
    treatment: "Khám tổng quát",
    doctor: "BS. Nguyễn Văn A",
  },
  {
    key: "2",
    date: "2025-07-03",
    time: "14:00",
    treatment: "Xét nghiệm máu",
    doctor: "BS. Trần Thị B",
  },
];

const TreatmentSchedule = () => {
  const [data, setData] = useState(initialSchedules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const onFinish = (values: any) => {
    const newEntry = {
      key: Date.now().toString(),
      date: values.date.format("YYYY-MM-DD"),
      time: values.time.format("HH:mm"),
      treatment: values.treatment,
      doctor: values.doctor,
    };
    setData([...data, newEntry]);
    form.resetFields();
    setIsModalOpen(false);
  };

  const columns = [
    { title: "Ngày", dataIndex: "date", key: "date" },
    { title: "Giờ", dataIndex: "time", key: "time" },
    { title: "Nội dung điều trị", dataIndex: "treatment", key: "treatment" },
    { title: "Bác sĩ phụ trách", dataIndex: "doctor", key: "doctor" },
  ];

  return (
    <Card className="treatment-card">
      <Title level={3} style={{ textAlign: "center" }}>
        Lịch Điều Trị
      </Title>

      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <Button type="primary" onClick={showModal}>
          + Thêm lịch điều trị
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        bordered
      />

      <Modal
        title="Thêm lịch điều trị"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Form.Item
            name="date"
            label="Ngày điều trị"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="time"
            label="Giờ điều trị"
            rules={[{ required: true }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="Nội dung điều trị"
            rules={[{ required: true }]}
          >
            <Input placeholder="VD: Khám tổng quát, vật lý trị liệu..." />
          </Form.Item>

          <Form.Item
            name="doctor"
            label="Bác sĩ phụ trách"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn bác sĩ">
              <Option value="BS. Nguyễn Văn A">BS. Nguyễn Văn A</Option>
              <Option value="BS. Trần Thị B">BS. Trần Thị B</Option>
              <Option value="BS. Lê Minh C">BS. Lê Minh C</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TreatmentSchedule;
