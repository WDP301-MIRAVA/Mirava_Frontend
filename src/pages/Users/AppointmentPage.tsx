import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Descriptions,
  Typography,
  message,
} from "antd";
import {
  InfoCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Appointment {
  id: string;
  patientName: string;
  phoneNumber: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
  note?: string;
}

// Dữ liệu giả lập
const initialAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Nguyễn Văn A",
    phoneNumber: "0901234567",
    date: "2025-06-20",
    time: "09:00",
    status: "pending",
    note: "Khám tổng quát",
  },
  {
    id: "2",
    patientName: "Trần Thị B",
    phoneNumber: "0912345678",
    date: "2025-06-20",
    time: "10:30",
    status: "confirmed",
    note: "Tái khám huyết áp",
  },
  {
    id: "3",
    patientName: "Lê Văn C",
    phoneNumber: "0987654321",
    date: "2025-06-21",
    time: "14:00",
    status: "cancelled",
    note: "Khám da liễu",
  },
];

const statusColorMap = {
  pending: "orange",
  confirmed: "green",
  cancelled: "red",
};

const AppointmentPage: React.FC = () => {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleView = (record: Appointment) => {
    setSelected(record);
    setModalVisible(true);
  };

  const handleConfirm = (id: string) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "confirmed" } : item
      )
    );
    message.success("Đã xác nhận lịch hẹn");
  };

  const handleCancel = (id: string) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "cancelled" } : item
      )
    );
    message.error("Đã huỷ lịch hẹn");
  };

  return (
    <>
      <Header />
      <div style={{ padding: 24 }}>
        <Typography.Title level={3}>📅 Quản lý lịch hẹn</Typography.Title>

        <Table
          rowKey="id"
          dataSource={appointments}
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: "Bệnh nhân",
              dataIndex: "patientName",
            },
            {
              title: "SĐT",
              dataIndex: "phoneNumber",
            },
            {
              title: "Ngày",
              dataIndex: "date",
            },
            {
              title: "Giờ",
              dataIndex: "time",
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (status: Appointment["status"]) => (
                <Tag color={statusColorMap[status]}>{status.toUpperCase()}</Tag>
              ),
            },
            {
              title: "Hành động",
              render: (_, record) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    icon={<InfoCircleOutlined />}
                    size="small"
                    onClick={() => handleView(record)}
                  >
                    Chi tiết
                  </Button>
                  {record.status === "pending" && (
                    <>
                      <Button
                        icon={<CheckOutlined />}
                        size="small"
                        type="primary"
                        onClick={() => handleConfirm(record.id)}
                      >
                        Xác nhận
                      </Button>
                      <Button
                        icon={<CloseOutlined />}
                        size="small"
                        danger
                        onClick={() => handleCancel(record.id)}
                      >
                        Huỷ
                      </Button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />

        <Modal
          title="Chi tiết lịch hẹn"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          {selected && (
            <Descriptions column={1}>
              <Descriptions.Item label="Họ tên">
                {selected.patientName}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT">
                {selected.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày">
                {selected.date}
              </Descriptions.Item>
              <Descriptions.Item label="Giờ">{selected.time}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusColorMap[selected.status]}>
                  {selected.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selected.note || "-"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
      <Footer />
    </>
  );
};

export default AppointmentPage;
