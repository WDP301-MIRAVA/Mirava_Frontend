import React, { useState, useEffect, useCallback } from "react";
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
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Visibility,
  Download,
  Assessment,
  Person,
  CalendarToday,
  Assignment,
  Close,
  Info,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Schedule,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { ChipPropsColorOverrides } from "@mui/material/Chip";
import type { OverridableStringUnion } from "@mui/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
    user: {
      _id: string;
      userName: string;
    };
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
  overallStatus: "normal" | "abnormal" | "requires_attention";
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

  const fetchTestResults = useCallback(async () => {
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
    } catch (error: unknown) {
      console.error("Lỗi khi tải kết quả xét nghiệm:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra";
      setError(errorMessage);
      toast.error(errorMessage || "Có lỗi xảy ra khi tải kết quả xét nghiệm");
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  useEffect(() => {
    fetchTestResults();
  }, [fetchTestResults]);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (
    status: string
  ): OverridableStringUnion<
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning",
    ChipPropsColorOverrides
  > => {
    switch (status) {
      case "normal":
        return "success";
      case "abnormal":
        return "error";
      case "borderline":
        return "warning";
      case "requires_attention":
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
        return <ErrorIcon color="error" />;
      case "borderline":
        return <Warning color="warning" />;
      case "requires_attention":
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
      case "requires_attention":
        return "Cần theo dõi";
      default:
        return "Chưa xác định";
    }
  };

  const handleDownloadPDF = async (result: TestResult) => {
    // Tạo một div ẩn chứa nội dung cần xuất PDF
    const element = document.createElement("div");
    element.style.padding = "24px";
    element.innerHTML = `
    <h2>KẾT QUẢ XÉT NGHIỆM</h2>
    <p><b>Tên gói:</b> ${getTestPackageName(result)}</p>
    <p><b>Ngày xét nghiệm:</b> ${formatDate(result.testDate)}</p>
    <p><b>Bác sĩ thực hiện:</b> ${result.performedBy.user.userName}</p>
    <table border="1" cellpadding="8" style="width:100%;margin-top:16px">
      <thead>
        <tr>
          <th>Tên xét nghiệm</th>
          <th>Kết quả</th>
          <th>Đơn vị</th>
          <th>Giá trị bình thường</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        ${result.results
          .map(
            (r) =>
              `<tr>
                <td>${r.testName}</td>
                <td>${r.value}</td>
                <td>${r.unit}</td>
                <td>${r.normalRange}</td>
                <td>${getStatusText(r.status)}</td>
              </tr>`
          )
          .join("")}
      </tbody>
    </table>
    ${
      result.doctorNotes
        ? `<p><b>Nhận xét bác sĩ:</b> ${result.doctorNotes}</p>`
        : ""
    }
    ${
      result.recommendations
        ? `<p><b>Khuyến nghị:</b> ${result.recommendations}</p>`
        : ""
    }
  `;
    document.body.appendChild(element);

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ket-qua-xet-nghiem-${result._id}.pdf`);
    document.body.removeChild(element);
  };

  const handleViewDetails = (result: TestResult) => {
    setSelectedResult(result);
    setDetailDialogOpen(true);
  };

  // const handleDownloadResult = async (resultId: string) => {
  //   try {
  //     const token = localStorage.getItem("accessToken");
  //     const response = await fetch(
  //       `${BASE_URL}/api/test-results/${resultId}/download`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (!response.ok) throw new Error("Không thể tải file kết quả");
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `ket-qua-xet-nghiem-${resultId}.pdf`; // hoặc lấy tên file từ response header
  //     document.body.appendChild(a);
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     document.body.removeChild(a);
  //   } catch (error) {
  //     alert("Có lỗi khi tải file");
  //   }
  // };

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

  // const getTestPackageType = (result: TestResult) => {
  //   if (result.testPackage?.type) {
  //     return result.testPackage.type;
  //   }

  //   // Dựa trên tên xét nghiệm để phân loại
  //   const testNames = result.results
  //     .map((r) => r.testName.toLowerCase())
  //     .join(" ");
  //   if (
  //     testNames.includes("amh") ||
  //     testNames.includes("fsh") ||
  //     testNames.includes("lh")
  //   ) {
  //     return "Xét nghiệm hormone nữ";
  //   }
  //   return "Xét nghiệm tổng hợp";
  // };

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
        <Box sx={{ width: { xs: "100%", md: "33.3333%" }, p: 1 }}>
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
        </Box>
        <Box sx={{ width: { xs: "100%", md: "33.3333%" }, p: 1 }}>
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
        </Box>
        <Box sx={{ width: { xs: "100%", md: "33.3333%" }, p: 1 }}>
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
                        (r) => r.overallStatus === "requires_attention"
                      ).length
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cần theo dõi
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
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
            <Box sx={{ width: { xs: "100%" }, p: 1 }} key={result._id}>
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
                          {result.performedBy.user.userName || "Chưa cập nhật"}{" "}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        icon={getStatusIcon(result.overallStatus)}
                        label={getStatusText(result.overallStatus)}
                        color={getStatusColor(result.overallStatus)}
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
                    <Box sx={{ width: { xs: "100%", md: "50%" }, p: 1 }}>
                      <Box>
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
                    </Box>
                    <Box sx={{ width: { xs: "100%", md: "50%" }, p: 1 }}>
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
                          onClick={() => handleDownloadPDF(result)}
                        >
                          Tải xuống
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
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
                    <Box sx={{ width: "100%", p: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tên gói xét nghiệm
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {getTestPackageName(selectedResult)}
                      </Typography>
                    </Box>

                    <Box sx={{ width: "50%", p: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày xét nghiệm
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedResult.testDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ width: "100%", p: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Bác sĩ thực hiện
                      </Typography>
                      <Typography variant="body1">
                        {selectedResult.performedBy?.user.userName ||
                          "Chưa cập nhật"}{" "}
                      </Typography>
                    </Box>
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
                                  color={getStatusColor(result.status)}
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
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ResultTest;
