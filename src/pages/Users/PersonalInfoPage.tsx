import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  Card,
  Spin,
  Radio,
} from "antd";
import { decodeToken } from "@/utils/decodeToken";
import { userServ } from "@/services/userServie";
import toast from "react-hot-toast";

const { Title } = Typography;

interface UserResponse {
  _id: string;
  userName: string;
  phone: string;
  email: string;
  gender: "Male" | "Female" | "Other" | string;
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

      const normalizedGender = capitalizeFirstLetter(userData?.gender);

      setUser({ ...userData, gender: normalizedGender });

      form.setFieldsValue({
        userName: userData?.userName,
        phone: userData?.phone,
        email: userData?.email,
        gender: normalizedGender,
        address: userData?.address,
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error);
      toast.error("Không thể tải thông tin người dùng");
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const onFinish = async (values: any) => {
    if (values.password && values.password !== values.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        phone: values.phone,
        address: values.address,
        gender: values.gender,
      };

      if (values.password) {
        payload.password = values.password;
      }
      console.log("Cập nhật thông tin:", values.password);

      await userServ.updateUser(payload, user?._id ?? "");
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error("Cập nhật thất bại!");
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
      <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
        <Card>
          <Title level={3}>Thông tin cá nhân</Title>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Họ và tên"
              name="userName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input disabled />
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
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Radio.Group>
                <Radio value="Male">Nam</Radio>
                <Radio value="Female">Nữ</Radio>
                <Radio value="Other">Khác</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Mật khẩu mới" name="password">
              <Input.Password placeholder="Nhập nếu muốn đổi mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default PersonalInfoPage;
