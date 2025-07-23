import { WorkScheduleService } from "@/services/work-schedule.service";
import { Button, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import SpecialDateModal from "./SpecialDateModal";
import CreateScheduleModal from "./CreateScheduleModal";

interface Doctor {
  _id: string;
  [key: string]: unknown;
}

interface WeeklyScheduleProps {
  doctor: Doctor;
}

const dayWeekText = {
  0: "Chủ nhật",
  1: "Thứ hai",
  2: "Thứ ba",
  3: "Thứ tư",
  4: "Thứ năm",
  5: "Thứ sáu",
  6: "Thứ bảy",
};
export default function WeeklySchedule({ doctor }: WeeklyScheduleProps) {
  const [schedules, setSchedules] = useState([]);
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await WorkScheduleService.getScheduleByDoctor(doctor._id);
      setSchedules(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy lịch làm việc bác sĩ:", err);
    }
  }, [doctor._id]);

  useEffect(() => {
    if (doctor?._id) {
      fetchSchedule();
    }
  }, [doctor, fetchSchedule]);

  interface WeekSchedule {
    _id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStartTime: string;
    breakEndTime: string;
    maxPatients: number;
  }

  interface TableColumn {
    title: string;
    dataIndex?: string;
    render?: (value: unknown, record: WeekSchedule) => React.ReactNode;
  }

  const columns: TableColumn[] = [
    {
      title: "Thứ",
      dataIndex: "dayOfWeek",
      render: (value: unknown) => (
        <p>{dayWeekText[value as keyof typeof dayWeekText]}</p>
      ),
    },
    { title: "Giờ bắt đầu", dataIndex: "startTime" },
    { title: "Giờ kết thúc", dataIndex: "endTime" },
    {
      title: "Nghỉ trưa",
      render: (_: unknown, r: WeekSchedule) =>
        `${r.breakStartTime} - ${r.breakEndTime}`,
    },
    { title: "Tối đa bệnh nhân", dataIndex: "maxPatients" },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={schedules}
        rowKey="_id"
        pagination={false}
      />
      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <Button onClick={() => setShowCreateModal(true)} type="primary">
          Tạo lịch làm việc
        </Button>
        <Button onClick={() => setShowSpecialModal(true)}>
          Thêm ngày đặc biệt
        </Button>
      </div>
      <SpecialDateModal
        open={showSpecialModal}
        onClose={() => setShowSpecialModal(false)}
        doctorId={doctor._id}
        onSuccess={fetchSchedule}
      />
      <CreateScheduleModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        doctorId={doctor._id}
        onSuccess={fetchSchedule}
      />
    </>
  );
}
