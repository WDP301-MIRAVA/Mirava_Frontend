import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { Table, Space, Popconfirm, message } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PackageService } from "@/services/package-service.service";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await PackageService.getAll();
      setServices(res);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu dịch vụ");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: "",
      method: "",
      imageUrl: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Tên là bắt buộc"),
      shortDescription: Yup.string().required("Mô tả ngắn là bắt buộc"),
      description: Yup.string().required("Mô tả chi tiết là bắt buộc"),
      price: Yup.number().required("Giá là bắt buộc"),
      method: Yup.string().required("Phương pháp là bắt buộc"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          shortDescription: values.shortDescription.split("\n"),
        };

        if (editingService) {
          await PackageService.update(editingService._id, payload);
          message.success("Cập nhật thành công");
        } else {
          await PackageService.create(payload);
          message.success("Tạo mới thành công");
        }
        fetchServices();
        handleClose();
      } catch (error) {
        message.error("Lỗi khi lưu dịch vụ");
      }
    },
  });

  const handleClose = () => {
    setOpen(false);
    setEditingService(null);
    formik.resetForm();
  };

  const handleEdit = (record) => {
    setEditingService(record);
    formik.setValues({
      name: record.name,
      shortDescription: record.shortDescription.join("\n"),
      description: record.description || "",
      price: record.price,
      method: record.method,
      imageUrl: record.imageUrl || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await PackageService.delete(id);
      message.success("Xóa thành công");
      fetchServices();
    } catch (error) {
      message.error("Lỗi khi xóa dịch vụ");
    }
  };

  const columns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phương pháp",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "Giá (VND)",
      dataIndex: "price",
      key: "price",
      render: (price) => price.toLocaleString() + " đ",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleEdit(record)}
          >
            Cập nhật
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Box p={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Quản lý dịch vụ điều trị</Typography>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Thêm dịch vụ
        </Button>
      </Box>

      <Table
        dataSource={services}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingService ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              label="Tên dịch vụ"
              fullWidth
              margin="dense"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              label="Mô tả ngắn (mỗi dòng 1 mục)"
              fullWidth
              multiline
              rows={4}
              margin="dense"
              name="shortDescription"
              value={formik.values.shortDescription}
              onChange={formik.handleChange}
              error={
                formik.touched.shortDescription &&
                Boolean(formik.errors.shortDescription)
              }
              helperText={
                formik.touched.shortDescription &&
                formik.errors.shortDescription
              }
            />
            <TextField
              label="Mô tả chi tiết"
              fullWidth
              margin="dense"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
            />
            <TextField
              label="Giá"
              fullWidth
              type="number"
              margin="dense"
              name="price"
              value={formik.values.price}
              onChange={formik.handleChange}
              error={formik.touched.price && Boolean(formik.errors.price)}
              helperText={formik.touched.price && formik.errors.price}
            />
            <TextField
              label="Phương pháp"
              fullWidth
              margin="dense"
              name="method"
              value={formik.values.method}
              onChange={formik.handleChange}
              error={formik.touched.method && Boolean(formik.errors.method)}
              helperText={formik.touched.method && formik.errors.method}
            />
            <TextField
              label="Ảnh (URL)"
              fullWidth
              margin="dense"
              name="imageUrl"
              value={formik.values.imageUrl}
              onChange={formik.handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingService ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ServiceManagement;
