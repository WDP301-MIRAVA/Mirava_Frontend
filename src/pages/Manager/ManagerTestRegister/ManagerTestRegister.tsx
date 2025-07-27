import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Visibility, Edit, CheckCircle, ExpandMore } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { toast } from "react-hot-toast";
import "./ManagerTestRegister.css";

const GradientButton = styled(Button)(() => ({
  background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
  border: 0,
  borderRadius: 25,
  color: "white",
  height: 40,
  padding: "0 24px",
  boxShadow: "0 3px 5px 2px rgba(102, 126, 234, .3)",
  "&:hover": {
    background: "linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)",
  },
}));

const StatusChip = styled(Chip)(({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { backgroundColor: "#fff3cd", color: "#856404" };
      case "scheduled":
        return { backgroundColor: "#d4edda", color: "#155724" };
      case "in_progress":
        return { backgroundColor: "#cce5ff", color: "#004085" };
      case "completed":
        return { backgroundColor: "#d1ecf1", color: "#0c5460" };
      case "cancelled":
        return { backgroundColor: "#f8d7da", color: "#721c24" };
      default:
        return { backgroundColor: "#e2e3e5", color: "#383d41" };
    }
  };

  return {
    ...getStatusColor(status),
    fontWeight: 600,
    borderRadius: 20,
  };
});

type TestItem =
  | string
  | {
      testName: string;
      testCode?: string;
      normalRange?: string;
      unit?: string;
      _id?: string;
    };

interface TestRegistration {
  _id: string;
  patient: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
    patientCode: string;
    address?: string;
    gender?: string;
  };
  testPackage: {
    _id: string;
    name: string;
    type: string;
    price: number;
    duration: string;
    imageUrl?: string;
    treatmentSubjects: string[];
    treatmentProcess: string[];
    preparation?: string;
    tests: TestItem[];
  } | null;
  assignedDoctor?: {
    _id: string;
    user: {
      userName: string;
    };
    degree: string;
    specialty: string;
  };
  requestedDate: string;
  actualDate?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ManagerTestRegister: React.FC = () => {
  const [registrations, setRegistrations] = useState<TestRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] =
    useState<TestRegistration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Dùng 1 state duy nhất cho filter
  const [filters, setFilters] = useState({
    searchTerm: "",
    statusFilter: "",
    startDate: "",
    endDate: "",
  });

  // State thực tế dùng để fetch
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit form
  const [editForm, setEditForm] = useState({
    status: "",
    notes: "",
    assignedDoctor: "",
  });

  // Stats for all status
  const [stats, setStats] = useState({
    pending: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  });

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "scheduled", label: "Đã lên lịch" },
    { value: "in_progress", label: "Đang thực hiện" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "Chờ xử lý",
      scheduled: "Đã lên lịch",
      in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(statusFilter && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/test-registrations?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải danh sách đăng ký");
      }

      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data);
        setTotalPages(data.pages);
        setTotalCount(data.total);
      } else {
        throw new Error(data.message || "Lỗi khi tải dữ liệu");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError("Lỗi không xác định");
        toast.error("Lỗi không xác định");
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, startDate, endDate, searchTerm]);

  // Fetch all stats for all status
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/test-registrations?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const allData = data.data;
          setStats({
            pending: allData.filter(
              (r: TestRegistration) => r.status === "pending"
            ).length,
            scheduled: allData.filter(
              (r: TestRegistration) => r.status === "scheduled"
            ).length,
            in_progress: allData.filter(
              (r: TestRegistration) => r.status === "in_progress"
            ).length,
            completed: allData.filter(
              (r: TestRegistration) => r.status === "completed"
            ).length,
            cancelled: allData.filter(
              (r: TestRegistration) => r.status === "cancelled"
            ).length,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchStats();
  }, [fetchRegistrations]);

  const handleViewDetails = (registration: TestRegistration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  const handleEditRegistration = (registration: TestRegistration) => {
    setSelectedRegistration(registration);
    setEditForm({
      status: registration.status,
      notes: registration.notes || "",
      assignedDoctor: registration.assignedDoctor?._id || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateRegistration = async () => {
    if (!selectedRegistration) return;

    try {
      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/test-registrations/${selectedRegistration._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            status: editForm.status,
            notes: editForm.notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật đăng ký");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Cập nhật đăng ký thành công");
        setShowEditModal(false);
        fetchRegistrations();
        fetchStats();
      } else {
        throw new Error(data.message || "Lỗi khi cập nhật");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Lỗi không xác định");
      }
    }
  };

  const handleApproveSchedule = async (registrationId: string) => {
    try {
      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/test-registrations/${registrationId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            scheduledDate: new Date().toISOString().split("T")[0],
            notes: "Đã duyệt lịch xét nghiệm",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể duyệt lịch xét nghiệm");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Duyệt lịch xét nghiệm thành công");
        await fetchRegistrations();
        await fetchStats();
      } else {
        throw new Error(data.message || "Lỗi khi duyệt lịch");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Có lỗi xảy ra khi duyệt lịch");
      } else {
        toast.error("Có lỗi xảy ra khi duyệt lịch");
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const filteredRegistrations = registrations.filter((registration) => {
    return registration && registration.patient;
  });

  // Hàm xử lý khi nhấn nút "Tìm kiếm" hoặc Enter
  const handleSearch = () => {
    setSearchTerm(filters.searchTerm);
    setStatusFilter(filters.statusFilter);
    setStartDate(filters.startDate);
    setEndDate(filters.endDate);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="mtr-container">
        <div className="mtr-loading">
          <div className="mtr-loading-spinner"></div>
          <p>Đang tải danh sách đăng ký...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mtr-container">
      <h1 className="mtr-title">Quản lý đăng ký xét nghiệm</h1>

      {error && <div className="mtr-alert">{error}</div>}

      {/* Filters */}
      <div className="mtr-filters">
        <div className="mtr-filter-row">
          <div className="mtr-filter-item search">
            <input
              className="mtr-filter-input"
              placeholder="Tìm kiếm theo tên, email, SĐT, mã BN..."
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters({ ...filters, searchTerm: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <div className="mtr-filter-item">
            <select
              className="mtr-filter-select"
              value={filters.statusFilter}
              onChange={(e) =>
                setFilters({ ...filters, statusFilter: e.target.value })
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mtr-filter-item">
            <input
              className="mtr-filter-input"
              type="date"
              placeholder="Từ ngày"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <div className="mtr-filter-item">
            <input
              className="mtr-filter-input"
              type="date"
              placeholder="Đến ngày"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <div className="mtr-filter-item actions">
            <button className="mtr-search-btn" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mtr-stats">
        <div className="mtr-stat-card">
          <h3 className="mtr-stat-title primary">Tổng đăng ký</h3>
          <p className="mtr-stat-value">{totalCount}</p>
        </div>
        <div className="mtr-stat-card">
          <h3 className="mtr-stat-title warning">Chờ xử lý</h3>
          <p className="mtr-stat-value">{stats.pending}</p>
        </div>
        <div className="mtr-stat-card">
          <h3 className="mtr-stat-title info">Đang thực hiện</h3>
          <p className="mtr-stat-value">{stats.in_progress}</p>
        </div>
        <div className="mtr-stat-card">
          <h3 className="mtr-stat-title success">Hoàn thành</h3>
          <p className="mtr-stat-value">{stats.completed}</p>
        </div>
        <div className="mtr-stat-card">
          <h3 className="mtr-stat-title secondary">Đã lên lịch</h3>
          <p className="mtr-stat-value">{stats.scheduled}</p>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="mtr-table-container">
        {filteredRegistrations.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#6b7280",
            }}
          >
            <p>Không có đăng ký xét nghiệm nào được tìm thấy</p>
          </div>
        ) : (
          <div className="mtr-table-wrapper">
            <table className="mtr-table">
              <thead>
                <tr>
                  <th>Mã BN</th>
                  <th>Bệnh nhân</th>
                  <th>Gói xét nghiệm</th>
                  <th>Ngày mong muốn</th>
                  <th>Trạng thái</th>
                  <th>Bác sĩ</th>
                  <th>Giá</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((registration) => (
                  <tr key={registration._id}>
                    <td>
                      <span className="mtr-patient-code">
                        {registration.patient.patientCode}
                      </span>
                    </td>
                    <td>
                      <div className="mtr-patient-info">
                        {/* <div className="mtr-patient-avatar">
                          {registration.patient.userName.charAt(0)}
                        </div> */}
                        <div className="mtr-patient-details">
                          <div className="mtr-patient-name">
                            {registration.patient.userName}
                          </div>
                          <div className="mtr-patient-email">
                            {registration.patient.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="mtr-package-name">
                        {registration.testPackage
                          ? registration.testPackage.name
                          : "Không có dữ liệu"}
                      </div>
                      <div className="mtr-package-type">
                        {registration.testPackage
                          ? registration.testPackage.type
                          : ""}
                      </div>
                    </td>
                    <td>
                      <div className="mtr-date">
                        {formatDate(registration.requestedDate)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`mtr-status-badge mtr-status-${registration.status}`}
                      >
                        {getStatusLabel(registration.status)}
                      </span>
                    </td>
                    <td>
                      {registration.assignedDoctor ? (
                        <div className="mtr-doctor-info">
                          <div className="mtr-doctor-name">
                            {registration.assignedDoctor.user.userName}
                          </div>
                          <div className="mtr-doctor-specialty">
                            {registration.assignedDoctor.specialty}
                          </div>
                        </div>
                      ) : (
                        <div className="mtr-no-doctor">Chưa phân công</div>
                      )}
                    </td>
                    <td>
                      <div className="mtr-price">
                        {registration.testPackage
                          ? formatPrice(registration.testPackage.price)
                          : "0"}
                      </div>
                    </td>
                    <td>
                      <div className="mtr-action-buttons">
                        <button
                          className="mtr-action-btn mtr-view-btn"
                          title="Xem chi tiết"
                          onClick={() => handleViewDetails(registration)}
                        >
                          <Visibility fontSize="small" />
                        </button>
                        <button
                          className="mtr-action-btn mtr-edit-btn"
                          title="Chỉnh sửa"
                          onClick={() => handleEditRegistration(registration)}
                        >
                          <Edit fontSize="small" />
                        </button>
                        {registration.status === "pending" && (
                          <button
                            className="mtr-action-btn mtr-approve-btn"
                            title="Duyệt"
                            onClick={() =>
                              handleApproveSchedule(registration._id)
                            }
                          >
                            <CheckCircle fontSize="small" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mtr-pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  className={`mtr-page-btn ${page === pageNum ? "active" : ""}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Chi tiết đăng ký xét nghiệm
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedRegistration && (
            <Box>
              <Grid container spacing={3}>
                {/* Patient Info */}
                <Box flex="1 1 50%" minWidth={300}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Thông tin bệnh nhân
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Mã bệnh nhân
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedRegistration.patient.patientCode}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Họ và tên
                    </Typography>
                    <Typography variant="body1">
                      {selectedRegistration.patient.userName}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedRegistration.patient.email}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Số điện thoại
                    </Typography>
                    <Typography variant="body1">
                      {selectedRegistration.patient.phone}
                    </Typography>
                  </Box>
                  {selectedRegistration.patient.address && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1">
                        {selectedRegistration.patient.address}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Test Package Info */}
                <Box flex="1 1 50%" minWidth={300}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Thông tin gói xét nghiệm
                  </Typography>
                  {selectedRegistration.testPackage ? (
                    <>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Tên gói
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {selectedRegistration.testPackage.name}
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Loại xét nghiệm
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.testPackage.type}
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Giá
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="primary"
                        >
                          {formatPrice(selectedRegistration.testPackage.price)}
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Thời gian có kết quả
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.testPackage.duration}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body1" color="error">
                      Không có thông tin gói xét nghiệm
                    </Typography>
                  )}
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <StatusChip
                      status={selectedRegistration.status}
                      label={getStatusLabel(selectedRegistration.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* Test Details */}
                {selectedRegistration.testPackage && (
                  <Box width="100%">
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom color="primary">
                      Chi tiết xét nghiệm
                    </Typography>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Đối tượng điều trị</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {selectedRegistration.testPackage.treatmentSubjects.map(
                            (subject, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={subject} />
                              </ListItem>
                            )
                          )}
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Quy trình xét nghiệm</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {selectedRegistration.testPackage.treatmentProcess.map(
                            (process, index) => (
                              <ListItem key={index}>
                                <ListItemText
                                  primary={`${index + 1}. ${process}`}
                                />
                              </ListItem>
                            )
                          )}
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Các xét nghiệm bao gồm</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {selectedRegistration.testPackage.tests.map(
                            (test, index) => (
                              <ListItem key={index}>
                                <ListItemText
                                  primary={
                                    typeof test === "string"
                                      ? test
                                      : test?.testName
                                      ? test.testName
                                      : JSON.stringify(test)
                                  }
                                />
                              </ListItem>
                            )
                          )}
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    {selectedRegistration.testPackage.preparation && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography>Chuẩn bị trước xét nghiệm</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            {selectedRegistration.testPackage.preparation}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </Box>
                )}

                {/* Registration Info */}
                <Box width="100%">
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom color="primary">
                    Thông tin đăng ký
                  </Typography>
                  <Grid container spacing={2}>
                    <Box flex="1 1 50%" minWidth={240}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày đăng ký
                      </Typography>
                      <Typography variant="body1">
                        {formatDateTime(selectedRegistration.createdAt)}
                      </Typography>
                    </Box>
                    <Box flex="1 1 50%" minWidth={240}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày mong muốn
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedRegistration.requestedDate)}
                      </Typography>
                    </Box>
                    {selectedRegistration.actualDate && (
                      <Box flex="1 1 50%" minWidth={240}>
                        <Typography variant="body2" color="text.secondary">
                          Ngày thực hiện
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedRegistration.actualDate)}
                        </Typography>
                      </Box>
                    )}
                    {selectedRegistration.assignedDoctor && (
                      <Box flex="1 1 50%" minWidth={240}>
                        <Typography variant="body2" color="text.secondary">
                          Bác sĩ phụ trách
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.assignedDoctor.user.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedRegistration.assignedDoctor.specialty}
                        </Typography>
                      </Box>
                    )}
                    {selectedRegistration.notes && (
                      <Box width={"100%"}>
                        <Typography variant="body2" color="text.secondary">
                          Ghi chú
                        </Typography>
                        <Typography variant="body1">
                          {selectedRegistration.notes}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Box>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailModal(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="span" fontWeight="bold">
            Cập nhật đăng ký xét nghiệm
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={editForm.status}
                label="Trạng thái"
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
              >
                <MenuItem value="pending">Chờ xử lý</MenuItem>
                <MenuItem value="scheduled">Đã lên lịch</MenuItem>
                <MenuItem value="in_progress">Đang thực hiện</MenuItem>
                <MenuItem value="completed">Hoàn thành</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Ghi chú"
              multiline
              rows={4}
              value={editForm.notes}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
              placeholder="Nhập ghi chú..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Hủy</Button>
          <GradientButton onClick={handleUpdateRegistration}>
            Cập nhật
          </GradientButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManagerTestRegister;
