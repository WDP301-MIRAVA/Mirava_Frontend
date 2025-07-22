import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Pagination,
  CircularProgress,
  Paper,
  InputAdornment,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Phone,
  Edit,
  Delete,
  Search,
  Schedule,
  Person,
  Note,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

// Interface cập nhật theo API response
interface ConsultationRequest {
  _id: string;
  phone: string;
  status: "pending" | "completed" | "cancelled";
  note: string;
  handledBy: {
    _id: string;
    userName: string;
  } | null;
  handledAt: string | null;
  consultationType: "phone" | "online" | "in-person";
  createdAt: string;
  updatedAt: string;
}

interface ConsultationResponse {
  success: boolean;
  count: number;
  total: number;
  currentPage: number;
  totalPages: number;
  data: ConsultationRequest[];
}

interface ConsultationFilters {
  status: string;
  consultationType: string;
}

const AdviseManagement: React.FC = () => {
  // States cho quản lý dữ liệu
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<
    ConsultationRequest[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [noteValue, setNoteValue] = useState("");
  const [selectedConsultationId, setSelectedConsultationId] = useState<
    string | null
  >(null);

  // States cho filters
  const [filters, setFilters] = useState<ConsultationFilters>({
    status: "all",
    consultationType: "all",
  });

  // States cho notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // ✅ Hàm lấy access token từ localStorage
  const getAccessToken = (): string | null => {
    return localStorage.getItem("accessToken");
  };

  // ✅ Hàm tạo headers với authorization
  const getAuthHeaders = (): HeadersInit => {
    const token = getAccessToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  // ✅ Hàm xử lý lỗi authentication
  const handleAuthError = (error: Error): void => {
    console.error("Lỗi authentication:", error);

    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      showSnackbar(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        "error"
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  };

  // Fetch dữ liệu consultations từ API với authentication
  const fetchConsultations = async (page: number = 1): Promise<void> => {
    try {
      setLoading(true);

      const token = getAccessToken();
      if (!token) {
        showSnackbar("Vui lòng đăng nhập để tiếp tục", "error");
        window.location.href = "/login";
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (filters.status !== "all") {
        queryParams.append("status", filters.status);
      }

      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/consultation?${queryParams.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("401 - Unauthorized");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ConsultationResponse = await response.json();

      if (data.success) {
        setConsultations(data.data);
        setFilteredConsultations(data.data);
        setTotalPages(data.totalPages);
        setTotalCount(data.total);
        setCurrentPage(data.currentPage);
      } else {
        throw new Error("API trả về success: false");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tư vấn:", error);

      if (error instanceof Error) {
        handleAuthError(error);
      } else {
        showSnackbar("Lỗi khi tải danh sách tư vấn", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect để load dữ liệu ban đầu
  useEffect(() => {
    fetchConsultations(currentPage);
  }, [currentPage, filters]);

  // Debounce search để tránh gọi API quá nhiều
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchConsultations(1);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Utility functions
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFilterChange = (
    filterType: keyof ConsultationFilters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  // Hàm hủy yêu cầu tư vấn
  const handleCancelConsultation = async (
    consultationId: string,
    reason?: string
  ) => {
    try {
      const token = getAccessToken();
      if (!token) {
        showSnackbar("Vui lòng đăng nhập để tiếp tục", "error");
        return;
      }

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/consultation/${consultationId}/cancel`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("401 - Unauthorized");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showSnackbar("Hủy yêu cầu tư vấn thành công", "success");
      await fetchConsultations(currentPage);
    } catch (error) {
      console.error("Lỗi khi hủy yêu cầu tư vấn:", error);

      if (error instanceof Error) {
        handleAuthError(error);
      } else {
        showSnackbar("Lỗi khi hủy yêu cầu tư vấn", "error");
      }
    }
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa yêu cầu tư vấn này?")) {
      try {
        const token = getAccessToken();
        if (!token) {
          showSnackbar("Vui lòng đăng nhập để tiếp tục", "error");
          return;
        }

        const response = await fetch(
          `https://mirava-f0rz.onrender.com/api/consultation/${consultationId}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("401 - Unauthorized");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        showSnackbar("Xóa yêu cầu tư vấn thành công", "success");
        await fetchConsultations(currentPage);
      } catch (error) {
        console.error("Lỗi khi xóa yêu cầu tư vấn:", error);

        if (error instanceof Error) {
          handleAuthError(error);
        } else {
          showSnackbar("Lỗi khi xóa yêu cầu tư vấn", "error");
        }
      }
    }
  };

  // ✅ Hàm cập nhật trạng thái hoàn thành tư vấn
  const handleCompleteConsultation = async (
    consultationId: string,
    note: string
  ) => {
    try {
      const token = getAccessToken();
      if (!token) {
        showSnackbar("Vui lòng đăng nhập để tiếp tục", "error");
        return;
      }

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/consultation/${consultationId}/complete`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ note }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("401 - Unauthorized");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showSnackbar("Đánh dấu tư vấn hoàn thành thành công", "success");
      await fetchConsultations(currentPage);
    } catch (error) {
      console.error("Lỗi khi hoàn thành tư vấn:", error);

      if (error instanceof Error) {
        handleAuthError(error);
      } else {
        showSnackbar("Lỗi khi hoàn thành tư vấn", "error");
      }
    }
  };

  // ✅ Hàm cập nhật trạng thái đơn giản (chỉ 3 trạng thái)
  const handleUpdateStatus = async (
    consultationId: string,
    newStatus: string
  ) => {
    try {
      const token = getAccessToken();
      if (!token) {
        showSnackbar("Vui lòng đăng nhập để tiếp tục", "error");
        return;
      }

      // Nếu là trạng thái completed, sử dụng API complete
      if (newStatus === "completed") {
        setSelectedConsultationId(consultationId);
        setCompleteDialogOpen(true);

        return;
      }

      // Cho các trạng thái khác (pending, cancelled)
      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/consultation/${consultationId}/complete`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status: newStatus,
            handledAt:
              newStatus === "cancelled" ? new Date().toISOString() : null,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("401 - Unauthorized");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showSnackbar("Cập nhật trạng thái thành công", "success");
      await fetchConsultations(currentPage);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);

      if (error instanceof Error) {
        handleAuthError(error);
      } else {
        showSnackbar("Lỗi khi cập nhật trạng thái", "error");
      }
    }
  };

  // Render functions
  const renderStatusChip = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Chờ xử lý",
        color: "warning" as const,
        icon: <Schedule fontSize="small" />,
      },
      completed: {
        label: "Hoàn thành",
        color: "success" as const,
        icon: <CheckCircle fontSize="small" />,
      },
      cancelled: {
        label: "Đã hủy",
        color: "error" as const,
        icon: <Cancel fontSize="small" />,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
        variant="outlined"
      />
    );
  };

  const renderConsultationTypeChip = (type: string) => {
    const typeConfig = {
      phone: {
        label: "Điện thoại",
        color: "success" as const,
        icon: <Phone fontSize="small" />,
      },
      online: {
        label: "Trực tuyến",
        color: "info" as const,
        icon: <Phone fontSize="small" />,
      },
      "in-person": {
        label: "Trực tiếp",
        color: "primary" as const,
        icon: <Person fontSize="small" />,
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
        variant="outlined"
      />
    );
  };

  const getPendingCount = () => {
    return consultations.filter((c) => c.status === "pending").length;
  };

  const getCompletedCount = () => {
    return consultations.filter((c) => c.status === "completed").length;
  };

  const getCancelledCount = () => {
    return consultations.filter((c) => c.status === "cancelled").length;
  };
  const handleCompleteWithNote = async () => {
    if (!selectedConsultationId) return;
    await handleCompleteConsultation(selectedConsultationId, noteValue);
    setNoteValue("");
    setSelectedConsultationId(null);
    setCompleteDialogOpen(false);
  };

  // ✅ Kiểm tra authentication khi component mount
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      showSnackbar("Vui lòng đăng nhập để truy cập trang này", "error");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Quản lý Tư vấn Khách hàng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hệ thống quản lý các yêu cầu tư vấn điều trị hiếm muộn
          </Typography>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Phone color="primary" />
              <Box>
                <Typography variant="h6">{totalCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng số điện thoại
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Badge badgeContent={getPendingCount()} color="warning">
                <Schedule color="warning" />
              </Badge>
              <Box>
                <Typography variant="h6">{getPendingCount()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Chờ xử lý
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CheckCircle color="success" />
              <Box>
                <Typography variant="h6">{getCompletedCount()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Hoàn thành
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Cancel color="error" />
              <Box>
                <Typography variant="h6">{getCancelledCount()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Đã hủy
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Tìm kiếm theo số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filters.status}
              label="Trạng thái"
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="pending">Chờ xử lý</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Loại tư vấn</InputLabel>
            <Select
              value={filters.consultationType}
              label="Loại tư vấn"
              onChange={(e) =>
                handleFilterChange("consultationType", e.target.value)
              }
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="phone">Điện thoại</MenuItem>
              <MenuItem value="online">Trực tuyến</MenuItem>
              <MenuItem value="in-person">Trực tiếp</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Consultations List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredConsultations.map((consultation) => (
          <Card key={consultation._id} sx={{ "&:hover": { boxShadow: 3 } }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#1976d2" }}>
                      <Phone />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {consultation.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {consultation.handledBy
                          ? `Xử lý bởi: ${consultation.handledBy.userName}`
                          : "Chưa xử lý"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                  >
                    {renderStatusChip(consultation.status)}
                    {renderConsultationTypeChip(consultation.consultationType)}
                  </Box>

                  {consultation.note && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Note fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {consultation.note}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      fontSize: "0.875rem",
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="caption">
                      Tạo:{" "}
                      {new Date(consultation.createdAt).toLocaleString("vi-VN")}
                    </Typography>
                    {consultation.handledAt && (
                      <Typography variant="caption">
                        Xử lý:{" "}
                        {new Date(consultation.handledAt).toLocaleString(
                          "vi-VN"
                        )}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    ml: 2,
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Cập nhật trạng thái</InputLabel>
                    <Select
                      value={consultation.status}
                      label="Cập nhật trạng thái"
                      onChange={(e) =>
                        handleUpdateStatus(consultation._id, e.target.value)
                      }
                    >
                      <MenuItem value="pending">Chờ xử lý</MenuItem>
                      <MenuItem value="completed">Hoàn thành</MenuItem>
                      <MenuItem value="cancelled">Đã hủy</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleDeleteConsultation(consultation._id)
                        }
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Empty State */}
      {filteredConsultations.length === 0 && !loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
            gap: 2,
          }}
        >
          <Phone sx={{ fontSize: 64, color: "text.secondary" }} />
          <Typography variant="h6" color="text.secondary">
            Không có yêu cầu tư vấn nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thêm số điện thoại mới để bắt đầu quản lý tư vấn
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
      >
        <DialogTitle>Nhập ghi chú hoàn thành tư vấn</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            autoFocus
            margin="dense"
            label="Ghi chú"
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCompleteWithNote}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdviseManagement;
