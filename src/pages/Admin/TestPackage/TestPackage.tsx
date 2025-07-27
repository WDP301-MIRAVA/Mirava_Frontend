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
import { useFormik } from "formik";
import * as Yup from "yup";
import { TestPackageService } from "@/services/test-packages.service";
import { Table, Space } from "antd";
import toast from "react-hot-toast";

interface Test {
  testName: string;
  testCode: string;
  normalRange: string;
  unit: string;
}

interface TestPackage {
  _id?: string;
  name: string;
  description: string;
  type: string;
  treatmentSubjects: string[];
  tests: Test[];
  treatmentProcess: string[];
  treatmentProcessImage: string;
  price: number;
  duration: string;
  preparation: string;
  imageUrl: string;
  isActive: boolean;
}

export default function TestPackagePage() {
  const [data, setData] = useState<TestPackage[]>([]);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestPackage | null>(null);

  const fetchData = async () => {
    try {
      const res = await TestPackageService.getAll();
      setData(res.data);
    } catch (err) {
      console.error("Error fetching test packages", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (item?: TestPackage) => {
    if (item) {
      setEditingItem(item);
      formik.setValues({
        ...item,
        treatmentSubjects: item.treatmentSubjects.join("\n"),
        treatmentProcess: item.treatmentProcess.join("\n"),
        tests: JSON.stringify(item.tests, null, 2),
      });
    } else {
      setEditingItem(null);
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    formik.resetForm();
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await TestPackageService.delete(id);
      toast.success("Xóa thành công");
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi xóa");
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      type: "male",
      treatmentSubjects: "",
      tests: "",
      treatmentProcess: "",
      treatmentProcessImage: "",
      price: 0,
      duration: "",
      preparation: "",
      imageUrl: "",
      isActive: true,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
      price: Yup.number().required("Required").positive(),
      duration: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      const payload: TestPackage = {
        ...values,
        treatmentSubjects: values.treatmentSubjects.split("\n"),
        treatmentProcess: values.treatmentProcess.split("\n"),
        tests: editingItem?.tests || [
          {
            testName: "Karyotype (NST đồ)",
            testCode: "K001",
            normalRange: "46, XY",
            unit: "",
          },
        ],
      };

      try {
        if (editingItem?._id) {
          await TestPackageService.update(editingItem._id, payload);
          toast.success("Cập nhật thành công");
        } else {
          await TestPackageService.create(payload);
          toast.success("Tạo mới thành công");
        }
        fetchData();
        handleClose();
      } catch (err) {
        toast.error("Có lỗi xảy ra");
      }
    },
  });

  const columns = [
    {
      title: "Tên gói",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (type === "male" ? "Nam" : "Nữ"),
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      render: (price: number) => price.toLocaleString() + " đ",
    },
    {
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) =>
        active ? "Đang hoạt động" : "Không hoạt động",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: TestPackage) => (
        <Space>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleOpen(record)}
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
    <Box sx={{ p: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Quản lý gói xét nghiệm</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Thêm gói
        </Button>
      </Box>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        bordered
        pagination={{ pageSize: 5 }}
      />

      {/* Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? "Cập nhật gói" : "Thêm gói xét nghiệm"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              margin="dense"
              label="Tên gói"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={!!formik.errors.name && formik.touched.name}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Mô tả"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={!!formik.errors.description && formik.touched.description}
              helperText={
                formik.touched.description && formik.errors.description
              }
            />
            <TextField
              fullWidth
              margin="dense"
              label="Loại (male/female)"
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              margin="dense"
              label="Đối tượng điều trị"
              name="treatmentSubjects"
              value={formik.values.treatmentSubjects}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              margin="dense"
              label="Quy trình điều trị"
              name="treatmentProcess"
              value={formik.values.treatmentProcess}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Link ảnh quy trình"
              name="treatmentProcessImage"
              value={formik.values.treatmentProcessImage}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              type="number"
              margin="dense"
              label="Giá"
              name="price"
              value={formik.values.price}
              onChange={formik.handleChange}
              error={!!formik.errors.price && formik.touched.price}
              helperText={formik.touched.price && formik.errors.price}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Thời gian"
              name="duration"
              value={formik.values.duration}
              onChange={formik.handleChange}
              error={!!formik.errors.duration && formik.touched.duration}
              helperText={formik.touched.duration && formik.errors.duration}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Chuẩn bị"
              name="preparation"
              value={formik.values.preparation}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Ảnh đại diện"
              name="imageUrl"
              value={formik.values.imageUrl}
              onChange={formik.handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingItem ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
