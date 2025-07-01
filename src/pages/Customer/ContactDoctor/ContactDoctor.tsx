import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatBox from "@/components/ChatBox"; // Đảm bảo đã có component này
import "./ContactDoctor.css";
const ContactDoctor: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

  useEffect(() => {
    // Lấy danh sách bác sĩ đang điều trị
    axios
      .get("https://mirava-f0rz.onrender.com/api/treatment-plan/my-doctors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => setDoctors(res.data.data))
      .catch(() => setDoctors([]));
  }, []);

  const userInfo = localStorage.getItem("userInfo");
  const userId = userInfo ? JSON.parse(userInfo).id : undefined;
  console.log("userId FE:", userId);
  const token = localStorage.getItem("accessToken") || "";
  return (
    <div className="contact-doctor-page">
      <h2>Liên hệ bác sĩ đang điều trị</h2>
      <div className="doctor-list">
        {doctors.length === 0 && <p>Bạn chưa có bác sĩ điều trị nào.</p>}
        {doctors.map((doctor) => (
          <div key={doctor.doctorId} className="doctor-item">
            <img
              src={doctor.imageUrl || "/default-avatar.png"}
              alt={doctor.userName}
              className="doctor-avatar"
            />
            <span>{doctor.userName}</span>
            <button onClick={() => setSelectedDoctor(doctor)}>
              Chat với bác sĩ
            </button>
          </div>
        ))}
      </div>
      {selectedDoctor && (
        <ChatBox
          userId={userId}
          doctor={selectedDoctor}
          token={token}
          onClose={() => setSelectedDoctor(null)}
        />
      )}
    </div>
  );
};

export default ContactDoctor;
