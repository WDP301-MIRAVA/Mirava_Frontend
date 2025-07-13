import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip,
  Grid,
} from "@mui/material";

import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Block,
  Check,
  Person,
  Email,
  Phone,
  School,
  Close,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  fontSize: "0.75rem",
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #00b4c6, #0284c7)",
  color: "white",
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1, 2),
  "&:hover": {
    background: "linear-gradient(135deg, #0284c7, #00b4c6)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 180, 198, 0.3)",
  },
}));

interface Doctor {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
  };
  specialty: string;
  degree: string;
  experience: number;
  description: string;
  imageUrl?: string;
  status: "active" | "inactive";
  workSchedule?: string[];
  rating?: number;
  createdAt: string;
}

const ManagerDoctor: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "specialty" | "createdDate">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "block" | "activate";
    doctorId: string;
    doctorName: string;
  } | null>(null);

  // Form states
  const [newDoctor, setNewDoctor] = useState({
    userName: "",
    email: "",
    password: "123456",
    phone: "",
    specialty: "",
    degree: "",
    experience: 0,
    description: "",
    imageUrl: "",
  });

  const [editDoctor, setEditDoctor] = useState({
    degree: "",
    specialty: "",
    experience: 0,
    description: "",
    imageUrl: "",
  });

  const [specialties, setSpecialties] = useState<string[]>([]);

  // Fetch doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter and search doctors
  useEffect(() => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.user.userName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.user.phone.includes(searchTerm) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((doctor) => doctor.status === statusFilter);
    }

    if (specialtyFilter !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.specialty === specialtyFilter
      );
    }

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.user.userName;
          bValue = b.user.userName;
          break;
        case "specialty":
          aValue = a.specialty;
          bValue = b.specialty;
          break;
        case "createdDate":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.user.userName;
          bValue = b.user.userName;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, statusFilter, specialtyFilter, sortBy, sortOrder]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/doctor",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (response.status === 403) {
          throw new Error("Bạn không có quyền truy cập tính năng này.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (Array.isArray(data)) {
        setDoctors(data);
        const uniqueSpecialties = [
          ...new Set(data.map((doctor: Doctor) => doctor.specialty)),
        ];
        setSpecialties(uniqueSpecialties);
      } else if (data.doctors && Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
        const uniqueSpecialties = [
          ...new Set(data.doctors.map((doctor: Doctor) => doctor.specialty)),
        ];
        setSpecialties(uniqueSpecialties);
      } else {
        throw new Error("Dữ liệu trả về không đúng định dạng");
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/auth/doctor/register",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: newDoctor.userName,
            email: newDoctor.email,
            password: newDoctor.password,
            phone: newDoctor.phone,
            degree: newDoctor.degree,
            specialty: newDoctor.specialty,
            experience: newDoctor.experience,
            description: newDoctor.description,
            imageUrl: newDoctor.imageUrl,
          }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Không thể thêm bác sĩ";

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Add doctor success:", result);

      await fetchDoctors();
      setShowAddModal(false);
      setNewDoctor({
        userName: "",
        email: "",
        password: "123456",
        phone: "",
        specialty: "",
        degree: "",
        experience: 0,
        description: "",
        imageUrl: "",
      });
      setError(null);
    } catch (err) {
      console.error("Error adding doctor:", err);
      setError(err instanceof Error ? err.message : "Không thể thêm bác sĩ");
    }
  };

  const handleEditDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/doctor/${selectedDoctor._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            degree: editDoctor.degree,
            specialty: editDoctor.specialty,
            experience: editDoctor.experience,
            description: editDoctor.description,
            imageUrl: editDoctor.imageUrl,
          }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Không thể cập nhật bác sĩ";

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }

        throw new Error(errorMessage);
      }

      await fetchDoctors();
      setShowEditModal(false);
      setSelectedDoctor(null);
      setError(null);
    } catch (err) {
      console.error("Error updating doctor:", err);
      setError(
        err instanceof Error ? err.message : "Không thể cập nhật bác sĩ"
      );
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/doctor/${doctorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Không thể xóa bác sĩ";

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }

        throw new Error(errorMessage);
      }

      await fetchDoctors();
      setError(null);
    } catch (err) {
      console.error("Error deleting doctor:", err);
      setError(err instanceof Error ? err.message : "Không thể xóa bác sĩ");
    }
  };

  const handleStatusToggle = async (
    doctorId: string,
    currentStatus: string
  ) => {
    try {
      const token = localStorage.getItem("accessToken");
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/doctor/${doctorId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Không thể thay đổi trạng thái bác sĩ";

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
          }
        } else {
          const errorText = await response.text();
          console.error("API returned HTML/text instead of JSON:", errorText);

          if (response.status === 404) {
            errorMessage = "Không tìm thấy bác sĩ";
          } else if (response.status === 500) {
            errorMessage = "Lỗi server, vui lòng thử lại sau";
          }
        }

        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        console.log("Status update success:", result);
      }

      await fetchDoctors();
      setError(null);
    } catch (err) {
      console.error("Error updating doctor status:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể thay đổi trạng thái bác sĩ"
      );
    }
  };

  const openEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setEditDoctor({
      degree: doctor.degree,
      specialty: doctor.specialty,
      experience: doctor.experience,
      description: doctor.description,
      imageUrl: doctor.imageUrl || "",
    });
    setShowEditModal(true);
  };

  const openDetailModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailModal(true);
  };

  const showConfirmDialog = (
    type: "delete" | "block" | "activate",
    doctorId: string,
    doctorName: string
  ) => {
    setConfirmAction({ type, doctorId, doctorName });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === "delete") {
        await handleDeleteDoctor(confirmAction.doctorId);
      } else {
        const doctor = doctors.find((d) => d._id === confirmAction.doctorId);
        if (doctor) {
          await handleStatusToggle(confirmAction.doctorId, doctor.status);
        }
      }

      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (err) {
      console.error("Error in confirm action:", err);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography>Đang tải danh sách bác sĩ...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Có lỗi xảy ra</Typography>
          <Typography>{error}</Typography>
        </Alert>
        <Button onClick={fetchDoctors} variant="contained">
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, bgcolor: "#f8fafc", minHeight: "100vh" }}
    >
      {/* Header */}
      <StyledCard sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                color="#1e293b"
                gutterBottom
              >
                Quản lý Bác sĩ
              </Typography>
              <Typography variant="body1" color="#64748b">
                Quản lý thông tin và lịch làm việc của các bác sĩ
              </Typography>
            </Box>
            <GradientButton
              startIcon={<Add />}
              onClick={() => setShowAddModal(true)}
            >
              Thêm Bác sĩ
            </GradientButton>
          </Box>
        </CardContent>
      </StyledCard>

      {/* Controls */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên, email, SĐT hoặc chuyên khoa..."
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
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "active" | "inactive"
                    )
                  }
                >
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="inactive">Tạm dừng</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Chuyên khoa</InputLabel>
                <Select
                  value={specialtyFilter}
                  label="Chuyên khoa"
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả chuyên khoa</MenuItem>
                  {specialties.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  label="Sắp xếp"
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field as "name" | "specialty" | "createdDate");
                    setSortOrder(order as "asc" | "desc");
                  }}
                >
                  <MenuItem value="name-asc">Tên (A-Z)</MenuItem>
                  <MenuItem value="name-desc">Tên (Z-A)</MenuItem>
                  <MenuItem value="specialty-asc">Chuyên khoa (A-Z)</MenuItem>
                  <MenuItem value="specialty-desc">Chuyên khoa (Z-A)</MenuItem>
                  <MenuItem value="createdDate-asc">
                    Ngày tạo (Cũ nhất)
                  </MenuItem>
                  <MenuItem value="createdDate-desc">
                    Ngày tạo (Mới nhất)
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Doctor Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    bgcolor: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                  }}
                >
                  <Person />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#1e293b">
                    {doctors.length}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Tổng số bác sĩ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    bgcolor: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16a34a",
                  }}
                >
                  <Check />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#1e293b">
                    {doctors.filter((d) => d.status === "active").length}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Đang hoạt động
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    bgcolor: "#fef2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#dc2626",
                  }}
                >
                  <Block />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#1e293b">
                    {doctors.filter((d) => d.status === "inactive").length}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Tạm dừng
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    bgcolor: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                  }}
                >
                  <School />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#1e293b">
                    {specialties.length}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Chuyên khoa
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Doctors Table */}
      <StyledCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{ background: "linear-gradient(135deg, #00b4c6, #0284c7)" }}
              >
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Bác sĩ
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Liên hệ
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Chuyên khoa
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Kinh nghiệm
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Trạng thái
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDoctors.map((doctor) => (
                <TableRow key={doctor._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        src={doctor.imageUrl}
                        alt={doctor.user.userName}
                        sx={{ width: 48, height: 48 }}
                      >
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          color="#1e293b"
                          sx={{
                            cursor: "pointer",
                            "&:hover": { color: "#00b4c6" },
                          }}
                          onClick={() => openDetailModal(doctor)}
                        >
                          {doctor.user.userName}
                        </Typography>
                        <Typography variant="body2" color="#64748b">
                          {doctor.degree}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Email sx={{ fontSize: 14, color: "#64748b" }} />
                        <Typography variant="body2" color="#64748b">
                          {doctor.user.email}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Phone sx={{ fontSize: 14, color: "#64748b" }} />
                        <Typography variant="body2" color="#64748b">
                          {doctor.user.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doctor.specialty}
                      sx={{
                        bgcolor: "#f0f9ff",
                        color: "#0284c7",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="#374151"
                    >
                      {doctor.experience} năm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StyledChip
                      label={
                        doctor.status === "active" ? "Hoạt động" : "Tạm dừng"
                      }
                      color={doctor.status === "active" ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => openDetailModal(doctor)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => openEditModal(doctor)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          doctor.status === "active" ? "Tạm dừng" : "Kích hoạt"
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            showConfirmDialog(
                              doctor.status === "active" ? "block" : "activate",
                              doctor._id,
                              doctor.user.userName
                            )
                          }
                        >
                          {doctor.status === "active" ? <Block /> : <Check />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() =>
                            showConfirmDialog(
                              "delete",
                              doctor._id,
                              doctor.user.userName
                            )
                          }
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredDoctors.length === 0 && (
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <Person sx={{ fontSize: 48, color: "#64748b", mb: 2 }} />
            <Typography variant="h6" color="#374151" gutterBottom>
              Không tìm thấy bác sĩ nào
            </Typography>
            <Typography variant="body2" color="#64748b">
              Thử thay đổi tiêu chí tìm kiếm hoặc thêm bác sĩ mới
            </Typography>
          </Box>
        )}
      </StyledCard>

      {/* Add Doctor Modal */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Thêm Bác sĩ Mới</Typography>
            <IconButton onClick={() => setShowAddModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên bác sĩ"
                value={newDoctor.userName}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, userName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newDoctor.email}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mật khẩu"
                type="password"
                value={newDoctor.password}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={newDoctor.phone}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chuyên khoa"
                value={newDoctor.specialty}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, specialty: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bằng cấp"
                value={newDoctor.degree}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, degree: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kinh nghiệm (năm)"
                type="number"
                value={newDoctor.experience}
                onChange={(e) =>
                  setNewDoctor({
                    ...newDoctor,
                    experience: parseInt(e.target.value) || 0,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                value={newDoctor.description}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL ảnh đại diện"
                value={newDoctor.imageUrl}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, imageUrl: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddModal(false)}>Hủy</Button>
          <GradientButton onClick={handleAddDoctor}>Thêm Bác sĩ</GradientButton>
        </DialogActions>
      </Dialog>

      {/* Edit Doctor Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Chỉnh sửa Bác sĩ</Typography>
            <IconButton onClick={() => setShowEditModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chuyên khoa"
                value={editDoctor.specialty}
                onChange={(e) =>
                  setEditDoctor({ ...editDoctor, specialty: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bằng cấp"
                value={editDoctor.degree}
                onChange={(e) =>
                  setEditDoctor({ ...editDoctor, degree: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kinh nghiệm (năm)"
                type="number"
                value={editDoctor.experience}
                onChange={(e) =>
                  setEditDoctor({
                    ...editDoctor,
                    experience: parseInt(e.target.value) || 0,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                value={editDoctor.description}
                onChange={(e) =>
                  setEditDoctor({ ...editDoctor, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL ảnh đại diện"
                value={editDoctor.imageUrl}
                onChange={(e) =>
                  setEditDoctor({ ...editDoctor, imageUrl: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Hủy</Button>
          <GradientButton onClick={handleEditDoctor}>Cập nhật</GradientButton>
        </DialogActions>
      </Dialog>

      {/* Doctor Detail Modal */}
      <Dialog
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Chi tiết Bác sĩ</Typography>
            <IconButton onClick={() => setShowDetailModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <Box sx={{ mt: 2 }}>
              <Box display="flex" gap={3} alignItems="center" mb={3}>
                <Avatar
                  src={selectedDoctor.imageUrl}
                  alt={selectedDoctor.user.userName}
                  sx={{ width: 100, height: 100 }}
                >
                  <Person sx={{ fontSize: 60 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    color="#1e293b"
                    gutterBottom
                  >
                    {selectedDoctor.user.userName}
                  </Typography>
                  <Typography variant="body1" color="#64748b" gutterBottom>
                    {selectedDoctor.degree}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="#0284c7"
                    fontWeight={600}
                    gutterBottom
                  >
                    {selectedDoctor.specialty}
                  </Typography>
                  <StyledChip
                    label={
                      selectedDoctor.status === "active"
                        ? "Hoạt động"
                        : "Tạm dừng"
                    }
                    color={
                      selectedDoctor.status === "active" ? "success" : "error"
                    }
                  />
                </Box>
              </Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="#374151"
                  >
                    Email:
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    {selectedDoctor.user.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="#374151"
                  >
                    Số điện thoại:
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    {selectedDoctor.user.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="#374151"
                  >
                    Kinh nghiệm:
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    {selectedDoctor.experience} năm
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="#374151"
                  >
                    Ngày tham gia:
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    {new Date(selectedDoctor.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="#374151"
                  gutterBottom
                >
                  Mô tả:
                </Typography>
                <Typography
                  variant="body2"
                  color="#64748b"
                  sx={{ lineHeight: 1.6 }}
                >
                  {selectedDoctor.description || "Chưa có mô tả"}
                </Typography>
              </Box>
              {selectedDoctor.workSchedule &&
                selectedDoctor.workSchedule.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="#374151"
                      gutterBottom
                    >
                      Lịch làm việc:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {selectedDoctor.workSchedule.map((schedule, index) => (
                        <Typography
                          component="li"
                          key={index}
                          variant="body2"
                          color="#64748b"
                          sx={{ mb: 0.5 }}
                        >
                          {schedule}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailModal(false)}>Đóng</Button>
          <GradientButton
            onClick={() => {
              setShowDetailModal(false);
              selectedDoctor && openEditModal(selectedDoctor);
            }}
          >
            Chỉnh sửa
          </GradientButton>
        </DialogActions>
      </Dialog>

      {/* Confirm Modal */}
      <Dialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Xác nhận thao tác</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn {confirmAction?.type === "delete" && "xóa"}
            {confirmAction?.type === "block" && "tạm dừng"}
            {confirmAction?.type === "activate" && "kích hoạt"} bác sĩ{" "}
            <strong>{confirmAction?.doctorName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmModal(false)}>Hủy</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmAction}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManagerDoctor;
