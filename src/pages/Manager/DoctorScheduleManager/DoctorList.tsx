import { DoctorService } from "@/services/doctor.service";
import { List, Avatar } from "antd";
import { useEffect, useState } from "react";

export interface Doctor {
  _id: string;
  name: string;
  imageUrl?: string;
  specialty?: string;
  user?: {
    userName?: string;
  };
}

interface DoctorListProps {
  onSelect: (doctor: Doctor) => void;
}

export default function DoctorList({ onSelect }: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await DoctorService.getDoctors();
        setDoctors(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách bác sĩ:", err);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <List
      itemLayout="horizontal"
      dataSource={doctors}
      renderItem={(doctor) => (
        <List.Item
          onClick={() => onSelect(doctor)}
          style={{ cursor: "pointer" }}
        >
          <List.Item.Meta
            avatar={<Avatar src={doctor.imageUrl} />}
            title={doctor.user?.userName || "Không có tên"}
            description={doctor.specialty || ""}
          />
        </List.Item>
      )}
    />
  );
}
