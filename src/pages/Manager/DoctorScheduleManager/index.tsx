// pages/DoctorScheduleManager/index.tsx
import { useState } from "react";
import { Row, Col, Card, Typography } from "antd";
import DoctorList from "./DoctorList";
import WeeklySchedule from "./WeeklySchedule";
import type { Doctor } from "./DoctorList";

const { Title } = Typography;

export default function DoctorScheduleManager() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card title="Danh sách bác sĩ">
          <DoctorList onSelect={handleDoctorSelect} />
        </Card>
      </Col>
      <Col span={18}>
        {selectedDoctor && (
          <>
            <Title level={4}>
              Quản lý lịch làm việc: {selectedDoctor.name}
            </Title>
            <WeeklySchedule
              doctor={{ ...selectedDoctor, _id: selectedDoctor._id }}
            />
          </>
        )}
      </Col>
    </Row>
  );
}
