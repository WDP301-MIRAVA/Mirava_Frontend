import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Chip,
  Divider,
  Avatar,
  Container,
  Stack,
  CircularProgress,
  Snackbar,
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
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  LinearProgress,
  Pagination,
} from "@mui/material";
import {
  Science,
  Person,
  Assignment,
  Save,
  CheckCircle,
  Warning,
  Add,
  Delete,
  Edit,
  Print,
  ExpandMore,
  CalendarToday,
  Search,
  Refresh,
} from "@mui/icons-material";
import axios from "axios";

// API Base URL
const BASE_URL = "https://mirava-f0rz.onrender.com";

interface TestResultDetail {
  testName: string;
  testCode: string;
  value: string;
  unit: string;
  normalRange: string;
  status: "normal" | "abnormal" | "borderline";
  notes?: string;
}

interface TestRegistration {
  _id: string;
  patient: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
    patientCode: string;
  };
  testPackage: {
    _id: string;
    name: string;
    type: string;
    tests: Array<{
      _id: string;
      testName: string;
      testCode: string;
      normalRange: string;
      unit: string;
    }>;
  };
  status: string;
  requestedDate: string;
}

interface FormData {
  testRegistrationId: string;
  patientInfo: {
    id: string;
    name: string;
    phone: string;
    patientCode: string;
  } | null;
  testPackageInfo: {
    id: string;
    name: string;
    type: string;
    tests: Array<{
      _id: string;
      testName: string;
      testCode: string;
      normalRange: string;
      unit: string;
    }>;
  } | null;
  testDate: string;
  overallStatus: "normal" | "abnormal" | "pending";
  doctorNotes: string;
  recommendations: string;
  testResults: TestResultDetail[];
  isConsultationProvided: boolean;
  nextAppointment: string;
}

const TestResults: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    testRegistrationId: "",
    patientInfo: null,
    testPackageInfo: null,
    testDate: "",
    overallStatus: "pending",
    doctorNotes: "",
    recommendations: "",
    testResults: [],
    isConsultationProvided: false,
    nextAppointment: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("success");
  const [activeStep, setActiveStep] = useState(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // States for test registrations
  const [testRegistrations, setTestRegistrations] = useState<
    TestRegistration[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const steps = [
    "Chọn đăng ký xét nghiệm",
    "Nhập kết quả xét nghiệm",
    "Nhận xét và khuyến nghị",
    "Xác nhận",
  ];

  // Lấy danh sách đăng ký xét nghiệm của bác sĩ
  const fetchTestRegistrations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${BASE_URL}/api/test-results/doctor/test-registrations`,
        {
          params: {
            search: searchQuery,
            status: statusFilter || undefined,
            page: currentPage,
            limit: 10,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTestRegistrations(response.data.data);
        setTotalPages(response.data.totalPages);
      } else {
        setTestRegistrations([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đăng ký:", error);
      setTestRegistrations([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTestRegistrations();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  // Fetch when page changes
  useEffect(() => {
    fetchTestRegistrations();
  }, [currentPage]);

  // Initial load
  useEffect(() => {
    fetchTestRegistrations();
  }, []);

  // Chọn đăng ký xét nghiệm
  const handleSelectRegistration = (registration: TestRegistration) => {
    setFormData((prev) => ({
      ...prev,
      testRegistrationId: registration._id,
      patientInfo: {
        id: registration.patient._id,
        name: registration.patient.userName,
        phone: registration.patient.phone,
        patientCode: registration.patient.patientCode,
      },
      testPackageInfo: {
        id: registration.testPackage._id,
        name: registration.testPackage.name,
        type: registration.testPackage.type,
        tests: registration.testPackage.tests,
      },
      testDate: new Date().toISOString().split("T")[0],
      testResults: registration.testPackage.tests.map((test) => ({
        testName: test.testName,
        testCode: test.testCode,
        value: "",
        unit: test.unit,
        normalRange: test.normalRange,
        status: "normal" as const,
        notes: "",
      })),
    }));
    setErrorMessage("");
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleTestResultChange = (
    index: number,
    field: keyof TestResultDetail,
    value: any
  ) => {
    const updatedResults = [...formData.testResults];
    updatedResults[index] = {
      ...updatedResults[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      testResults: updatedResults,
    }));
  };

  const addTestResult = () => {
    const newResult: TestResultDetail = {
      testName: "",
      testCode: "",
      value: "",
      unit: "",
      normalRange: "",
      status: "normal",
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      testResults: [...prev.testResults, newResult],
    }));
  };

  const removeTestResult = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      testResults: prev.testResults.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.testRegistrationId) {
      setErrorMessage("Vui lòng chọn đăng ký xét nghiệm");
      return false;
    }

    if (!formData.testDate || !formData.doctorNotes.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }

    if (formData.testResults.length === 0) {
      setErrorMessage("Vui lòng thêm ít nhất một kết quả xét nghiệm");
      return false;
    }

    for (const result of formData.testResults) {
      if (!result.testName.trim() || !result.value.trim()) {
        setErrorMessage(
          "Vui lòng điền đầy đủ thông tin cho tất cả các xét nghiệm"
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");

      const submitData = {
        testRegistrationId: formData.testRegistrationId,
        testDate: new Date(formData.testDate).toISOString(),
        results: JSON.stringify(formData.testResults),
        overallStatus: formData.overallStatus,
        doctorNotes: formData.doctorNotes,
        recommendations: formData.recommendations,
      };

      console.log("Submitting data:", submitData);

      const response = await axios.post(
        `${BASE_URL}/api/test-results/create`,
        submitData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSubmittedResult(response.data.data);
        setSnackbarMessage("Kết quả xét nghiệm đã được tạo thành công!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setActiveStep(0);

        // Reset form
        setFormData({
          testRegistrationId: "",
          patientInfo: null,
          testPackageInfo: null,
          testDate: "",
          overallStatus: "pending",
          doctorNotes: "",
          recommendations: "",
          testResults: [],
          isConsultationProvided: false,
          nextAppointment: "",
        });

        // Refresh danh sách
        fetchTestRegistrations();
      } else {
        throw new Error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Lỗi tạo kết quả:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi tạo kết quả";
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.testRegistrationId) {
        setErrorMessage("Vui lòng chọn đăng ký xét nghiệm");
        return;
      }
    }

    if (activeStep === 1) {
      if (formData.testResults.length === 0) {
        setErrorMessage("Vui lòng thêm ít nhất một kết quả xét nghiệm");
        return;
      }
    }

    setErrorMessage("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "success";
      case "abnormal":
        return "error";
      case "borderline":
        return "warning";
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "normal":
        return "Bình thường";
      case "abnormal":
        return "Bất thường";
      case "borderline":
        return "Cận biên";
      case "pending":
        return "Chờ xử lý";
      case "confirmed":
        return "Đã xác nhận";
      case "completed":
        return "Hoàn thành";
      default:
        return "Chưa xác định";
    }
  };

  const calculateAbnormalCount = () => {
    return formData.testResults.filter((result) => result.status === "abnormal")
      .length;
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" mb={3}>
              Danh sách đăng ký xét nghiệm
            </Typography>

            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tìm kiếm theo tên, mã bệnh nhân hoặc số điện thoại"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm..."
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="pending">Chờ xử lý</MenuItem>
                    <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                    <MenuItem value="completed">Hoàn thành</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchTestRegistrations}
                  sx={{ height: 56 }}
                >
                  Làm mới
                </Button>
              </Grid>
            </Grid>

            {isLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : testRegistrations.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Science
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  Không có đăng ký xét nghiệm nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chưa có bệnh nhân nào đăng ký xét nghiệm với bạn
                </Typography>
              </Paper>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bệnh nhân</TableCell>
                        <TableCell>Mã BN</TableCell>
                        <TableCell>Gói xét nghiệm</TableCell>
                        <TableCell>Ngày đăng ký</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testRegistrations.map((registration) => (
                        <TableRow key={registration._id}>
                          <TableCell>{registration.patient.userName}</TableCell>
                          <TableCell>
                            {registration.patient.patientCode}
                          </TableCell>
                          <TableCell>{registration.testPackage.name}</TableCell>
                          <TableCell>
                            {formatDateForDisplay(registration.requestedDate)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(registration.status)}
                              color={getStatusColor(registration.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleSelectRegistration(registration)
                              }
                              disabled={registration.status === "completed"}
                            >
                              {registration.status === "completed"
                                ? "Đã có KQ"
                                : "Chọn"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, page) => setCurrentPage(page)}
                    color="primary"
                  />
                </Box>
              </>
            )}

            {formData.patientInfo && (
              <Paper sx={{ p: 2, mt: 2, bgcolor: "success.light" }}>
                <Typography variant="h6" color="success.dark">
                  Đã chọn:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Bệnh nhân:</strong> {formData.patientInfo.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Mã BN:</strong> {formData.patientInfo.patientCode}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>SĐT:</strong> {formData.patientInfo.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Gói XN:</strong> {formData.testPackageInfo?.name}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box mb={3}>
              <Typography variant="h6" mb={2}>
                Ngày thực hiện xét nghiệm
              </Typography>
              <TextField
                fullWidth
                label="Ngày xét nghiệm"
                type="date"
                value={formData.testDate}
                onChange={(e) => handleInputChange("testDate", e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <CalendarToday sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6">Chi tiết kết quả xét nghiệm</Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addTestResult}
                color="primary"
              >
                Thêm xét nghiệm
              </Button>
            </Box>

            {formData.testResults.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Science
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  Chưa có kết quả xét nghiệm
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Nhấn "Thêm xét nghiệm" để bắt đầu nhập kết quả
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên xét nghiệm</TableCell>
                      <TableCell>Mã XN</TableCell>
                      <TableCell>Giá trị</TableCell>
                      <TableCell>Đơn vị</TableCell>
                      <TableCell>Khoảng bình thường</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Ghi chú</TableCell>
                      <TableCell>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.testResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={result.testName}
                            onChange={(e) =>
                              handleTestResultChange(
                                index,
                                "testName",
                                e.target.value
                              )
                            }
                            placeholder="Tên xét nghiệm"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={result.testCode}
                            onChange={(e) =>
                              handleTestResultChange(
                                index,
                                "testCode",
                                e.target.value
                              )
                            }
                            placeholder="Mã XN"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={result.value}
                            onChange={(e) =>
                              handleTestResultChange(
                                index,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder="Giá trị"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={result.unit}
                            onChange={(e) =>
                              handleTestResultChange(
                                index,
                                "unit",
                                e.target.value
                              )
                            }
                            placeholder="Đơn vị"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={result.normalRange}
                            onChange={(e) =>
                              handleTestResultChange(
                                index,
                                "normalRange",
                                e.target.value
                              )
                            }
                            placeholder="Khoảng bình thường"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={result.status}
                              onChange={(e) =>
                                handleTestResultChange(
                                  index,
                                  "status",
                                  e.target.value
                                )
                              }
                            >
                              <MenuItem value="normal">Bình thường</MenuItem>
                              <MenuItem value="abnormal">Bất thường</MenuItem>
                              <MenuItem value="borderline">Cận biên</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={result.notes || ""}
                            onChange={(e) =>
                              handleTestResultChange(
                                index,
                                "notes",
                                e.target.value
                              )
                            }
                            placeholder="Ghi chú"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Xóa">
                            <IconButton
                              color="error"
                              onClick={() => removeTestResult(index)}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tình trạng tổng quát</InputLabel>
                <Select
                  value={formData.overallStatus}
                  onChange={(e) =>
                    handleInputChange("overallStatus", e.target.value)
                  }
                  label="Tình trạng tổng quát"
                >
                  <MenuItem value="normal">Bình thường</MenuItem>
                  <MenuItem value="abnormal">Bất thường</MenuItem>
                  <MenuItem value="pending">Cần theo dõi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isConsultationProvided}
                    onChange={(e) =>
                      handleInputChange(
                        "isConsultationProvided",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Đã tư vấn trực tiếp"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nhận xét của bác sĩ"
                multiline
                rows={4}
                value={formData.doctorNotes}
                onChange={(e) =>
                  handleInputChange("doctorNotes", e.target.value)
                }
                required
                placeholder="Nhập nhận xét, chẩn đoán và đánh giá kết quả..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Khuyến nghị điều trị"
                multiline
                rows={3}
                value={formData.recommendations}
                onChange={(e) =>
                  handleInputChange("recommendations", e.target.value)
                }
                placeholder="Nhập khuyến nghị điều trị, thuốc, chế độ sinh hoạt..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lịch hẹn tái khám (nếu có)"
                type="date"
                value={formData.nextAppointment}
                onChange={(e) =>
                  handleInputChange("nextAppointment", e.target.value)
                }
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <CalendarToday sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Xác nhận thông tin kết quả xét nghiệm
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">Thông tin bệnh nhân</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Mã bệnh nhân:
                    </Typography>
                    <Typography variant="body1">
                      {formData.patientInfo?.patientCode}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tên bệnh nhân:
                    </Typography>
                    <Typography variant="body1">
                      {formData.patientInfo?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Gói xét nghiệm:
                    </Typography>
                    <Typography variant="body1">
                      {formData.testPackageInfo?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Ngày xét nghiệm:
                    </Typography>
                    <Typography variant="body1">
                      {formatDateForDisplay(formData.testDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Kết quả chi tiết ({formData.testResults.length} xét nghiệm)
                </Typography>
                {calculateAbnormalCount() > 0 && (
                  <Chip
                    label={`${calculateAbnormalCount()} bất thường`}
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên xét nghiệm</TableCell>
                        <TableCell>Mã XN</TableCell>
                        <TableCell>Giá trị</TableCell>
                        <TableCell>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.testResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>{result.testName}</TableCell>
                          <TableCell>{result.testCode}</TableCell>
                          <TableCell>
                            {result.value} {result.unit}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(result.status)}
                              color={getStatusColor(result.status) as any}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Nhận xét và khuyến nghị
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Tình trạng tổng quát:
                  </Typography>
                  <Chip
                    label={getStatusLabel(formData.overallStatus)}
                    color={getStatusColor(formData.overallStatus) as any}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Nhận xét của bác sĩ:
                  </Typography>
                  <Typography variant="body1">
                    {formData.doctorNotes}
                  </Typography>
                </Box>
                {formData.recommendations && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Khuyến nghị điều trị:
                    </Typography>
                    <Typography variant="body1">
                      {formData.recommendations}
                    </Typography>
                  </Box>
                )}
                {formData.nextAppointment && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Lịch hẹn tái khám:
                    </Typography>
                    <Typography variant="body1">
                      {formatDateForDisplay(formData.nextAppointment)}
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #00B4C6 0%, #0284c7 100%)",
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: "white", color: "primary.main", mr: 2 }}>
            <Science />
          </Avatar>
          <Box>
            <Typography variant="h4" color="white" fontWeight="bold">
              Tạo Kết Quả Xét Nghiệm
            </Typography>
            <Typography variant="subtitle1" color="white" opacity={0.9}>
              Hệ thống quản lý điều trị hiếm muộn MIRAVA
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={(activeStep / (steps.length - 1)) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.3)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "white",
                borderRadius: 3,
              },
            }}
          />
        </Box>
      </Paper>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="h6">{label}</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ py: 2 }}>{renderStepContent(index)}</Box>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={
                      index === steps.length - 1 ? handleSubmit : handleNext
                    }
                    disabled={isSubmitting}
                    sx={{ mr: 1 }}
                    startIcon={
                      index === steps.length - 1 ? (
                        isSubmitting ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Save />
                        )
                      ) : null
                    }
                  >
                    {index === steps.length - 1
                      ? isSubmitting
                        ? "Đang tạo..."
                        : "Tạo kết quả"
                      : "Tiếp theo"}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Quay lại
                  </Button>
                  {index === steps.length - 1 && (
                    <Button
                      variant="outlined"
                      onClick={() => setPreviewDialogOpen(true)}
                      startIcon={<Print />}
                    >
                      Xem trước
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {submittedResult && (
        <Paper sx={{ p: 3, mt: 3, border: 2, borderColor: "success.main" }}>
          <Box display="flex" alignItems="center" mb={2}>
            <CheckCircle sx={{ color: "success.main", mr: 2, fontSize: 32 }} />
            <Typography variant="h5" color="success.main">
              Kết quả xét nghiệm đã được tạo thành công!
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Bệnh nhân:
              </Typography>
              <Typography variant="h6">
                {submittedResult.patient?.userName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Gói xét nghiệm:
              </Typography>
              <Typography variant="h6">
                {submittedResult.testPackage?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Số lượng xét nghiệm:
              </Typography>
              <Typography variant="h6">
                {submittedResult.results?.length || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Tình trạng:
              </Typography>
              <Chip
                label={getStatusLabel(submittedResult.overallStatus)}
                color={getStatusColor(submittedResult.overallStatus) as any}
                size="medium"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSubmittedResult(null);
                setActiveStep(0);
              }}
              sx={{ mr: 2 }}
            >
              Tạo kết quả mới
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={() => setPreviewDialogOpen(true)}
            >
              In kết quả
            </Button>
          </Box>
        </Paper>
      )}

      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Print sx={{ mr: 1 }} />
            Xem trước kết quả xét nghiệm
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Chức năng xem trước sẽ hiển thị định dạng in của kết quả xét nghiệm
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Đóng</Button>
          <Button variant="contained" startIcon={<Print />}>
            In ngay
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TestResults;
