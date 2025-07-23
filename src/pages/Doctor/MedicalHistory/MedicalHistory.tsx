import React, { useState } from "react";
import { Button, Form, Input, Modal, Space, Tag, Descriptions } from "antd";
import { MedicalHistoryService } from "@/services/medical-history.service";
import toast from "react-hot-toast";

interface User {
  userId: string;
  userName: string;
}
interface MedicalHistoryType {
  diseases: string[];
  allergies?: string;
  note?: string;
}
const MedicalHistory: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [medicalHistory, setMedicalHistory] =
    useState<MedicalHistoryType | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchUserAndHistory = async () => {
    setLoading(true);
    try {
      const foundUser = await MedicalHistoryService.findUserByKeyword(keyword);
      setUser(foundUser?.data);
      const history = await MedicalHistoryService.getMedicalHistoryByUserId(
        foundUser?.data?.userId
      );
      setMedicalHistory(history?.data);
    } catch {
      setMedicalHistory(null);
      toast.error("Không tìm thấy bệnh nhân hoặc chưa có tiền sử.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = () => {
    form.setFieldsValue({
      ...medicalHistory,
      diseases: medicalHistory?.diseases?.join(", "),
    });
    setModalVisible(true);
  };

  const handleDelete = async () => {
    if (!user) {
      toast.error("Không tìm thấy thông tin bệnh nhân");
      return;
    }

    try {
      await MedicalHistoryService.deleteMedicalHistory(user.userId);
      toast.success("Xoá thành công");
      setMedicalHistory(null);
    } catch {
      toast.error("Xoá thất bại");
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Không tìm thấy thông tin bệnh nhân");
      return;
    }

    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        diseases: values.diseases.split(",").map((d: string) => d.trim()),
        user: user.userId,
      };

      if (medicalHistory) {
        await MedicalHistoryService.updateMedicalHistory(user.userId, payload);
        toast.success("Cập nhật thành công");
      } else {
        await MedicalHistoryService.createMedicalHistory(payload);
        toast.success("Tạo mới thành công");
      }

      setModalVisible(false);
      fetchUserAndHistory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý Tiền sử Y tế</h2>
      <Space>
        <Input
          placeholder="Nhập mã bệnh nhân hoặc SĐT"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={fetchUserAndHistory} loading={loading}>
          Tìm kiếm
        </Button>
      </Space>

      {user && (
        <div style={{ marginTop: 32 }}>
          <h3>
            Bệnh nhân: <strong>{user?.userName}</strong>
          </h3>

          {medicalHistory ? (
            <>
              <Descriptions
                bordered
                column={1}
                size="middle"
                style={{ marginTop: 16, maxWidth: 600 }}
                title="Thông tin tiền sử y tế"
              >
                <Descriptions.Item label="Bệnh">
                  {medicalHistory?.diseases?.length > 0
                    ? medicalHistory.diseases.map((d: string) => (
                        <Tag color="blue" key={d}>
                          {d}
                        </Tag>
                      ))
                    : "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Dị ứng">
                  {medicalHistory.allergies || "Không"}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">
                  {medicalHistory.note || "Không có"}
                </Descriptions.Item>
              </Descriptions>

              <Space style={{ marginTop: 16 }}>
                <Button onClick={openEditModal}>Cập nhật</Button>

                <Button danger onClick={handleDelete}>
                  Xoá
                </Button>
              </Space>
            </>
          ) : (
            <Button
              type="primary"
              style={{ marginTop: 16 }}
              onClick={openCreateModal}
            >
              Tạo tiền sử y tế
            </Button>
          )}
        </div>
      )}

      <Modal
        open={modalVisible}
        title={medicalHistory ? "Cập nhật tiền sử" : "Tạo tiền sử mới"}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Danh sách bệnh"
            name="diseases"
            rules={[{ required: true, message: "Vui lòng nhập bệnh" }]}
          >
            <Input placeholder="VD: Bệnh tim, Bệnh sinh sản" />
          </Form.Item>
          <Form.Item label="Dị ứng" name="allergies">
            <Input placeholder="VD: Dị ứng hải sản" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea placeholder="Ghi chú thêm nếu có..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalHistory;
