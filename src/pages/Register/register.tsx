import { Form, Input, Button } from "antd";
import "./register.css";
import { Link } from "react-router-dom";
import { userServ } from "../../services/userServie";
import Header from "../../components/Header/index";
import Footer from "../../components/Footer";
import logo from '../../assets/mirava-logo.png'; 
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      await userServ.postSignUp(values);
      console.log("Đăng ký thành công:", values);
      navigate("/login");
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
    }
  };

  return (
    <div className="register-page">
      <Header />
      <div className="register-container">
        <div className="register-left">
          <img
            src="https://tuvanluat.vn/maytech_data/uploads/2019/01/Quy-%C4%91%E1%BB%8Bnh-x%E1%BB%AD-ph%E1%BA%A1t-ph%C3%B2ng-kh%C3%A1m-t%C6%B0-nh%C3%A2n.png"
            alt="Illustration"
            className="illustration"
          />
          <p className="tagline">
            "Đồng hành cùng bạn trong hành trình làm cha mẹ"
          </p>
        </div>

        <div className="register-right">
          <div className="register-box">
            <img src={logo} alt="Mirava Logo" className="logo-image" />
            <h2>Tạo tài khoản mới</h2>

            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Họ và tên"
                name="userName"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password size="large" />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Mật khẩu không khớp!");
                    },
                  }),
                ]}
              >
                <Input.Password size="large" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  className="register-button"
                >
                  Đăng ký
                </Button>
              </Form.Item>

              <p className="login-link">
                Đã có tài khoản?{" "}
                <Link to={"/login"} className="login-link-text">
                  Đăng nhập
                </Link>
              </p>
            </Form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;