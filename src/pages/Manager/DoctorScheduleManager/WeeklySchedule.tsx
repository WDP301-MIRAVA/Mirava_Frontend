import { WorkScheduleService } from "@/services/work-schedule.service";
import { Button, Table } from "antd";
import { useEffect, useState } from "react";
import SpecialDateModal from "./SpecialDateModal";
import CreateScheduleModal from "./CreateScheduleModal";

const dayWeekText = {
  0: "Chủ nhật",
  1: "Thứ hai",
  2: "Thứ ba",
  3: "Thứ tư",
  4: "Thứ năm",
  5: "Thứ sáu",
  6: "Thứ bảy",
};
export default function WeeklySchedule({ doctor }) {
  const [schedules, setSchedules] = useState([]);
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const fetchSchedule = async () => {
    try {
      const res = await WorkScheduleService.getScheduleByDoctor(doctor._id);
      setSchedules(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy lịch làm việc bác sĩ:", err);
    }
  };

  useEffect(() => {
    if (doctor?._id) {
      fetchSchedule();
    }
  }, [doctor]);

  const columns = [
    {
      title: "Thứ",
      dataIndex: "dayOfWeek",
      render: (dayOfWeek) => <p>{dayWeekText[dayOfWeek]}</p>,
    },
    { title: "Giờ bắt đầu", dataIndex: "startTime" },
    { title: "Giờ kết thúc", dataIndex: "endTime" },
    {
      title: "Nghỉ trưa",
      render: (_, r) => `${r.breakStartTime} - ${r.breakEndTime}`,
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
