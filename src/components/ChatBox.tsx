import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { User } from "lucide-react";
import "./ChatBox.css";

const SOCKET_URL = "https://mirava-f0rz.onrender.com"; // Đổi thành domain backend khi deploy

let socket: Socket;

interface ChatMessage {
  _id?: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  createdAt?: string;
  self?: boolean;
}

interface ChatBoxProps {
  userId: string;
  doctor: {
    doctorId: string;
    userId: string;
    userName: string;
    imageUrl: string;
  };
  token: string;
  onClose: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  userId,
  doctor,
  token,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lấy lịch sử chat
  useEffect(() => {
    axios
      .get(
        `https://mirava-f0rz.onrender.com/api/chat/history?toUserId=${doctor.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => setMessages(res.data.data))
      .catch(() => setMessages([]));
  }, [doctor.userId, token]);

  // Kết nối socket
  useEffect(() => {
    socket = io(SOCKET_URL);
    socket.emit("join", userId);

    socket.on("receive_message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, { ...msg, self: false }]);
    });

    socket.on("message_saved", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, { ...msg, self: true }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("send_message", {
        toUserId: doctor.userId, // người nhận
        fromUserId: userId, // người gửi
        message: input,
      });
      setInput("");
    }
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chatbox-messenger">
      <div className="chatbox-header">
        {doctor.imageUrl ? (
          <img
            src={doctor.imageUrl}
            alt={doctor.userName}
            className="chatbox-avatar"
            onError={(e) => {
              // Xử lý khi ảnh load lỗi
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : (
          <div className="chatbox-avatar-placeholder">
            <User size={24} color="#00b4c6" />
          </div>
        )}
        <span>{doctor.userName}</span>
        <button onClick={onClose} className="chatbox-close">
          ×
        </button>
      </div>
      <div className="chatbox-messages">
        {messages.map((msg, idx) => (
          <div
            key={msg._id || idx}
            className={`chatbox-message-row${
              msg.self || msg.fromUserId === userId ? " self" : ""
            }`}
          >
            <div className="chatbox-message-bubble">
              {msg.message}
              <div className="chatbox-message-time">
                {formatTime(msg.createdAt)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbox-input-area">
        <input
          className="chatbox-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Nhập tin nhắn..."
        />
        <button className="chatbox-send-btn" onClick={sendMessage}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
