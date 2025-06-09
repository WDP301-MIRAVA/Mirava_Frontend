import { Form, Input, Button, Checkbox, message } from "antd";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { userServ } from "../../services/userServie";
import { useState } from "react";
import { decodeToken } from "@/utils/Decodejwt";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      const loginData = {
        email: values.username,
        password: values.password,
      };

      // Gọi API login
      const res = await userServ.postLogin(loginData);
      console.log("Login response:", res);

      // Kiểm tra response có đủ dữ liệu không
      if (!res.data.accessToken) {
        throw new Error("Không nhận được access token");
      }

      // Lưu token vào localStorage
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      const user = decodeToken(res.data.accessToken)
      console.log({user})
      // // Lưu thông tin role và user info
      // // Kiểm tra xem API trả về role và user info như thế nào
      // if (res.data.user) {
      //   // Trường hợp API trả về user object
      //   localStorage.setItem("role", res.data.user.role || "customer");
      //   localStorage.setItem("userInfo", JSON.stringify({
      //     id: res.data.user.id,
      //     name: res.data.user.name || res.data.user.fullName,
      //     email: res.data.user.email,
      //     phone: res.data.user.phone,
      //   }));
      // } else if (res.data.role) {
      //   // Trường hợp API trả về role riêng biệt
      //   localStorage.setItem("role", res.data.role);
      //   localStorage.setItem("userInfo", JSON.stringify({
      //     id: res.data.userId || "unknown",
      //     name: res.data.userName || "User",
      //     email: values.username,
      //   }));
      // } else {
      //   // Fallback - mặc định là customer
      //   console.warn("API không trả về role, đặt mặc định là customer");
      //   localStorage.setItem("role", "customer");
      //   localStorage.setItem("userInfo", JSON.stringify({
      //     id: "unknown",
      //     name: "User",
      //     email: values.username,
      //   }));
      // }

      message.success("Đăng nhập thành công!");
      
      // Chuyển hướng dựa trên role
      switch (user.role) {
        case "Admin":
          navigate("/admin");
          break;
        case "doctor":
          navigate("/doctor"); // Nếu có role doctor
          break;
        case "customer":
        default:
          navigate("/customer");
          break;
      }

    } catch (error: unknown) {
      console.error("Login failed:", error);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!";
      
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object"
      ) {
        const err = error as { response: { status: number; data?: { message?: string } } };
        // Lỗi từ server
        switch (err.response.status) {
          case 401:
            errorMessage = "Email hoặc mật khẩu không đúng!";
            break;
          case 403:
            errorMessage = "Tài khoản của bạn đã bị khóa!";
            break;
          case 404:
            errorMessage = "Tài khoản không tồn tại!";
            break;
          case 500:
            errorMessage = "Lỗi server, vui lòng thử lại sau!";
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (
        typeof error === "object" &&
        error !== null &&
        "request" in error
      ) {
        // Lỗi mạng
        errorMessage = "Không thể kết nối đến server!";
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src="https://tuvanluat.vn/maytech_data/uploads/2019/01/Quy-%C4%91%E1%BB%8Bnh-x%E1%BB%AD-ph%E1%BA%A1t-ph%C3%B2ng-kh%C3%A1m-t%C6%B0-nh%C3%A2n.png"
          alt="Illustration"
          className="illustration"
        />
        <p className="tagline">
          "Đồng hành cùng bạn trong hành trình làm cha mẹ"
        </p>
      </div>

      <div className="login-right">
        <div className="login-box">
          <img
            src="../../assets/mirava-logo.png"
            alt="Mirava Logo"
            className="logo"
          />
          <h2>Đăng nhập tài khoản</h2>
          <Form name="login" layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email hoặc Số điện thoại"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email hoặc số điện thoại!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="remember"
              valuePropName="checked"
              className="remember-me"
            >
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>

            <Form.Item>
              <a
                className="forgot-password"
                href="#"
                style={{ color: "#24B5CF" }}
              >
                Quên mật khẩu?
              </a>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{ backgroundColor: "#24B5CF" }}
                loading={loading}
              >
                Đăng nhập
              </Button>
            </Form.Item>

            <p className="register-link">
              Chưa có tài khoản?{" "}
              <Link to={"/register"} style={{ color: "#24B5CF" }}>
                Đăng ký ngay
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;