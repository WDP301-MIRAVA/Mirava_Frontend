import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
  InputAdornment,
  Avatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Search,
  Add,
  // Edit,
  Visibility,
  Assignment,
  Person,
  Timeline,
  CheckCircle,
  Schedule,
  ExpandMore,
  Phone,
  Email,
  Refresh,
  Close,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import "./ManagerTreatment.css";
import type {
  Patient,
  TreatmentEvent,
  TreatmentPlan,
  Statistics,
  TabPanelProps,
} from "@/types/managerTreatment";
import axiosInstance from "@/services/MainService";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  "& .MuiCardContent-root": {
    padding: theme.spacing(3),
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => ({
  fontWeight: 600,
  ...(status === "active" && {
    backgroundColor: "#dcfce7",
    color: "#166534",
  }),
  ...(status === "completed" && {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  }),
  ...(status === "paused" && {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  }),
  ...(status === "cancelled" && {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  }),
}));

// ✅ FIXED: Custom TabPanel component với proper typing
const CustomTabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ManagerTreatment: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTreatmentType, setFilterTreatmentType] = useState<string>("all");
  const [tabValue, setTabValue] = useState<number>(0);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // ✅ FIXED: Statistics with proper typing
  const [stats, setStats] = useState<Statistics>({
    totalPlans: 0,
    activePlans: 0,
    completedPlans: 0,
    pausedPlans: 0,
    totalPatients: 0,
  });
  const filterTreatmentPlans = useCallback((): void => {
    let filtered = treatmentPlans;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.patient.userName.toLowerCase().includes(searchLower) ||
          plan.patient.patientCode.toLowerCase().includes(searchLower) ||
          plan.patient.phone.includes(searchTerm) ||
          plan.patient.email.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((plan) => plan.status === filterStatus);
    }

    // Treatment type filter
    if (filterTreatmentType !== "all") {
      filtered = filtered.filter(
        (plan) => plan.treatmentType === filterTreatmentType
      );
    }

    setFilteredPlans(filtered);
  }, [treatmentPlans, searchTerm, filterStatus, filterTreatmentType]);

  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([fetchTreatmentPlans(), fetchPatients()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    filterTreatmentPlans();
  }, [filterTreatmentPlans]);

  const fetchTreatmentPlans = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await axiosInstance.get(
        "https://mirava-f0rz.onrender.com/api/treatment-plan",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Không thể tải danh sách kế hoạch điều trị");
      }

      const data = response.data;
      const plans: TreatmentPlan[] = data.data || [];
      setTreatmentPlans(plans);

      // Chỉ lấy những plan có patient hợp lệ để tính thống kê
      const validPlans = plans.filter((p) => p.patient && p.patient._id);

      setStats({
        totalPlans: plans.length,
        activePlans: plans.filter((p) => p.status === "active").length,
        completedPlans: plans.filter((p) => p.status === "completed").length,
        pausedPlans: plans.filter((p) => p.status === "paused").length,
        totalPatients: new Set(validPlans.map((p) => p.patient._id)).size,
      });
    } catch (error) {
      console.error("Error fetching treatment plans:", error);
      setError("Không thể tải danh sách kế hoạch điều trị");
    }
  };

  const fetchPatients = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/treatment-plan",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải danh sách bệnh nhân");
      }

      const data = await response.json();
      const plans: TreatmentPlan[] = data.data || [];

      // Lọc danh sách bệnh nhân duy nhất, chỉ lấy plan có patient hợp lệ
      const patientMap: Record<string, Patient> = {};
      plans.forEach((plan) => {
        if (plan.patient && plan.patient._id) {
          patientMap[plan.patient._id] = plan.patient;
        }
      });
      setPatients(Object.values(patientMap));
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Không thể tải danh sách bệnh nhân");
    }
  };

  const calculateProgress = (events: TreatmentEvent[]): number => {
    if (!events.length) return 0;
    const completedEvents = events.filter(
      (event) => event.status === "completed"
    ).length;
    return (completedEvents / events.length) * 100;
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "completed":
        return "Đã hoàn thành";
      case "in-progress":
        return "Đang thực hiện";
      case "planned":
        return "Đã lập kế hoạch";
      default:
        return "Không xác định";
    }
  };

  const getEventStatusText = (status: string): string => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in_progress":
        return "Đang thực hiện";
      case "planned":
        return "Đã lên lịch";
      default:
        return "Chưa thực hiện";
    }
  };

  const getEventStatusColor = (
    status: string
  ): "success" | "warning" | "default" => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      default:
        return "default";
    }
  };

  const handleViewDetails = (plan: TreatmentPlan): void => {
    setSelectedPlan(plan);
    setShowDetailModal(true);
  };

  const handleCreateTreatmentPlan = (patient: Patient): void => {
    setSelectedPatient(patient);
    console.log("Patient selected:", selectedPatient);
    console.log("Create treatment plan for patient:", patient.userName);
  };
  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ): void => {
    setTabValue(newValue);
  };

  const handleCloseDetailModal = (): void => {
    setShowDetailModal(false);
    setSelectedPlan(null);
  };

  return (
    <Box className="manager-treatment-management">
      {/* Header */}
      <StyledCard sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Quản lý Điều trị
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Theo dõi và quản lý các kế hoạch điều trị của bệnh nhân
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={fetchData}
                sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
              >
                Làm mới
              </Button>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>

      {/* ✅ FIXED: Statistics Cards - Chuyển từ Grid sang Box */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 8px)",
              md: "1 1 calc(20% - 8px)",
            },
          }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "#3b82f6" }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.totalPlans}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng kế hoạch
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 8px)",
              md: "1 1 calc(20% - 8px)",
            },
          }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "#10b981" }}>
                  <Timeline />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.activePlans}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang điều trị
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 8px)",
              md: "1 1 calc(20% - 8px)",
            },
          }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "#059669" }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.completedPlans}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hoàn thành
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 8px)",
              md: "1 1 calc(20% - 8px)",
            },
          }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "#f59e0b" }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.pausedPlans}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tạm dừng
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 8px)",
              md: "1 1 calc(20% - 8px)",
            },
          }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "#8b5cf6" }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.totalPatients}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bệnh nhân
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Kế hoạch điều trị" />
          <Tab label="Danh sách bệnh nhân" />
        </Tabs>

        <CustomTabPanel value={tabValue} index={0}>
          {/* Treatment Plans Tab */}
          <Box sx={{ mb: 3 }}>
            {/* ✅ FIXED: Filter controls - Chuyển từ Grid sang Box */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 300px" } }}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm theo tên, mã BN, SĐT, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 200px" } }}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="active">Đang điều trị</MenuItem>
                    <MenuItem value="completed">Hoàn thành</MenuItem>
                    <MenuItem value="paused">Tạm dừng</MenuItem>
                    <MenuItem value="cancelled">Đã hủy</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 200px" } }}>
                <FormControl fullWidth>
                  <InputLabel>Loại điều trị</InputLabel>
                  <Select
                    value={filterTreatmentType}
                    onChange={(e) => setFilterTreatmentType(e.target.value)}
                    label="Loại điều trị"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="IVF">IVF</MenuItem>
                    <MenuItem value="IUI">IUI</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          {loading && <LinearProgress sx={{ mb: 2 }} />}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bệnh nhân</TableCell>
                  <TableCell>Mã BN</TableCell>
                  <TableCell>Bác sĩ</TableCell>
                  <TableCell>Loại điều trị</TableCell>
                  <TableCell>Ngày bắt đầu</TableCell>
                  <TableCell>Tiến độ</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {plan.patient ? (
                            plan.patient.userName
                          ) : (
                            <span style={{ color: "#aaa" }}>Chưa có</span>
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {plan.patient ? plan.patient.email : ""}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {plan.patient ? plan.patient.patientCode : ""}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {plan.doctor.user.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {plan.doctor.specialty}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.treatmentType}
                        variant="outlined"
                        size="small"
                        color={
                          plan.treatmentType === "IVF" ? "primary" : "secondary"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(plan.cycleStartDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box sx={{ width: "100%" }}>
                          <LinearProgress
                            variant="determinate"
                            value={calculateProgress(plan.treatmentEvents)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: 40 }}>
                          {Math.round(calculateProgress(plan.treatmentEvents))}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={getStatusText(plan.status)}
                        status={plan.status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(plan)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredPlans.length === 0 && !loading && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={8}
            >
              <Assignment sx={{ fontSize: 48, color: "#64748b", mb: 2 }} />
              <Typography variant="h6" color="#374151" gutterBottom>
                Không tìm thấy kế hoạch điều trị nào
              </Typography>
              <Typography variant="body2" color="#64748b">
                Thử thay đổi tiêu chí tìm kiếm hoặc tạo kế hoạch mới
              </Typography>
            </Box>
          )}
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={1}>
          {/* ✅ FIXED: Patients Tab - Chuyển từ Grid sang Box */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {patients.map((patient) => (
              <Box
                key={patient._id}
                sx={{
                  flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" },
                }}
              >
                <Card>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                    >
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {patient.userName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Mã BN: {patient.patientCode}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Phone sx={{ fontSize: 16 }} />
                          <Typography variant="body2">
                            {patient.phone}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Email sx={{ fontSize: 16 }} />
                          <Typography variant="body2">
                            {patient.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleCreateTreatmentPlan(patient)}
                        startIcon={<Add />}
                      >
                        Tạo kế hoạch
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </CustomTabPanel>
      </Paper>

      {/* ✅ FIXED: Treatment Plan Detail Modal */}
      <Dialog
        open={showDetailModal}
        onClose={handleCloseDetailModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Chi tiết kế hoạch điều trị</Typography>
            <IconButton onClick={handleCloseDetailModal}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              {/* ✅ FIXED: Patient and Treatment Info - Chuyển từ Grid sang Box */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  mb: 3,
                }}
              >
                <Box
                  sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}
                >
                  <Typography variant="h6" gutterBottom>
                    Thông tin bệnh nhân
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Tên bệnh nhân
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedPlan.patient.userName}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Mã bệnh nhân
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedPlan.patient.patientCode}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Số điện thoại
                    </Typography>
                    <Typography variant="body1">
                      {selectedPlan.patient.phone}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedPlan.patient.email}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}
                >
                  <Typography variant="h6" gutterBottom>
                    Thông tin điều trị
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Bác sĩ phụ trách
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedPlan.doctor.user.userName}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Chuyên khoa
                    </Typography>
                    <Typography variant="body1">
                      {selectedPlan.doctor.specialty}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Loại điều trị
                    </Typography>
                    <Chip
                      label={selectedPlan.treatmentType}
                      color={
                        selectedPlan.treatmentType === "IVF"
                          ? "primary"
                          : "secondary"
                      }
                    />
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Ngày bắt đầu
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedPlan.cycleStartDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <StatusChip
                      label={getStatusText(selectedPlan.status)}
                      status={selectedPlan.status}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Tiến trình điều trị
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tiến độ tổng thể
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(selectedPlan.treatmentEvents)}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {Math.round(
                      calculateProgress(selectedPlan.treatmentEvents)
                    )}
                    %
                  </Typography>
                </Box>
              </Box>

              <Box>
                {selectedPlan.treatmentEvents.map((event, index) => (
                  <Accordion key={event._id}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={2}
                        width="100%"
                      >
                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                          Bước {index + 1}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          flexGrow={1}
                        >
                          {event.title}
                        </Typography>
                        <Chip
                          label={getEventStatusText(event.status)}
                          size="small"
                          color={getEventStatusColor(event.status)}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {event.description}
                      </Typography>
                      {/* ✅ FIXED: Event details - Chuyển từ Grid sang Box */}
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ flex: "1 1 calc(50% - 8px)" }}>
                          <Typography variant="body2" color="text.secondary">
                            Giai đoạn
                          </Typography>
                          <Typography variant="body2">{event.stage}</Typography>
                        </Box>
                        <Box sx={{ flex: "1 1 calc(50% - 8px)" }}>
                          <Typography variant="body2" color="text.secondary">
                            Loại
                          </Typography>
                          <Typography variant="body2">{event.type}</Typography>
                        </Box>
                        {event.executionDate && (
                          <Box sx={{ flex: "1 1 calc(50% - 8px)" }}>
                            <Typography variant="body2" color="text.secondary">
                              Ngày thực hiện
                            </Typography>
                            <Typography variant="body2">
                              {new Date(event.executionDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Typography>
                          </Box>
                        )}
                        {event.performedBy && (
                          <Box sx={{ flex: "1 1 calc(50% - 8px)" }}>
                            <Typography variant="body2" color="text.secondary">
                              Người thực hiện
                            </Typography>
                            <Typography variant="body2">
                              {event.performedBy}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerTreatment;
