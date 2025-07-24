import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Ban,
  CheckCircle,
  X,
  Users,
  UserCheck,
  Shield,
} from "lucide-react";
import "./UserManagement.css";
import {
  userServ,
  type User as ApiUser,
  type CreateUserRequest,
  type CreateDoctorRequest,
  type UserDetail,
  type UpdateUserRequest,
  type ToggleUserStatusResponse,
} from "../../../services/userServie";

interface User {
  id: string;
  userName: string;
  email: string;
  phone: string;
  role: "Customer" | "Doctor" | "Admin" | "Manager";
  specialty?: string;
  workSchedule?: string;
  status: "active" | "blocked";
  createdDate: Date;
  gender?: string;
  address?: string;
  patientCode?: string;
}

interface UserFormData {
  userName: string;
  email: string;
  password: string;
  phone: string;
  role: "Customer" | "Doctor" | "Admin" | "Manager";
  gender: string;
  address: string;
  // Doctor specific fields
  degree: string;
  specialty: string;
  workSchedule: string;
  description: string;
  imageUrl: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<
    "userName" | "role" | "createdDate"
  >("userName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "block" | "activate";
    user: User;
  } | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingUser, setAddingUser] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<UserDetail | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    userName: "",
    email: "",
    password: "",
    phone: "",
    role: "Customer",
    gender: "",
    address: "",
    degree: "",
    specialty: "",
    workSchedule: "",
    description: "",
    imageUrl: "",
  });

  // Tính toán stats từ dữ liệu users
  const getUserStats = () => {
    const total = users.length;
    const customers = users.filter((u) => u.role === "Customer").length;
    const doctors = users.filter((u) => u.role === "Doctor").length;
    const admins = users.filter(
      (u) => u.role === "Admin" || u.role === "Manager"
    ).length;
    const active = users.filter((u) => u.status === "active").length;

    return { total, customers, doctors, admins, active };
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Bạn cần đăng nhập để truy cập trang này");
          setLoading(false);
          return;
        }

        const response = await userServ.getAllUsers();

        let userData: ApiUser[] = [];

        if (Array.isArray(response)) {
          userData = response;
        } else if (
          response &&
          "data" in response &&
          Array.isArray((response as { data: ApiUser[] }).data)
        ) {
          userData = (response as { data: ApiUser[] }).data;
        } else {
          throw new Error("Invalid response format from API");
        }

        const transformedUsers: User[] = userData.map((apiUser: ApiUser) => ({
          id: apiUser._id,
          userName: apiUser.userName,
          email: apiUser.email,
          phone: apiUser.phone,
          role: apiUser.role,
          status:
            (apiUser as any).status === "inactive" || (apiUser as any).deletedAt
              ? "blocked"
              : "active",
          createdDate: new Date(apiUser.createdAt),
          gender: apiUser.gender,
          address: apiUser.address,
          patientCode: apiUser.patientCode,
          specialty: undefined,
          workSchedule: undefined,
        }));

        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        if (err.message.includes("Access token not found")) {
          setError("Bạn cần đăng nhập để truy cập trang này");
        } else if (err.response?.status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
        } else if (err.response?.status === 403) {
          setError("Bạn không có quyền truy cập chức năng này");
        } else {
          setError("Có lỗi xảy ra khi tải danh sách người dùng");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search and filter
  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "createdDate") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortField, sortOrder]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddUser = async () => {
    if (
      !formData.userName ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      showMessage("error", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (formData.role === "Doctor") {
      if (
        !formData.degree ||
        !formData.specialty ||
        !formData.workSchedule ||
        !formData.description
      ) {
        showMessage("error", "Vui lòng điền đầy đủ thông tin bác sĩ");
        return;
      }
    }

    setAddingUser(true);

    try {
      if (formData.role === "Doctor") {
        const doctorData: CreateDoctorRequest = {
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          degree: formData.degree,
          specialty: formData.specialty,
          workSchedule: formData.workSchedule
            .split("\n")
            .filter((schedule) => schedule.trim() !== ""),
          description: formData.description,
          imageUrl: formData.imageUrl || undefined,
        };

        const response = await userServ.createDoctor(doctorData);

        const newUser: User = {
          id: Date.now().toString(),
          userName: response.user.userName,
          email: response.user.email,
          phone: response.user.phone,
          role: "Doctor",
          specialty: response.user.specialty,
          workSchedule: formData.workSchedule,
          status: "active",
          createdDate: new Date(),
        };

        setUsers([...users, newUser]);
        showMessage(
          "success",
          response.message || "Tạo tài khoản bác sĩ thành công"
        );
      } else {
        const userData: CreateUserRequest = {
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role as "Customer" | "Admin" | "Manager",
        };

        const response = await userServ.createUser(userData);

        const newUser: User = {
          id: Date.now().toString(),
          userName: response.user.userName,
          email: response.user.email,
          phone: response.user.phone,
          role: response.user.role as
            | "Customer"
            | "Doctor"
            | "Admin"
            | "Manager",
          status: "active",
          createdDate: new Date(),
        };

        setUsers([...users, newUser]);
        showMessage("success", response.message || "Tạo tài khoản thành công");
      }

      resetForm();
    } catch (err: any) {
      console.error("Error creating user:", err);

      if (err.response?.status === 401) {
        showMessage(
          "error",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"
        );
      } else if (err.response?.status === 403) {
        showMessage("error", "Bạn không có quyền tạo tài khoản");
      } else if (err.response?.data?.message) {
        showMessage("error", err.response.data.message);
      } else {
        showMessage("error", "Có lỗi xảy ra khi tạo tài khoản");
      }
    } finally {
      setAddingUser(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      userName: user.userName,
      email: user.email,
      password: "",
      phone: user.phone,
      role: user.role as "Customer" | "Doctor" | "Admin" | "Manager",
      gender: user.gender || "",
      address: user.address || "",
      specialty: user.specialty || "",
      workSchedule: user.workSchedule || "",
      degree: "",
      description: "",
      imageUrl: "",
    });
    setShowAddForm(true);
  };

  const handleUpdateUser = async () => {
    if (
      !editingUser ||
      !formData.userName ||
      !formData.email ||
      !formData.phone
    ) {
      showMessage("error", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setUpdatingUser(true);

    try {
      const updateData: UpdateUserRequest = {
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
      };

      if (formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      const response = await userServ.updateUser(updateData, editingUser.id);

      const updatedUsers = users.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              phone: formData.phone,
              address: formData.address,
              gender: formData.gender,
            }
          : user
      );

      setUsers(updatedUsers);
      resetForm();
      showMessage(
        "success",
        response.message || "Cập nhật người dùng thành công"
      );
    } catch (err: any) {
      console.error("Error updating user:", err);

      if (err.response?.status === 401) {
        showMessage(
          "error",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"
        );
      } else if (err.response?.status === 403) {
        showMessage("error", "Bạn không có quyền cập nhật tài khoản này");
      } else if (err.response?.status === 404) {
        showMessage("error", "Không tìm thấy người dùng");
      } else if (err.response?.data?.message) {
        showMessage("error", err.response.data.message);
      } else {
        showMessage("error", "Có lỗi xảy ra khi cập nhật tài khoản");
      }
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    setTogglingStatus(user.id);

    try {
      let response: ToggleUserStatusResponse;

      if (user.status === "active") {
        response = await userServ.softDeleteUser(user.id);
      } else {
        response = await userServ.restoreUser(user.id);
      }

      const updatedUsers = users.map((u) =>
        u.id === user.id
          ? {
              ...u,
              status: (response.user.status === "active"
                ? "active"
                : "blocked") as "active" | "blocked",
            }
          : u
      );

      setUsers(updatedUsers);
      setConfirmAction(null);

      const actionText =
        response.user.status === "active" ? "kích hoạt" : "khóa";
      showMessage(
        "success",
        response.message || `${actionText} tài khoản thành công`
      );
    } catch (err: any) {
      console.error("Error toggling user status:", err);

      if (err.response?.status === 401) {
        showMessage(
          "error",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"
        );
      } else if (err.response?.status === 403) {
        showMessage("error", "Bạn không có quyền thực hiện hành động này");
      } else if (err.response?.status === 404) {
        showMessage("error", "Không tìm thấy người dùng");
      } else if (err.response?.data?.message) {
        showMessage("error", err.response.data.message);
      } else {
        showMessage("error", "Có lỗi xảy ra khi thay đổi trạng thái tài khoản");
      }
    } finally {
      setTogglingStatus(null);
    }
  };

  const resetForm = () => {
    setFormData({
      userName: "",
      email: "",
      password: "",
      phone: "",
      role: "Customer",
      gender: "",
      address: "",
      degree: "",
      specialty: "",
      workSchedule: "",
      description: "",
      imageUrl: "",
    });
    setEditingUser(null);
    setShowAddForm(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      Customer: "Khách hàng",
      Doctor: "Bác sĩ",
      Admin: "Quản trị viên",
      Manager: "Quản lý",
    };
    return roleMap[role] || role;
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <div className="user-management">
        <div className="user-management-container">
          <div className="user-management-loading">
            <div className="user-management-loading-spinner"></div>
            <p>Đang tải danh sách người dùng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management">
        <div className="user-management-container">
          <div className="user-management-error">
            <X size={48} className="error-icon" />
            <h3>Có lỗi xảy ra</h3>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="user-btn user-btn-primary"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Message Toast */}
      {message && (
        <div className={`user-message-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="user-management-container">
        {/* Header */}
        <div className="user-management-header">
          <div className="user-management-header-content">
            <h1 className="user-management-title">Quản lý người dùng</h1>
            <button
              className="user-add-btn"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={20} />
              Thêm người dùng
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="user-stats">
          <div className="user-stat-card">
            <div className="user-stat-icon">
              <Users size={24} />
            </div>
            <div className="user-stat-content">
              <h3>Tổng người dùng</h3>
              <p>{stats.total}</p>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="user-stat-icon customer">
              <Users size={24} />
            </div>
            <div className="user-stat-content">
              <h3>Khách hàng</h3>
              <p>{stats.customers}</p>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="user-stat-icon doctor">
              <Shield size={24} />
            </div>
            <div className="user-stat-content">
              <h3>Bác sĩ</h3>
              <p>{stats.doctors}</p>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="user-stat-icon active">
              <UserCheck size={24} />
            </div>
            <div className="user-stat-content">
              <h3>Đang hoạt động</h3>
              <p>{stats.active}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="user-controls">
          <div className="user-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortField(field as "userName" | "role" | "createdDate");
              setSortOrder(order as "asc" | "desc");
            }}
            className="user-filter-select"
          >
            <option value="userName-asc">Tên (A-Z)</option>
            <option value="userName-desc">Tên (Z-A)</option>
            <option value="role-asc">Vai trò (A-Z)</option>
            <option value="role-desc">Vai trò (Z-A)</option>
            <option value="createdDate-asc">Ngày tạo (Cũ nhất)</option>
            <option value="createdDate-desc">Ngày tạo (Mới nhất)</option>
          </select>
        </div>

        {/* Table Container */}
        <div className="user-table-container">
          <div className="user-table-header">
            <h2>Danh sách người dùng ({filteredUsers.length})</h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="user-no-data">
              <Users size={40} />
              <p>Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <div className="user-table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Giới tính</th>
                    <th>Địa chỉ</th>
                    <th>Mã bệnh nhân</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.userName}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span
                          className={`role-badge ${user.role.toLowerCase()}`}
                        >
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td>
                        {user.gender === "Male"
                          ? "Nam"
                          : user.gender === "Female"
                          ? "Nữ"
                          : "-"}
                      </td>
                      <td>{user.address || "-"}</td>
                      <td>{user.patientCode || "-"}</td>
                      <td>{formatDate(user.createdDate)}</td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td>
                        <div className="user-action-buttons">
                          <button
                            className="user-action-btn edit"
                            onClick={() => handleEditUser(user)}
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className={`user-action-btn ${
                              user.status === "active" ? "block" : "activate"
                            }`}
                            onClick={() =>
                              setConfirmAction({
                                type:
                                  user.status === "active"
                                    ? "block"
                                    : "activate",
                                user,
                              })
                            }
                            title={
                              user.status === "active"
                                ? "Khóa tài khoản"
                                : "Kích hoạt tài khoản"
                            }
                            disabled={togglingStatus === user.id}
                          >
                            {togglingStatus === user.id ? (
                              <span style={{ fontSize: "12px" }}>⏳</span>
                            ) : user.status === "active" ? (
                              <Ban size={16} />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {viewingUser && (
          <div className="user-modal-overlay">
            <div className="user-modal-content">
              <div className="user-modal-header">
                <h3>Chi tiết người dùng</h3>
                <button
                  className="user-close-btn"
                  onClick={() => setViewingUser(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit User Form Modal */}
        {showAddForm && (
          <div className="user-modal-overlay">
            <div className="user-modal-content">
              <div className="user-modal-header">
                <h3>
                  {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                </h3>
                <button className="user-close-btn" onClick={resetForm}>
                  <X size={20} />
                </button>
              </div>
              <div className="user-modal-body">
                <div className="user-form-group">
                  <label htmlFor="role" className="user-form-label">
                    Vai trò *
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as
                          | "Customer"
                          | "Doctor"
                          | "Admin"
                          | "Manager",
                      })
                    }
                    className="user-form-select"
                    required
                    disabled={editingUser !== null}
                  >
                    <option value="Customer">Khách hàng</option>
                    <option value="Doctor">Bác sĩ</option>
                    <option value="Admin">Quản trị viên</option>
                    <option value="Manager">Quản lý</option>
                  </select>
                </div>

                <div className="user-form-group">
                  <label htmlFor="userName" className="user-form-label">
                    Tên *
                  </label>
                  <input
                    id="userName"
                    type="text"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    className="user-form-input"
                    required
                    disabled={editingUser !== null}
                  />
                  {editingUser && (
                    <small style={{ color: "#666", fontSize: "12px" }}>
                      Tên không thể thay đổi khi chỉnh sửa
                    </small>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="email" className="user-form-label">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="user-form-input"
                    required
                    disabled={editingUser !== null}
                  />
                  {editingUser && (
                    <small style={{ color: "#666", fontSize: "12px" }}>
                      Email không thể thay đổi khi chỉnh sửa
                    </small>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="password" className="user-form-label">
                    Mật khẩu{" "}
                    {editingUser ? "(để trống nếu không muốn đổi)" : "*"}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="user-form-input"
                    required={!editingUser}
                    placeholder={
                      editingUser
                        ? "Nhập mật khẩu mới (tùy chọn)"
                        : "Nhập mật khẩu"
                    }
                  />
                </div>

                <div className="user-form-group">
                  <label htmlFor="phone" className="user-form-label">
                    Số điện thoại *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="user-form-input"
                    required
                  />
                </div>

                <div className="user-form-group">
                  <label htmlFor="gender" className="user-form-label">
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="user-form-select"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>
                </div>

                <div className="user-form-group">
                  <label htmlFor="address" className="user-form-label">
                    Địa chỉ
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="user-form-input"
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                {formData.role === "Doctor" && (
                  <>
                    <div className="user-form-group">
                      <label htmlFor="degree" className="user-form-label">
                        Bằng cấp *
                      </label>
                      <input
                        id="degree"
                        type="text"
                        value={formData.degree}
                        onChange={(e) =>
                          setFormData({ ...formData, degree: e.target.value })
                        }
                        className="user-form-input"
                        placeholder="VD: MD, PhD"
                        required
                      />
                    </div>
                    <div className="user-form-group">
                      <label htmlFor="specialty" className="user-form-label">
                        Chuyên khoa *
                      </label>
                      <input
                        id="specialty"
                        type="text"
                        value={formData.specialty}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialty: e.target.value,
                          })
                        }
                        className="user-form-input"
                        placeholder="VD: Reproductive Medicine"
                        required
                      />
                    </div>
                    <div className="user-form-group">
                      <label htmlFor="workSchedule" className="user-form-label">
                        Lịch làm việc *
                      </label>
                      <textarea
                        id="workSchedule"
                        value={formData.workSchedule}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workSchedule: e.target.value,
                          })
                        }
                        className="user-form-textarea"
                        placeholder="Mỗi dòng một lịch làm việc&#10;VD: Monday 8:00-17:00&#10;Tuesday 8:00-17:00"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="user-form-group">
                      <label htmlFor="description" className="user-form-label">
                        Mô tả *
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="user-form-textarea"
                        placeholder="VD: Specialist in reproductive health with 10 years of experience"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="user-form-group">
                      <label htmlFor="imageUrl" className="user-form-label">
                        URL ảnh đại diện
                      </label>
                      <input
                        id="imageUrl"
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                        className="user-form-input"
                        placeholder="https://example.com/doctor-image.jpg"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="user-modal-footer">
                <button
                  className="user-btn user-btn-secondary"
                  onClick={resetForm}
                >
                  Hủy
                </button>
                <button
                  className="user-btn user-btn-primary"
                  onClick={editingUser ? handleUpdateUser : handleAddUser}
                  disabled={addingUser || updatingUser}
                >
                  {updatingUser
                    ? "⏳ Đang cập nhật..."
                    : addingUser
                    ? "⏳ Đang tạo..."
                    : editingUser
                    ? "Cập nhật"
                    : "Thêm"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmAction && (
          <div className="user-modal-overlay">
            <div className="user-modal-content" style={{ maxWidth: "500px" }}>
              <div className="user-modal-header">
                <h3>Xác nhận</h3>
                <button
                  className="user-close-btn"
                  onClick={() => setConfirmAction(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="user-modal-body">
                <p>
                  {confirmAction.type === "block" && (
                    <>
                      Bạn có chắc chắn muốn <strong>khóa</strong> tài khoản "
                      {confirmAction.user.userName}"?
                      <br />
                      <small style={{ color: "#666" }}>
                        Tài khoản sẽ bị vô hiệu hóa và người dùng không thể đăng
                        nhập.
                      </small>
                    </>
                  )}
                  {confirmAction.type === "activate" && (
                    <>
                      Bạn có chắc chắn muốn <strong>kích hoạt</strong> tài khoản
                      "{confirmAction.user.userName}"?
                      <br />
                      <small style={{ color: "#666" }}>
                        Tài khoản sẽ được khôi phục và người dùng có thể đăng
                        nhập trở lại.
                      </small>
                    </>
                  )}
                </p>
              </div>
              <div className="user-modal-footer">
                <button
                  className="user-btn user-btn-secondary"
                  onClick={() => setConfirmAction(null)}
                >
                  Hủy
                </button>
                <button
                  className={`user-btn ${
                    confirmAction.type === "block"
                      ? "user-btn-danger"
                      : "user-btn-primary"
                  }`}
                  onClick={() => handleToggleStatus(confirmAction.user)}
                  disabled={togglingStatus === confirmAction.user.id}
                >
                  {togglingStatus === confirmAction.user.id
                    ? "⏳ Đang xử lý..."
                    : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
