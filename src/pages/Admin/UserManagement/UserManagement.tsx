import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Ban, CheckCircle, X } from 'lucide-react';
import './UserManagement.css';

interface User {
  id: string;
  userName: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Doctor' | 'Admin';
  specialty?: string;
  workSchedule?: string;
  status: 'active' | 'blocked';
  createdDate: Date;
}

interface UserFormData {
  userName: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Doctor' | 'Admin';
  specialty: string;
  workSchedule: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'userName' | 'role' | 'createdDate'>('userName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<{type: 'delete' | 'block' | 'activate', user: User} | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    userName: '',
    email: '',
    phone: '',
    role: 'Customer',
    specialty: '',
    workSchedule: ''
  });

  // Mock data initialization
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        userName: 'Nguyễn Văn An',
        email: 'an.nguyen@email.com',
        phone: '0901234567',
        role: 'Customer',
        status: 'active',
        createdDate: new Date('2024-01-15')
      },
      {
        id: '2',
        userName: 'Bác sĩ Trần Thị Bình',
        email: 'binh.tran@hospital.com',
        phone: '0902345678',
        role: 'Doctor',
        specialty: 'Tim mạch',
        workSchedule: 'Thứ 2-6, 8:00-17:00',
        status: 'active',
        createdDate: new Date('2024-02-01')
      },
      {
        id: '3',
        userName: 'Lê Văn Cường',
        email: 'cuong.le@admin.com',
        phone: '0903456789',
        role: 'Admin',
        status: 'active',
        createdDate: new Date('2024-01-10')
      },
      {
        id: '4',
        userName: 'Bác sĩ Phạm Thị Dung',
        email: 'dung.pham@hospital.com',
        phone: '0904567890',
        role: 'Doctor',
        specialty: 'Nhi khoa',
        workSchedule: 'Thứ 3-7, 9:00-18:00',
        status: 'blocked',
        createdDate: new Date('2024-03-01')
      }
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  // Search and filter
  useEffect(() => {
    let filtered = users.filter(user =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
    );

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'createdDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortField, sortOrder]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddUser = () => {
    if (!formData.userName || !formData.email || !formData.phone) {
      showMessage('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      userName: formData.userName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      specialty: formData.role === 'Doctor' ? formData.specialty : undefined,
      workSchedule: formData.role === 'Doctor' ? formData.workSchedule : undefined,
      status: 'active',
      createdDate: new Date()
    };

    setUsers([...users, newUser]);
    setShowAddForm(false);
    setFormData({
      userName: '',
      email: '',
      phone: '',
      role: 'Customer',
      specialty: '',
      workSchedule: ''
    });
    showMessage('success', 'Thêm người dùng thành công');
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      userName: user.userName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialty: user.specialty || '',
      workSchedule: user.workSchedule || ''
    });
    setShowAddForm(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !formData.userName || !formData.email || !formData.phone) {
      showMessage('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const updatedUsers = users.map(user =>
      user.id === editingUser.id
        ? {
            ...user,
            userName: formData.userName,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            specialty: formData.role === 'Doctor' ? formData.specialty : undefined,
            workSchedule: formData.role === 'Doctor' ? formData.workSchedule : undefined,
          }
        : user
    );

    setUsers(updatedUsers);
    setShowAddForm(false);
    setEditingUser(null);
    setFormData({
      userName: '',
      email: '',
      phone: '',
      role: 'Customer',
      specialty: '',
      workSchedule: ''
    });
    showMessage('success', 'Cập nhật người dùng thành công');
  };

  const handleDeleteUser = (user: User) => {
    setUsers(users.filter(u => u.id !== user.id));
    setConfirmAction(null);
    showMessage('success', 'Xóa người dùng thành công');
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    const updatedUsers = users.map(u =>
      u.id === user.id ? { ...u, status: newStatus } : u
    );
    setUsers(updatedUsers);
    setConfirmAction(null);
    showMessage('success', `${newStatus === 'active' ? 'Kích hoạt' : 'Khóa'} tài khoản thành công`);
  };

  const resetForm = () => {
    setFormData({
      userName: '',
      email: '',
      phone: '',
      role: 'Customer',
      specialty: '',
      workSchedule: ''
    });
    setEditingUser(null);
    setShowAddForm(false);
  };

  return (
    <div className="user-management">
      {/* Message Toast */}
      {message && (
        <div className={`message-toast ${message.type}`}>
          {message.text}
        </div>
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
                const [field, order] = e.target.value.split('-');
                setSortField(field as 'userName' | 'role' | 'createdDate');
                setSortOrder(order as 'asc' | 'desc');
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
                  <th>Chuyên khoa</th>
                  <th>Lịch làm việc</th>
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
                        {user.role}
                      </span>
                    </td>
                    <td>{user.specialty || '-'}</td>
                    <td>{user.workSchedule || '-'}</td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
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
                          className="btn-action delete"
                          onClick={() => setConfirmAction({type: 'delete', user})}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className={`btn-action ${user.status === 'active' ? 'block' : 'activate'}`}
                          onClick={() => setConfirmAction({
                            type: user.status === 'active' ? 'block' : 'activate',
                            user
                          })}
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                        >
                          {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
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

      {/* Add/Edit User Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
              <button className="btn-close" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="userName">Tên *</label>
                <input
                  id="userName"
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Vai trò *</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'Customer' | 'Doctor' | 'Admin'})}
                  className="form-select"
                  required
                >
                  <option value="Customer">Customer</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              {formData.role === 'Doctor' && (
                <>
                  <div className="form-group">
                    <label htmlFor="specialty">Chuyên khoa</label>
                    <input
                      id="specialty"
                      type="text"
                      value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="workSchedule">Lịch làm việc</label>
                    <input
                      id="workSchedule"
                      type="text"
                      value={formData.workSchedule}
                      onChange={(e) => setFormData({...formData, workSchedule: e.target.value})}
                      className="form-input"
                      placeholder="VD: Thứ 2-6, 8:00-17:00"
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
              >
                {editingUser ? 'Cập nhật' : 'Thêm'}
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
                {confirmAction.type === 'delete' && `Bạn có chắc chắn muốn xóa người dùng "${confirmAction.user.userName}"?`}
                {confirmAction.type === 'block' && `Bạn có chắc chắn muốn khóa tài khoản "${confirmAction.user.userName}"?`}
                {confirmAction.type === 'activate' && `Bạn có chắc chắn muốn kích hoạt tài khoản "${confirmAction.user.userName}"?`}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>
                Hủy
              </button>
              <button
                className={`btn ${confirmAction.type === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => {
                  if (confirmAction.type === 'delete') {
                    handleDeleteUser(confirmAction.user);
                  } else {
                    handleToggleStatus(confirmAction.user);
                  }
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;