import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Eye, Ban, CheckCircle, X } from "lucide-react";
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
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

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

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Bạn cần đăng nhập để truy cập trang này");
          setLoading(false);
          return;
        }

        const response = await userServ.getAllUsers();

        let userData: ApiUser[] = [];

        // Handle different response formats
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

        // Transform API data to component data format
        const transformedUsers: User[] = userData.map((apiUser: ApiUser) => ({
          id: apiUser._id,
          userName: apiUser.userName,
          email: apiUser.email,
          phone: apiUser.phone,
          role: apiUser.role,
          // Determine status from API response - check if user has deletedAt or status field
          status:
            (apiUser as any).status === "inactive" || (apiUser as any).deletedAt
              ? "blocked"
              : "active",
          createdDate: new Date(apiUser.createdAt),
          gender: apiUser.gender,
          address: apiUser.address,
          patientCode: apiUser.patientCode,
          // For doctors, we might need to get specialty and workSchedule from other sources
          specialty: undefined, // Not available in current API response
          workSchedule: undefined, // Not available in current API response
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

    // Sort
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

    // Validate doctor specific fields
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
        // Create doctor account
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

        // Add to local state
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
        // Create regular user account
        const userData: CreateUserRequest = {
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role as "Customer" | "Admin" | "Manager",
        };

        const response = await userServ.createUser(userData);

        // Add to local state
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

      // Reset form
      setShowAddForm(false);
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
      password: "", // Don't prefill password for security
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
      // Prepare update data - only send fields that can be updated via API
      const updateData: UpdateUserRequest = {
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
      };

      // Only include password if it's provided
      if (formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      const response = await userServ.updateUser(updateData, editingUser.id);

      // Update local state
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
      setShowAddForm(false);
      setEditingUser(null);
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

  const handleViewUser = async (user: User) => {
    setLoadingUserDetail(true);
    try {
      const userDetail = await userServ.getUserById(user.id);
      setViewingUser(userDetail);
    } catch (err: any) {
      console.error("Error fetching user detail:", err);

      if (err.response?.status === 401) {
        showMessage(
          "error",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"
        );
      } else if (err.response?.status === 403) {
        showMessage("error", "Bạn không có quyền xem chi tiết tài khoản này");
      } else if (err.response?.status === 404) {
        showMessage("error", "Không tìm thấy thông tin người dùng");
      } else {
        showMessage("error", "Có lỗi xảy ra khi tải thông tin chi tiết");
      }
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const closeUserDetailModal = () => {
    setViewingUser(null);
  };

  const handleToggleStatus = async (user: User) => {
    setTogglingStatus(user.id);

    try {
      let response: ToggleUserStatusResponse;

      if (user.status === "active") {
        // Block user (soft delete)
        response = await userServ.softDeleteUser(user.id);
      } else {
        // Unblock user (restore)
        response = await userServ.restoreUser(user.id);
      }

      // Update local state based on API response
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

  if (loading) {
    return (
      <div className="user-management">
        <div className="user-management-card">
          <div className="card-header">
            <h1 className="card-title">Quản lý người dùng</h1>
          </div>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div>⏳ Đang tải dữ liệu...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management">
        <div className="user-management-card">
          <div className="card-header">
            <h1 className="card-title">Quản lý người dùng</h1>
          </div>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div style={{ color: "red", fontSize: "16px" }}>{error}</div>
            <button
              style={{ marginTop: "20px", padding: "10px 20px" }}
              onClick={() => window.location.reload()}
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
        <div className={`message-toast ${message.type}`}>{message.text}</div>
      )}

      <div className="user-management-card">
        <div className="card-header">
          <h1 className="card-title">Quản lý người dùng</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={20} />
            Thêm người dùng
          </button>
        </div>

        {/* Search and Sort Controls */}
        <div className="controls">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="sort-container">
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortField(field as "userName" | "role" | "createdDate");
                setSortOrder(order as "asc" | "desc");
              }}
              className="sort-select"
            >
              <option value="userName-asc">Tên (A-Z)</option>
              <option value="userName-desc">Tên (Z-A)</option>
              <option value="role-asc">Vai trò (A-Z)</option>
              <option value="role-desc">Vai trò (Z-A)</option>
              <option value="createdDate-asc">Ngày tạo (Cũ nhất)</option>
              <option value="createdDate-desc">Ngày tạo (Mới nhất)</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="table-container">
          {filteredUsers.length === 0 ? (
            <div className="no-results">
              <p>Không tìm thấy kết quả nào</p>
            </div>
          ) : (
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
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
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
                      <div className="action-buttons">
                        <button
                          className="btn-action edit"
                          onClick={() => handleEditUser(user)}
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-action view"
                          onClick={() => handleViewUser(user)}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={`btn-action ${
                            user.status === "active" ? "block" : "activate"
                          }`}
                          onClick={() =>
                            setConfirmAction({
                              type:
                                user.status === "active" ? "block" : "activate",
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
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {viewingUser && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h2>Chi tiết người dùng</h2>
              <button className="btn-close" onClick={closeUserDetailModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {loadingUserDetail ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div>⏳ Đang tải thông tin chi tiết...</div>
                </div>
              ) : (
                <div className="user-detail-content">
                  <div className="detail-section">
                    <h3>Thông tin cơ bản</h3>
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">{viewingUser._id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tên:</span>
                      <span className="detail-value">
                        {viewingUser.userName}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{viewingUser.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Số điện thoại:</span>
                      <span className="detail-value">{viewingUser.phone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Vai trò:</span>
                      <span
                        className={`role-badge ${viewingUser.role.toLowerCase()}`}
                      >
                        {getRoleDisplayName(viewingUser.role)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Giới tính:</span>
                      <span className="detail-value">
                        {viewingUser.gender === "Male"
                          ? "Nam"
                          : viewingUser.gender === "Female"
                          ? "Nữ"
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Địa chỉ:</span>
                      <span className="detail-value">
                        {viewingUser.address || "Chưa cập nhật"}
                      </span>
                    </div>
                    {viewingUser.patientCode && (
                      <div className="detail-row">
                        <span className="detail-label">Mã bệnh nhân:</span>
                        <span className="detail-value">
                          {viewingUser.patientCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {viewingUser.role === "Doctor" && (
                    <div className="detail-section">
                      <h3>Thông tin bác sĩ</h3>
                      {viewingUser.degree && (
                        <div className="detail-row">
                          <span className="detail-label">Bằng cấp:</span>
                          <span className="detail-value">
                            {viewingUser.degree}
                          </span>
                        </div>
                      )}
                      {viewingUser.specialty && (
                        <div className="detail-row">
                          <span className="detail-label">Chuyên khoa:</span>
                          <span className="detail-value">
                            {viewingUser.specialty}
                          </span>
                        </div>
                      )}
                      {viewingUser.description && (
                        <div className="detail-row">
                          <span className="detail-label">Mô tả:</span>
                          <span className="detail-value">
                            {viewingUser.description}
                          </span>
                        </div>
                      )}
                      {viewingUser.imageUrl && (
                        <div className="detail-row">
                          <span className="detail-label">Ảnh đại diện:</span>
                          <span className="detail-value">
                            <img
                              src={viewingUser.imageUrl}
                              alt="Doctor avatar"
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                borderRadius: "8px",
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="detail-section">
                    <h3>Thông tin hệ thống</h3>
                    <div className="detail-row">
                      <span className="detail-label">Ngày tạo:</span>
                      <span className="detail-value">
                        {formatDateTime(viewingUser.createdAt)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Cập nhật lần cuối:</span>
                      <span className="detail-value">
                        {formatDateTime(viewingUser.updatedAt)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">
                        Trạng thái đăng nhập:
                      </span>
                      <span className="detail-value">
                        {viewingUser.accessToken &&
                        viewingUser.accessToken.length > 0 ? (
                          <span style={{ color: "green" }}>
                            ✅ Đã đăng nhập
                          </span>
                        ) : (
                          <span style={{ color: "gray" }}>
                            ⚪ Chưa đăng nhập
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeUserDetailModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
              </h2>
              <button className="btn-close" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="role">Vai trò *</label>
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
                  className="form-select"
                  required
                  disabled={editingUser !== null}
                >
                  <option value="Customer">Khách hàng</option>
                  <option value="Doctor">Bác sĩ</option>
                  <option value="Admin">Quản trị viên</option>
                  <option value="Manager">Quản lý</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="userName">Tên *</label>
                <input
                  id="userName"
                  type="text"
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData({ ...formData, userName: e.target.value })
                  }
                  className="form-input"
                  required
                  disabled={editingUser !== null}
                />
                {editingUser && (
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    Tên không thể thay đổi khi chỉnh sửa
                  </small>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="form-input"
                  required
                  disabled={editingUser !== null}
                />
                {editingUser && (
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    Email không thể thay đổi khi chỉnh sửa
                  </small>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password">
                  Mật khẩu {editingUser ? "(để trống nếu không muốn đổi)" : "*"}
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="form-input"
                  required={!editingUser}
                  placeholder={
                    editingUser
                      ? "Nhập mật khẩu mới (tùy chọn)"
                      : "Nhập mật khẩu"
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Giới tính</label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="address">Địa chỉ</label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="form-input"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              {formData.role === "Doctor" && (
                <>
                  <div className="form-group">
                    <label htmlFor="degree">Bằng cấp *</label>
                    <input
                      id="degree"
                      type="text"
                      value={formData.degree}
                      onChange={(e) =>
                        setFormData({ ...formData, degree: e.target.value })
                      }
                      className="form-input"
                      placeholder="VD: MD, PhD"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="specialty">Chuyên khoa *</label>
                    <input
                      id="specialty"
                      type="text"
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({ ...formData, specialty: e.target.value })
                      }
                      className="form-input"
                      placeholder="VD: Reproductive Medicine"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="workSchedule">Lịch làm việc *</label>
                    <textarea
                      id="workSchedule"
                      value={formData.workSchedule}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workSchedule: e.target.value,
                        })
                      }
                      className="form-input"
                      placeholder="Mỗi dòng một lịch làm việc&#10;VD: Monday 8:00-17:00&#10;Tuesday 8:00-17:00"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Mô tả *</label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="form-input"
                      placeholder="VD: Specialist in reproductive health with 10 years of experience"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="imageUrl">URL ảnh đại diện</label>
                    <input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      className="form-input"
                      placeholder="https://example.com/doctor-image.jpg"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={resetForm}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
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
        <div className="modal-overlay">
          <div className="modal confirmation-modal">
            <div className="modal-header">
              <h2>Xác nhận</h2>
            </div>
            <div className="modal-body">
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
                    Bạn có chắc chắn muốn <strong>kích hoạt</strong> tài khoản "
                    {confirmAction.user.userName}"?
                    <br />
                    <small style={{ color: "#666" }}>
                      Tài khoản sẽ được khôi phục và người dùng có thể đăng nhập
                      trở lại.
                    </small>
                  </>
                )}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmAction(null)}
              >
                Hủy
              </button>
              <button
                className={`btn ${
                  confirmAction.type === "block" ? "btn-danger" : "btn-primary"
                }`}
                onClick={() => {
                  handleToggleStatus(confirmAction.user);
                }}
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
  );
};

export default UserManagement;
