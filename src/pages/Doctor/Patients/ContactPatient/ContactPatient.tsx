import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatBox from "@/components/ChatBox";
import { User, MessageCircle } from "lucide-react";
import "./ContactPatient.css";

const ContactPatient: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  useEffect(() => {
    axios
      .get("https://mirava-f0rz.onrender.com/api/treatment-plan/my-patients", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => setPatients(res.data.data))
      .catch(() => setPatients([]));
  }, []);

  const userInfo = localStorage.getItem("userInfo");
  const userId = userInfo ? JSON.parse(userInfo).id : undefined;
  const token = localStorage.getItem("accessToken") || "";
  console.log("userId FE:", userId);
  return (
    <div className="contact-patient-page">
      <h2>Liên hệ bệnh nhân đang điều trị</h2>
      <div className="patient-list">
        {patients.length === 0 && <p>Bạn chưa có bệnh nhân nào.</p>}
        {patients.map((patient) => (
          <div key={patient.userId} className="patient-item">
            {patient.imageUrl ? (
              <img
                src={patient.imageUrl}
                alt={patient.userName}
                className="patient-avatar"
              />
            ) : (
              <User size={40} color="#00b4c6" />
            )}
            <div className="patient-info">
              <span className="patient-name">{patient.userName}</span>
              <span className="patient-code">{patient.patientCode}</span>
            </div>
            <button
              onClick={() => setSelectedPatient(patient)}
              className="message-icon-btn"
              title="Chat với bệnh nhân"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        ))}
      </div>
      {selectedPatient && (
        <ChatBox
          userId={userId}
          doctor={selectedPatient}
          token={token}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};

export default ContactPatient;
