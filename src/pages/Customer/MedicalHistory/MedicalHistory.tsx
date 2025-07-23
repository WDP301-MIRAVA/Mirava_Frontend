import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Container,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  MedicalServices,
  Edit,
  LocalHospital,
  Warning,
  Note,
  AccessTime,
  Update,
  Add,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { MedicalHistoryService } from "../../../services/medical-history.service";
import MedicalHistoryModal from "./MedicalHistoryModal";
interface AxiosError {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
      [key: string]: unknown;
    };
  };
}
// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[3],
  borderRadius: (theme.shape.borderRadius as number) * 2,
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-2px)",
  },
  transition: "all 0.3s ease-in-out",
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(3),
  borderRadius: (theme.shape.borderRadius as number) * 2,
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "400px",
  padding: theme.spacing(3),
}));

// Interface định nghĩa cấu trúc dữ liệu cho hệ thống điều trị hiếm muộn
interface UserInfo {
  id: string;
  userName: string;
  email: string;
  phone: string;
}

export interface MedicalHistoryData {
  _id: string;
  user: UserInfo;
  diseases: string[];
  note: string;
  allergies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistoryFormData {
  diseases: string;
  allergies: string;
  note: string;
}

const MedicalHistory: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [medicalHistory, setMedicalHistory] =
    useState<MedicalHistoryData | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Lấy thông tin user từ localStorage với error handling
  const getUserInfo = (): UserInfo | null => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      return null;
    }
  };

  // Hiển thị thông báo
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ): void => {
    setSnackbar({ open: true, message, severity });
  };

  // Đóng thông báo
  const handleCloseSnackbar = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Hàm lấy tiền sử y tế từ API sử dụng MedicalHistoryService
  const fetchMedicalHistory = useCallback(async (): Promise<void> => {
    setFetchLoading(true);
    try {
      const userInfo = getUserInfo();

      if (!userInfo?.id) {
        showSnackbar("Vui lòng đăng nhập để xem thông tin", "error");
        return;
      }

      // Sử dụng MedicalHistoryService thay vì gọi API trực tiếp
      const response = await MedicalHistoryService.getMedicalHistoryByUserId(
        userInfo.id
      );

      if (response.success) {
        setMedicalHistory(response.data);
      } else {
        setMedicalHistory(null);
        setOpenDialog(true);
      }
    } catch (error: unknown) {
      console.error("Lỗi khi tải tiền sử y tế:", error);

      // Xử lý lỗi 404 (chưa có tiền sử y tế)
      if (error && (error as AxiosError).response?.status === 404) {
        setMedicalHistory(null);
        setOpenDialog(true);
      } else {
        showSnackbar("Không thể tải thông tin tiền sử y tế", "error");
      }
    } finally {
      setFetchLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchMedicalHistory();
  }, [fetchMedicalHistory]);

  // Xử lý submit form sử dụng MedicalHistoryService
  const handleSubmit = async (
    formData: MedicalHistoryFormData
  ): Promise<void> => {
    setLoading(true);
    try {
      const userInfo = getUserInfo();

      if (!userInfo?.id) {
        showSnackbar("Vui lòng đăng nhập để thực hiện thao tác", "error");
        return;
      }

      // Validate form data
      if (!formData.diseases.trim()) {
        showSnackbar("Vui lòng nhập tiền sử bệnh lý", "warning");
        return;
      }

      // Chuẩn bị dữ liệu để gửi lên server
      const payload = {
        user: userInfo.id,
        diseases: formData.diseases
          .split(",")
          .map((d: string) => d.trim())
          .filter((d) => d),
        allergies: formData.allergies ? formData.allergies : undefined, // <-- sửa ở đây
        note: formData.note || "",
      };

      let response;

      if (medicalHistory) {
        // Cập nhật tiền sử y tế có sẵn
        response = await MedicalHistoryService.updateMedicalHistory(
          userInfo.id,
          payload
        );
      } else {
        // Tạo mới tiền sử y tế
        response = await MedicalHistoryService.createMedicalHistory(payload);
      }

      if (response.success) {
        showSnackbar(
          medicalHistory
            ? "Cập nhật tiền sử y tế thành công!"
            : "Tạo tiền sử y tế thành công!",
          "success"
        );
        setMedicalHistory(response.data);
        setOpenDialog(false);
        await fetchMedicalHistory();
      } else {
        showSnackbar(response.message || "Có lỗi xảy ra!", "error");
      }
    } catch (error: unknown) {
      console.error("Lỗi khi lưu tiền sử y tế:", error);
      showSnackbar(
        (error as AxiosError).response?.data?.message ||
          "Có lỗi xảy ra khi lưu thông tin!",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chỉnh sửa
  const handleEdit = (): void => {
    setOpenDialog(true);
  };

  // Xử lý đóng modal
  const handleCloseModal = (): void => {
    setOpenDialog(false);
  };

  // Format ngày tháng theo định dạng Việt Nam
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Hiển thị loading state
  if (fetchLoading) {
    return (
      <Container maxWidth="lg">
        <LoadingContainer>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Đang tải thông tin tiền sử y tế...
          </Typography>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <HeaderCard>
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Avatar
              sx={{
                bgcolor: "primary.contrastText",
                color: "primary.main",
                mb: 2,
                width: 64,
                height: 64,
              }}
            >
              <MedicalServices fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Tiền sử y tế của tôi
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ opacity: 0.9 }}
            >
              Quản lý và cập nhật thông tin tiền sử y tế để hỗ trợ quá trình
              điều trị hiếm muộn
            </Typography>
          </Box>
        </CardContent>
      </HeaderCard>

      {/* Content */}
      {medicalHistory ? (
        <Grid spacing={3}>
          {/* Thông tin cập nhật */}
          <Box
            sx={{
              width: {
                xs: "100%", // tương đương xs={12}
                md: "50%", // tương đương md={6}
              },
              px: 1, // padding ngang (tùy ý nếu bạn cần giữ khoảng cách giống Grid spacing)
              boxSizing: "border-box",
            }}
          >
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccessTime color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Thông tin cập nhật</Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Add fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Ngày tạo"
                      secondary={formatDate(medicalHistory.createdAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Update fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cập nhật lần cuối"
                      secondary={formatDate(medicalHistory.updatedAt)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </StyledCard>
          </Box>
          <Box
            sx={{
              width: {
                xs: "100%", // tương đương xs={12}
              },
              px: 1, // padding ngang (tùy ý nếu bạn cần giữ khoảng cách giống Grid spacing)
              boxSizing: "border-box",
            }}
          >
            <StyledCard>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Box display="flex" alignItems="center">
                    <LocalHospital color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Thông tin tiền sử y tế</Typography>
                  </Box>
                  <IconButton color="primary" onClick={handleEdit}>
                    <Edit />
                  </IconButton>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Tiền sử bệnh lý */}
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    <LocalHospital sx={{ mr: 1, verticalAlign: "middle" }} />
                    Tiền sử bệnh lý:
                  </Typography>
                  <Box>
                    {medicalHistory.diseases.length > 0 ? (
                      medicalHistory.diseases.map(
                        (disease: string, index: number) => (
                          <StyledChip
                            key={index}
                            label={disease}
                            color="error"
                            variant="outlined"
                            size="small"
                          />
                        )
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chưa có thông tin bệnh lý
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Dị ứng */}
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    <Warning sx={{ mr: 1, verticalAlign: "middle" }} />
                    Dị ứng:
                  </Typography>
                  <Box>
                    {medicalHistory.allergies.length > 0 ? (
                      medicalHistory.allergies.map(
                        (allergy: string, index: number) => (
                          <StyledChip
                            key={index}
                            label={allergy}
                            color="warning"
                            variant="outlined"
                            size="small"
                          />
                        )
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có dị ứng
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Ghi chú */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    <Note sx={{ mr: 1, verticalAlign: "middle" }} />
                    Ghi chú của bác sĩ:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="body2">
                      {medicalHistory.note || "Không có ghi chú"}
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </StyledCard>
          </Box>
        </Grid>
      ) : (
        <Box textAlign="center" py={6}>
          <MedicalServices
            sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            Chưa có thông tin tiền sử y tế
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Vui lòng tạo tiền sử y tế để hỗ trợ quá trình điều trị hiếm muộn
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setOpenDialog(true)}
            startIcon={<Add />}
          >
            Tạo tiền sử y tế
          </Button>
        </Box>
      )}

      {/* Floating Action Button */}
      {medicalHistory && (
        <Fab
          color="primary"
          aria-label="edit"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={handleEdit}
        >
          <Edit />
        </Fab>
      )}

      {/* Medical History Modal */}
      <MedicalHistoryModal
        open={openDialog}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        medicalHistory={medicalHistory}
        loading={loading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MedicalHistory;
