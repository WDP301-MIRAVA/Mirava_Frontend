import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  Badge,
  Spin,
  Typography,
  Divider,
  Row,
  Col,
  Card,
  Modal,
  Timeline,
  Tag,
} from "antd";
import type { Dayjs } from "dayjs";
import axios from "axios";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "./Schedules.css";
import moment from "moment";

const { Title, Text } = Typography;

interface UserInfo {
  _id: string;
  userName: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
}

interface Doctor {
  _id: string;
  user: UserInfo;
  degree: string;
  specialty: string;
  workSchedule: string[];
  description: string;
  imageUrl: string;
  rating: number;
}

interface TimeSlot {
  time: string;
  isBooked: boolean;
  patientName?: string;
  appointmentId?: string;
}

moment.locale("vi");

const Schedules: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedSchedule, setParsedSchedule] = useState<
    Map<string, { start: string; end: string }>
  >(new Map());
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedDate] = useState<Dayjs | null>(null);
  const [timeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots] = useState<boolean>(false);

  useEffect(() => {
    const fetchDoctorSchedule = async () => {
      try {
        setLoading(true);
        // Nếu không có id trong URL, sử dụng ID từ thông tin đăng nhập (nếu là bác sĩ)
        const doctorId =
          id || localStorage.getItem("doctorId") || "6841a77f6eb5e7849d19df9b";
        console.log("Fetching doctor schedule for ID:", doctorId);

        if (!doctorId) {
          setError("Không tìm thấy ID bác sĩ");
          setLoading(false);
          return;
        }
        console.log("doctorId:", doctorId);
        const response = await axios.get(
          `https://mirava-f0rz.onrender.com/api/work-schedules/doctor/${doctorId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.data?.success) {
          const schedules = response.data.data;
          parseWorkScheduleFromAPI(schedules);
        } else {
          setError("Không tìm thấy lịch làm việc");
        }
      } catch (err) {
        console.error("Error fetching doctor schedule:", err);
        if (axios.isAxiosError(err)) {
          console.error("API Error details:", {
            status: err.response?.status,
            data: err.response?.data,
            headers: err.response?.headers,
          });
          setError(`Lỗi API: ${err.response?.status} - ${err.message}`);
        } else {
          setError(`Lỗi khi tải lịch: ${(err as Error).message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorSchedule();
  }, [id]);

  const parseWorkScheduleFromAPI = (
    schedules: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[]
  ) => {
    const schedulesMap = new Map<string, { start: string; end: string }>();
    schedules.forEach((item) => {
      schedulesMap.set(item.dayOfWeek.toString(), {
        start: item.startTime,
        end: item.endTime,
      });
    });
    setParsedSchedule(schedulesMap);
  };

  // Hàm tạo các khung giờ từ lịch làm việc
  // const generateTimeSlots = (start: string, end: string): TimeSlot[] => {
  //   const slots: TimeSlot[] = [];
  //   const startTime = moment(start, "H:mm");
  //   const endTime = moment(end, "H:mm");

  //   // Tạo các khung giờ 1 tiếng một
  //   let currentTime = startTime.clone();
  //   while (currentTime.isBefore(endTime)) {
  //     const slotStart = currentTime.format("HH:mm");
  //     currentTime = currentTime.add(1, "hour");
  //     const slotEnd = currentTime.format("HH:mm");

  //     // Tạo ngẫu nhiên một số khung giờ đã được đặt để demo
  //     const isBooked = Math.random() > 0.6;

  //     slots.push({
  //       time: `${slotStart} - ${slotEnd}`,
  //       isBooked,
  //       patientName: isBooked
  //         ? `Bệnh nhân ${Math.floor(Math.random() * 100) + 1}`
  //         : undefined,
  //       appointmentId: isBooked
  //         ? `APT${Math.floor(Math.random() * 10000)}`
  //         : undefined,
  //     });
  //   }

  //   return slots;
  // };

  // Hàm xử lý khi click vào một ngày trên lịch
  // const handleDateSelect = (date: Dayjs) => {
  //   const day = date.day().toString();
  //   const isWorkingDay = parsedSchedule.has(day);

  //   if (isWorkingDay) {
  //     setSelectedDate(date);
  //     setLoadingTimeSlots(true);

  //     // Lấy thời gian làm việc của ngày đó
  //     const schedule = parsedSchedule.get(day);

  //     if (schedule) {
  //       // Trong thực tế, bạn sẽ gọi API để lấy các lịch hẹn theo ngày
  //       // Ở đây chúng ta sẽ tạo dữ liệu demo
  //       setTimeout(() => {
  //         const slots = generateTimeSlots(schedule.start, schedule.end);
  //         setTimeSlots(slots);
  //         setLoadingTimeSlots(false);
  //         setModalVisible(true);
  //       }, 500);
  //     }
  //   }
  // };

  const dateCellRender = (value: Dayjs) => {
    const day = value.day().toString();
    const isWorkingDay = parsedSchedule.has(day);

    if (isWorkingDay) {
      const schedule = parsedSchedule.get(day);
      return (
        <div className="calendar-cell-content">
          <Badge
            status="success"
            text={`Ca làm việc: ${schedule?.start} - ${schedule?.end}`}
          />
        </div>
      );
    }
    return null;
  };

  const monthCellRender = () => {
    return null;
  };

  // Modal hiển thị chi tiết lịch trong ngày
  const renderTimeSlotModal = () => {
    if (!selectedDate) return null;

    const dateString = selectedDate.format("dddd, DD/MM/YYYY");
    const capitalizedDateString =
      dateString.charAt(0).toUpperCase() + dateString.slice(1);

    return (
      <Modal
        title={
          <div className="time-slot-modal-title">
            <CalendarOutlined />
            <span>{capitalizedDateString}</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        className="time-slot-modal"
      >
        {loadingTimeSlots ? (
          <div className="time-slot-loading">
            <Spin />
            <Text>Đang tải lịch khám...</Text>
          </div>
        ) : (
          <div className="time-slots-container">
            <Timeline>
              {timeSlots.map((slot, index) => (
                <Timeline.Item
                  key={index}
                  dot={
                    slot.isBooked ? (
                      <CheckCircleOutlined className="booked-icon" />
                    ) : (
                      <ClockCircleOutlined className="available-icon" />
                    )
                  }
                  color={slot.isBooked ? "#f5222d" : "#52c41a"}
                >
                  <Card
                    className={`time-slot-card ${
                      slot.isBooked ? "booked" : "available"
                    }`}
                  >
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Text strong className="time-slot-time">
                          {slot.time}
                        </Text>
                        <div className="status-container">
                          {slot.isBooked ? (
                            <Tag color="red">Đã đặt lịch</Tag>
                          ) : (
                            <Tag color="green">Còn trống</Tag>
                          )}
                        </div>
                      </Col>

                      {slot.isBooked && (
                        <Col>
                          <div className="patient-info">
                            <Text type="secondary">Bệnh nhân:</Text>
                            <Text strong>{slot.patientName}</Text>
                          </div>
                          <div className="appointment-id">
                            <Text type="secondary">Mã lịch hẹn:</Text>
                            <Text code>{slot.appointmentId}</Text>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Modal>
    );
  };

  if (loading) {
    return (
      <div className="schedule-loading">
        <Spin size="large" />
        <Text>Đang tải lịch làm việc...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-error">
        <Title level={4} type="danger">
          {error}
        </Title>
        <Text>Vui lòng thử lại sau hoặc liên hệ với quản trị viên.</Text>
      </div>
    );
  }

  return (
    <div className="doctor-schedule-container">
      <div className="schedule-section">
        <Title level={3} className="schedule-title">
          <ClockCircleOutlined /> Lịch làm việc
        </Title>

        <Card className="schedule-card">
          <div className="work-days-summary">
            <Title level={5}>Ngày làm việc trong tuần:</Title>
            <ul className="work-days-list">
              {doctor?.workSchedule.map((schedule, index) => (
                <li key={index} className="work-day-item">
                  <Badge status="success" text={schedule} />
                </li>
              ))}
            </ul>
          </div>

          <Divider />

          <Calendar
            dateCellRender={dateCellRender}
            monthCellRender={monthCellRender}
            className="schedule-calendar"
          />
        </Card>
      </div>

      {renderTimeSlotModal()}
    </div>
  );
};

export default Schedules;
