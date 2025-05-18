import { Form, Input, Button, Checkbox } from "antd";
import "./login.css";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const onFinish = (values) => {
    console.log("Success:", values);
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
          <img src="mirava-logo.png" alt="Mirava Logo" className="logo" />
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
