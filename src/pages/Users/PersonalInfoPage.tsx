import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography, Card, Spin, Radio } from "antd";
import { decodeToken } from "@/utils/decodeToken";
import { userServ } from "@/services/userServie";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import "./PersonalInfoPage.css"; // Assuming you have a CSS file for styles
const { Title } = Typography;

type Gender = "Male" | "Female" | "Other";

interface UserResponse {
  _id: string;
  userName: string;
  phone: string;
  email: string;
  gender: Gender;
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface FormValues {
  userName: string;
  phone: string;
  email: string;
  address: string;
  gender: Gender;
  password?: string;
  confirmPassword?: string;
}

interface UpdateUserPayload {
  phone: string;
  address: string;
  gender: Gender;
  password?: string;
}

const PersonalInfoPage: React.FC = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Không tìm thấy token, vui lòng đăng nhập lại");
        return;
      }
      const userLocal = decodeToken(token);
      const userData = await userServ.getUserById(userLocal.id);

      const normalizedGender = capitalizeFirstLetter(
        userData?.gender ?? ""
      ) as Gender;

      setUser({
        ...userData,
        gender: normalizedGender,
        address: userData?.address ?? "",
      });

      form.setFieldsValue({
        userName: userData?.userName || "",
        phone: userData?.phone || "",
        email: userData?.email || "",
        gender: normalizedGender || "",
        address: userData?.address || "",
      });
    } catch (error: unknown) {
      console.error("Lỗi lấy thông tin người dùng:", error);

      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          setError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
          localStorage.removeItem("accessToken");
        } else if (error.response?.status === 403) {
          setError("Bạn không có quyền truy cập thông tin này");
        } else if (error.response?.status === 404) {
          setError("Không tìm thấy thông tin người dùng");
        } else {
          setError(error.message || "Không thể tải thông tin người dùng");
        }

        toast.error("Không thể tải thông tin người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const onFinish = async (values: FormValues) => {
    if (values.password && values.password !== values.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setUpdating(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Vui lòng đăng nhập để cập nhật thông tin");
        return;
      }

      if (!user?._id) {
        toast.error("Không tìm thấy thông tin người dùng");
        return;
      }

      const payload: UpdateUserPayload = {
        phone: values.phone,
        address: values.address,
        gender: values.gender,
      };

      if (values.password?.trim()) {
        payload.password = values.password;
      }

      await userServ.updateUser(payload, user._id);

      toast.success("Cập nhật thông tin thành công!");
      await fetchUser();

      form.setFieldsValue({
        password: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      console.error("Lỗi cập nhật:", error);

      if (error instanceof AxiosError) {
        const status = error.response?.status;

        if (status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn");
          localStorage.removeItem("accessToken");
        } else if (status === 400) {
          toast.error(error.response?.data?.message || "Dữ liệu không hợp lệ");
        } else {
          toast.error(error.message || "Cập nhật thất bại!");
        }
      } else {
        toast.error("Lỗi không xác định");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <div style={{ color: "red", marginBottom: 16 }}>{error}</div>
        <Button onClick={fetchUser} type="primary">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
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
                message:
                  "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
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
            <Input placeholder="Nhập địa chỉ" />
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
            <Button
              type="primary"
              htmlType="submit"
              loading={updating}
              disabled={updating}
              style={{ width: "100%" }}
            >
              {updating ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PersonalInfoPage;
