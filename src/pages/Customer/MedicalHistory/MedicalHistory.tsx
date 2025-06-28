import {
  Form,
  Input,
  Checkbox,
  Button,
  Card,
  Row,
  Col,
  Typography,
} from "antd";
import "./MedicalHistory.css";

const { Title } = Typography;

const diseaseOptions = [
  "Tăng huyết áp",
  "Tiểu đường",
  "Bệnh tim mạch",
  "Hen suyễn",
  "Ung thư",
  "Bệnh gan",
  "Bệnh thận",
  "Dị ứng",
];

const MedicalHistory = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Form values:", values);
  };

  return (
    <Card className="medical-card">
      <Title level={3} style={{ textAlign: "center" }}>
        Tiền sử y tế
      </Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Tiền sử bệnh lý" name="diseases">
          <Checkbox.Group options={diseaseOptions} />
        </Form.Item>

        <Form.Item label="Ghi chú thêm" name="note">
          <Input.TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết nếu có..."
          />
        </Form.Item>

        <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
          <Button type="primary" htmlType="submit" size="large">
            Lưu thông tin
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default MedicalHistory;
