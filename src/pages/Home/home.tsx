import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button, Avatar, message } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { userServ } from "../../services/userServie";
import "./home.css";

const { Title, Text } = Typography;

interface UserInfo {
  _id?: string;
  userName?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
}

const Home: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // Giải mã JWT để lấy thông tin user (cách đơn giản)
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Gọi API lấy thông tin chi tiết nếu cần
        if (payload && payload.id) {
          try {
            const response = await axios.get(
              `http://localhost:3000/api/user/${payload.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setUserInfo(response.data);
          } catch (error) {
            // Nếu không lấy được thông tin chi tiết, dùng thông tin từ token
            setUserInfo({
              _id: payload.id,
              role: payload.role,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        message.error("Không thể lấy thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");
      if (refreshToken && accessToken) {
        await userServ.postLogout(refreshToken, accessToken);
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      message.success("Đăng xuất thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Đăng xuất thất bại!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar size={64} icon={<UserOutlined />} />
                <div style={{ marginLeft: "16px" }}>
                  <Title level={3}>
                    Xin chào, {userInfo.userName || "Người dùng"}
                  </Title>
                  <Text>Email: {userInfo.email || "Chưa có thông tin"}</Text>
                  <br />
                  <Text>Vai trò: {userInfo.role || "Khách hàng"}</Text>
                </div>
              </div>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: "20px" }}>
        <Col span={24}>
          <Card title="Dashboard">
            <p>Chào mừng bạn đến với hệ thống Mirava!</p>
            <p>Hãy khám phá các tính năng của chúng tôi.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
