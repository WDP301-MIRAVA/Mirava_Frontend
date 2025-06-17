import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  message,
  Card,
  Spin,
} from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { decodeToken } from "@/utils/decodeToken";
import { userServ } from "@/services/userServie";

const { Title } = Typography;
const { Option } = Select;

interface UserResponse {
  _id: string;
  userName: string;
  phone: string;
  email: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const PersonalInfoPage: React.FC = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("accessToken");
  const userLocal = decodeToken(token ?? "");

  const fetchUser = async () => {
    try {
      const response = await userServ.getUserById(userLocal.id);
      const userData = response.data;
      setUser(userData);

      // Gán giá trị cho form
      form.setFieldsValue({
        userName: userData?.userName,
        phone: userData?.phone,
        email: userData?.email,
        gender: userData?.gender,
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error);
      message.error("Không thể tải thông tin người dùng");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
      };

      // Gọi API cập nhật nếu có
      await userServ.updateUser(user?._id ?? "", payload);

      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      message.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
        <Card>
          <Title level={3}>👤 Thông tin cá nhân</Title>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Họ và tên"
              name="userName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^0\d{9}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select>
                <Option value="Male">Nam</Option>
                <Option value="Female">Nữ</Option>
                <Option value="Other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default PersonalInfoPage;
