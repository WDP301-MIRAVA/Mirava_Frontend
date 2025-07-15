// pages/DoctorScheduleManager/index.tsx
import { useState } from "react";
import { Row, Col, Card, Typography } from "antd";
import DoctorList from "./DoctorList";
import WeeklySchedule from "./WeeklySchedule";

const { Title } = Typography;

export default function DoctorScheduleManager() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card title="Danh sách bác sĩ">
          <DoctorList onSelect={setSelectedDoctor} />
        </Card>
      </Col>
      <Col span={18}>
        {selectedDoctor && (
          <>
            <Title level={4}>
              Quản lý lịch làm việc: {selectedDoctor.name}
            </Title>
            <WeeklySchedule doctor={selectedDoctor} />
          </>
        )}
      </Col>
    </Row>
  );
}
