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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy token từ localStorage
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Vui lòng đăng nhập để sử dụng chức năng này");
        setLoading(false);
        return;
      }

      // Decode token để lấy user info
      const userLocal = decodeToken(token);
      console.log("Decoded user:", userLocal); // Debug log

      if (!userLocal || !userLocal.id) {
        setError("Token không hợp lệ, vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }

      // Gọi API để lấy thông tin user
      const response = await userServ.getUserById(userLocal.id);
      console.log("API Response:", response); // Debug log

      // Xử lý response data - có thể là response.data hoặc response trực tiếp
      const userData = response.data || response;
      
      if (!userData || !userData._id) {
        setError("Không thể tải thông tin người dùng");
        setLoading(false);
        return;
      }

      const normalizedGender = capitalizeFirstLetter(userData?.gender || "");

      const userWithNormalizedGender = { 
        ...userData, 
        gender: normalizedGender 
      };

      setUser(userWithNormalizedGender);

      // Set form values
      form.setFieldsValue({
        userName: userData?.userName || "",
        phone: userData?.phone || "",
        email: userData?.email || "",
        gender: normalizedGender || "",
        address: userData?.address || "",
      });

      console.log("Form values set:", {
        userName: userData?.userName,
        phone: userData?.phone,
        email: userData?.email,
        gender: normalizedGender,
        address: userData?.address,
      }); // Debug log

    } catch (error: any) {
      console.error("Lỗi lấy thông tin người dùng:", error);
      
      // Xử lý các loại lỗi khác nhau
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        // Có thể redirect về trang login
        localStorage.removeItem("accessToken");
      } else if (error.response?.status === 403) {
        setError("Bạn không có quyền truy cập thông tin này");
      } else if (error.response?.status === 404) {
        setError("Không tìm thấy thông tin người dùng");
      } else {
        setError(error.message || "Không thể tải thông tin người dùng");
      }
      
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []); // Empty dependency array

  const onFinish = async (values: any) => {
    // Validate password confirmation
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

      // Prepare payload - chỉ gửi các field có thể update
      const payload: any = {
        phone: values.phone,
        address: values.address,
        gender: values.gender,
      };

      // Chỉ thêm password nếu user nhập
      if (values.password && values.password.trim()) {
        payload.password = values.password;
      }

      console.log("Update payload:", payload); // Debug log

      // Gọi API update
      const response = await userServ.updateUser(payload, user._id);
      console.log("Update response:", response); // Debug log

      toast.success("Cập nhật thông tin thành công!");
      
      // Refresh user data sau khi update
      await fetchUser();
      
      // Clear password fields
      form.setFieldsValue({
        password: "",
        confirmPassword: ""
      });

    } catch (error: any) {
      console.error("Lỗi cập nhật:", error);
      
      // Xử lý các loại lỗi
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn");
        localStorage.removeItem("accessToken");
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Dữ liệu không hợp lệ");
      } else {
        toast.error(error.message || "Cập nhật thất bại!");
      }
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin...</div>
      </div>
    );
  }

  // Error state
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

  // Main render
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
                  message: "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)",
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
    </>
  );
};

export default PersonalInfoPage;