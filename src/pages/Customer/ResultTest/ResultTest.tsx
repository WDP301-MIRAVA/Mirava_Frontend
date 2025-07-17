import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Stack,
  LinearProgress,
} from "@mui/material";
import {
  Visibility,
  Download,
  Assessment,
  Person,
  CalendarToday,
  MedicalServices,
  Assignment,
  Close,
  Info,
  CheckCircle,
  Warning,
  Error,
  Schedule,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface TestResult {
  _id: string;
  testRegistration: string;
  patient: string;
  testPackage: {
    _id: string;
    name: string;
    type: string;
    tests: Array<{
      _id: string;
      testName: string;
      normalRange: string;
      unit: string;
    }>;
    duration: string;
    preparation: string;
    price: number;
  } | null;
  performedBy: {
    _id: string;
    user: string;
    degree: string;
    specialty: string;
  };
  reviewedBy?: {
    _id: string;
    user: string;
    degree: string;
    specialty: string;
  };
  testDate: string;
  results: Array<{
    testName: string;
    testCode: string;
    value: string;
    unit: string;
    normalRange: string;
    status: "normal" | "abnormal" | "borderline";
    notes?: string;
    _id: string;
  }>;
  overallStatus: "normal" | "abnormal" | "review_needed";
  doctorNotes: string;
  recommendations: string;
  attachments: Array<{
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
  }>;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

const ResultTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Vui lòng đăng nhập để xem kết quả xét nghiệm");
        navigate("/login");
        return;
      }

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/test-results/my-results",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải kết quả xét nghiệm");
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      if (data.success) {
        // KHÔNG lọc bỏ kết quả có testPackage null - hiển thị tất cả
        setTestResults(data.data);
        console.log("Tất cả kết quả xét nghiệm:", data.data);
      } else {
        throw new Error(data.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Lỗi khi tải kết quả xét nghiệm:", error);
      setError(error.message);
      toast.error(error.message || "Có lỗi xảy ra khi tải kết quả xét nghiệm");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "success";
      case "abnormal":
        return "error";
      case "borderline":
        return "warning";
      case "review_needed":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle color="success" />;
      case "abnormal":
        return <Error color="error" />;
      case "borderline":
        return <Warning color="warning" />;
      case "review_needed":
        return <Info color="info" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "Bình thường";
      case "abnormal":
        return "Bất thường";
      case "borderline":
        return "Biên giới";
      case "review_needed":
        return "Cần xem xét";
      default:
        return "Chưa xác định";
    }
  };

  const handleViewDetails = (result: TestResult) => {
    setSelectedResult(result);
    setDetailDialogOpen(true);
  };

  const handleDownloadResult = async (resultId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/test-results/${resultId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải file kết quả");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ket-qua-xet-nghiem-${resultId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Tải file kết quả thành công");
    } catch (error: any) {
      console.error("Lỗi tải file:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tải file");
    }
  };

  const calculateAbnormalCount = (results: TestResult["results"]) => {
    return results.filter((r) => r.status === "abnormal").length;
  };

  // Tạo tên gói xét nghiệm dựa trên kết quả nếu testPackage null
  const getTestPackageName = (result: TestResult) => {
    if (result.testPackage?.name) {
      return result.testPackage.name;
    }

    // Tạo tên từ các xét nghiệm trong results
    const testNames = result.results.map((r) => r.testName).join(", ");
    return testNames || "Gói xét nghiệm tổng hợp";
  };

  const getTestPackageType = (result: TestResult) => {
    if (result.testPackage?.type) {
      return result.testPackage.type;
    }

    // Dựa trên tên xét nghiệm để phân loại
    const testNames = result.results
      .map((r) => r.testName.toLowerCase())
      .join(" ");
    if (
      testNames.includes("amh") ||
      testNames.includes("fsh") ||
      testNames.includes("lh")
    ) {
      return "Xét nghiệm hormone nữ";
    }
    return "Xét nghiệm tổng hợp";
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchTestResults}>
          Thử lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          color="primary"
          gutterBottom
        >
          Kết quả xét nghiệm
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem và theo dõi kết quả các xét nghiệm đã thực hiện
        </Typography>
      </Box>

      {/* Debug Info - Hiển thị tạm thời để kiểm tra */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Tìm thấy {testResults.length} kết quả xét nghiệm
      </Alert>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {testResults.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng số xét nghiệm
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {
                      testResults.filter((r) => r.overallStatus === "normal")
                        .length
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kết quả bình thường
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {
                      testResults.filter(
                        (r) => r.overallStatus === "review_needed"
                      ).length
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cần xem xét
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results List */}
      {testResults.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Assessment
                sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có kết quả xét nghiệm
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Bạn chưa thực hiện xét nghiệm nào hoặc kết quả chưa sẵn sàng
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/reproductive-health-testing")}
              >
                Đăng ký xét nghiệm
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {testResults.map((result) => (
            <Grid item xs={12} key={result._id}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {getTestPackageName(result)}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={1}
                      >
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Ngày xét nghiệm: {formatDate(result.testDate)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Bác sĩ thực hiện:{" "}
                          {result.performedBy?.degree || "Chưa cập nhật"} -{" "}
                          {result.performedBy?.specialty || "Chưa cập nhật"}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        icon={getStatusIcon(result.overallStatus)}
                        label={getStatusText(result.overallStatus)}
                        color={getStatusColor(result.overallStatus) as any}
                        variant="outlined"
                      />
                      {result.isReviewed && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Đã tư vấn"
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Loại xét nghiệm: {getTestPackageType(result)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Số lượng xét nghiệm: {result.results?.length || 0}
                        </Typography>
                        {calculateAbnormalCount(result.results) > 0 && (
                          <Typography variant="body2" color="error.main">
                            Có {calculateAbnormalCount(result.results)} chỉ số
                            bất thường
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetails(result)}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Download />}
                          onClick={() => handleDownloadResult(result._id)}
                        >
                          Tải xuống
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Chi tiết kết quả xét nghiệm</Typography>
            <IconButton onClick={() => setDetailDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              {/* Basic Info */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin cơ bản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Tên gói xét nghiệm
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {getTestPackageName(selectedResult)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Loại xét nghiệm
                      </Typography>
                      <Typography variant="body1">
                        {getTestPackageType(selectedResult)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày xét nghiệm
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedResult.testDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Bác sĩ thực hiện
                      </Typography>
                      <Typography variant="body1">
                        {selectedResult.performedBy?.degree || "Chưa cập nhật"}{" "}
                        -{" "}
                        {selectedResult.performedBy?.specialty ||
                          "Chưa cập nhật"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Test Results */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Kết quả xét nghiệm chi tiết
                  </Typography>
                  {selectedResult.results &&
                  selectedResult.results.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Tên xét nghiệm</TableCell>
                            <TableCell>Mã xét nghiệm</TableCell>
                            <TableCell>Kết quả</TableCell>
                            <TableCell>Đơn vị</TableCell>
                            <TableCell>Giá trị bình thường</TableCell>
                            <TableCell>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedResult.results.map((result, index) => (
                            <TableRow key={result._id || index}>
                              <TableCell>{result.testName}</TableCell>
                              <TableCell>{result.testCode}</TableCell>
                              <TableCell>
                                <Typography
                                  color={
                                    result.status === "abnormal"
                                      ? "error"
                                      : "inherit"
                                  }
                                  fontWeight={
                                    result.status === "abnormal"
                                      ? "bold"
                                      : "normal"
                                  }
                                >
                                  {result.value}
                                </Typography>
                              </TableCell>
                              <TableCell>{result.unit}</TableCell>
                              <TableCell>{result.normalRange}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={getStatusText(result.status)}
                                  color={getStatusColor(result.status) as any}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có kết quả xét nghiệm chi tiết
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Doctor Notes */}
              {selectedResult.doctorNotes && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Nhận xét của bác sĩ
                    </Typography>
                    <Typography variant="body1">
                      {selectedResult.doctorNotes}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {selectedResult.recommendations && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Khuyến nghị
                    </Typography>
                    <Typography variant="body1">
                      {selectedResult.recommendations}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {selectedResult.attachments &&
                selectedResult.attachments.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        File đính kèm
                      </Typography>
                      <Stack spacing={1}>
                        {selectedResult.attachments.map((attachment, index) => (
                          <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <Assignment color="action" />
                            <Typography variant="body2">
                              {attachment.originalName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ({Math.round(attachment.size / 1024)} KB)
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
          {selectedResult && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleDownloadResult(selectedResult._id)}
            >
              Tải xuống
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ResultTest;
