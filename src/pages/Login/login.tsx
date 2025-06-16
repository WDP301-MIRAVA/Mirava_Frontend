import { Form, Input, Button, Checkbox } from "antd";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { userServ } from "../../services/userServie";
import { useState } from "react";
import { decodeToken } from "@/utils/Decodejwt";
import { toast } from "react-hot-toast";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hàm hiển thị thông báo thành công
  const showSuccessNotification = (message: string) => {
    toast.success(message, { duration: 4000, position: "top-right" });
  };

  // Hàm hiển thị thông báo lỗi
  const showErrorNotification = (title: string, description: string) => {
    toast.error(`${title}: ${description}`, {
      duration: 4000,
      position: "top-right",
    });
  };

  // Hàm hiển thị thông báo cảnh báo
  const showWarningNotification = (title: string, description: string) => {
    toast(`${title}: ${description}`, {
      duration: 4000,
      position: "top-right",
      icon: "⚠️",
    });
  };

  // Hàm hiển thị thông báo thông tin
  const showInfoNotification = (title: string, description: string) => {
    toast(`${title}: ${description}`, {
      duration: 4000,
      position: "top-right",
      icon: "ℹ️",
    });
  };

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);

      // Kiểm tra input trống
      if (!values.username || !values.password) {
        showWarningNotification(
          "Thông tin không đầy đủ",
          "Vui lòng nhập đầy đủ email và mật khẩu để đăng nhập!"
        );
        return;
      }

      // Kiểm tra format email cơ bản
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{10,11}$/;

      if (
        !emailRegex.test(values.username) &&
        !phoneRegex.test(values.username)
      ) {
        showWarningNotification(
          "Định dạng không hợp lệ",
          "Vui lòng nhập đúng định dạng email hoặc số điện thoại!"
        );
        return;
      }

      const loginData = {
        email: values.username,
        password: values.password,
      };

      // Gọi API login
      console.log("Login data:", loginData);
      const res = await userServ.postLogin(loginData);
      console.log("Login response:", res);

      // Kiểm tra response có đủ dữ liệu không
      if (!res.data.accessToken) {
        throw new Error("Không nhận được access token từ server");
      }

      // Lưu token vào localStorage
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      const user = decodeToken(res.data.accessToken);
      console.log("Decoded user:", user);

      // Kiểm tra user decode thành công
      if (!user || !user.role) {
        throw new Error("Không thể xác thực thông tin người dùng");
      }

      // Lưu thông tin user vào localStorage để useAuth hook sử dụng
      localStorage.setItem("role", user.role);
      localStorage.setItem("userInfo", JSON.stringify(user));

      // ✅ THÔNG BÁO ĐĂNG NHẬP THÀNH CÔNG
      showSuccessNotification(
        `Chào mừng ${
          user.name || user.userName || "bạn"
        } đã đăng nhập thành công!`
      );

      // Chuyển hướng dựa trên role sau 1.5s để user có thể thấy thông báo
      setTimeout(() => {
        switch (user.role) {
          case "Admin":
            navigate("/admin");
            break;
          case "Doctor":
            navigate("/doctor");
            break;
          case "Customer":
          default:
            navigate("/customer");
            break;
        }
      }, 1500);
    } catch (error: any) {
      console.error("Login failed:", error);

      // Xử lý các loại lỗi khác nhau
      if (error?.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        console.log("Status:", status);
        console.log("Message:", serverMessage);

        switch (status) {
          case 400:
            showErrorNotification(
              "Yêu cầu không hợp lệ",
              serverMessage ||
                "Dữ liệu đăng nhập không hợp lệ. Vui lòng kiểm tra lại!"
            );
            break;

          case 401:
            // ✅ XỬ LÝ CHÍNH XÁC CHO TRƯỜNG HỢP SAI USERNAME/PASSWORD
            showErrorNotification(
              "Thông tin đăng nhập sai",
              serverMessage ||
                "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!"
            );
            break;

          case 403:
            showWarningNotification(
              "Tài khoản bị khóa",
              "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ!"
            );
            break;

          case 404:
            showErrorNotification(
              "Tài khoản không tồn tại",
              "Email này chưa được đăng ký. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới!"
            );
            break;

          case 422:
            showWarningNotification(
              "Tài khoản chưa được xác thực",
              "Tài khoản của bạn chưa được xác thực email. Vui lòng kiểm tra email để kích hoạt tài khoản!"
            );
            break;

          case 429:
            showWarningNotification(
              "Quá nhiều lần thử",
              "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng chờ một lúc rồi thử lại!"
            );
            break;

          case 500:
            showErrorNotification(
              "Lỗi hệ thống",
              "Đã xảy ra lỗi từ phía server. Vui lòng thử lại sau ít phút!"
            );
            break;

          case 502:
          case 503:
          case 504:
            showErrorNotification(
              "Dịch vụ tạm thời không khả dụng",
              "Hệ thống đang bảo trì. Vui lòng thử lại sau!"
            );
            break;

          default:
            showErrorNotification(
              "Đăng nhập thất bại",
              serverMessage || "Đã xảy ra lỗi không xác định. Vui lòng thử lại!"
            );
        }
      } else if (error?.request) {
        // Lỗi mạng - không nhận được response từ server
        showErrorNotification(
          "Lỗi kết nối",
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại!"
        );
      } else if (error?.code === "ECONNABORTED") {
        // Timeout
        showWarningNotification(
          "Kết nối quá chậm",
          "Yêu cầu đăng nhập mất quá nhiều thời gian. Vui lòng thử lại!"
        );
      } else if (error?.message?.includes("token")) {
        // Lỗi liên quan đến token
        showErrorNotification(
          "Lỗi xác thực",
          "Không thể xác thực thông tin đăng nhập. Vui lòng thử lại!"
        );
      } else {
        // Lỗi khác
        showErrorNotification(
          "Đăng nhập thất bại",
          error?.message ||
            "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau!"
        );
      }
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
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const phoneRegex = /^[0-9]{10,11}$/;

                    if (emailRegex.test(value) || phoneRegex.test(value)) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "Vui lòng nhập đúng định dạng email hoặc số điện thoại!"
                      )
                    );
                  },
                },
              ]}
            >
              <Input placeholder="Nhập email hoặc số điện thoại" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
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
                onClick={(e) => {
                  e.preventDefault();
                  showInfoNotification(
                    "Quên mật khẩu",
                    "Tính năng này đang được phát triển. Vui lòng liên hệ quản trị viên để được hỗ trợ!"
                  );
                }}
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
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
