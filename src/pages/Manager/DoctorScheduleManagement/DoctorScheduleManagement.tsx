import React, { useState } from 'react';
import { Calendar, Search, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import './DoctorScheduleManagement.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  workingHours: string;
  status: 'active' | 'inactive';
  dateCreated: string;
}

interface ScheduleFormData {
  name: string;
  specialty: string;
  workingHours: string;
  status: 'active' | 'inactive';
}

const DoctorScheduleManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'BS. Nguyễn Văn An',
      specialty: 'Tim mạch',
      workingHours: 'Thứ 2-6: 8:00-12:00, 14:00-17:00',
      status: 'active',
      dateCreated: '2024-01-15'
    },
    {
      id: '2',
      name: 'BS. Trần Thị Bình',
      specialty: 'Nhi khoa',
      workingHours: 'Thứ 2,4,6: 8:00-12:00',
      status: 'active',
      dateCreated: '2024-01-16'
    },
    {
      id: '3',
      name: 'TS.BS. Lê Văn Cường',
      specialty: 'Thần kinh',
      workingHours: 'Thứ 3,5,7: 13:00-18:00',
      status: 'inactive',
      dateCreated: '2024-01-17'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    specialty: '',
    workingHours: '',
    status: 'active'
  });

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || 
                       (filterRole === 'doctor' && doctor.specialty !== 'Chuyên khoa') ||
                       (filterRole === 'specialist' && doctor.specialty === 'Chuyên khoa');
                       
    const matchesDate = !selectedDate || doctor.dateCreated === selectedDate;
    
    return matchesSearch && matchesRole && matchesDate;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDoctor) {
      setDoctors(doctors.map(doctor => 
        doctor.id === editingDoctor.id 
          ? { ...doctor, ...formData }
          : doctor
      ));
    } else {
      const newDoctor: Doctor = {
        id: Date.now().toString(),
        ...formData,
        dateCreated: new Date().toISOString().split('T')[0]
      };
      setDoctors([...doctors, newDoctor]);
    }
    
    handleCloseModal();
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      workingHours: doctor.workingHours,
      status: doctor.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch làm việc này?')) {
      setDoctors(doctors.filter(doctor => doctor.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setDoctors(doctors.map(doctor => 
      doctor.id === id 
        ? { ...doctor, status: doctor.status === 'active' ? 'inactive' : 'active' }
        : doctor
    ));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialty: '',
      workingHours: '',
      status: 'active'
    });
  };

  const handleAddNew = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialty: '',
      workingHours: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  return (
    <div className="schedule-management-container">
      <div className="schedule-card">
        <div className="card-header">
          <h1 className="card-title">Quản Lý Lịch Làm Việc Bác Sĩ</h1>
          <p className="card-subtitle">Quản lý và theo dõi lịch làm việc của đội ngũ bác sĩ</p>
        </div>

        <div className="search-filters-section">
          <div className="search-input-group">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bác sĩ hoặc chuyên khoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label">Vai trò:</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="doctor">Bác sĩ</option>
                <option value="specialist">Chuyên khoa</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Ngày:</label>
              <div className="date-input-group">
                <Calendar className="date-icon" size={18} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>

            <button 
              onClick={handleAddNew}
              className="add-button"
            >
              <Plus size={18} />
              Thêm Lịch Mới
            </button>
          </div>
        </div>

        <div className="results-section">
          {filteredDoctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>Không tìm thấy lịch làm việc</h3>
              <p>Thử điều chỉnh bộ lọc hoặc thêm lịch làm việc mới</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Tên Bác Sĩ</th>
                    <th>Chuyên Khoa</th>
                    <th>Giờ Làm Việc</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map(doctor => (
                    <tr key={doctor.id}>
                      <td className="doctor-name">{doctor.name}</td>
                      <td className="specialty">{doctor.specialty}</td>
                      <td className="working-hours">{doctor.workingHours}</td>
                      <td>
                        <span className={`status-badge ${doctor.status}`}>
                          {doctor.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="action-button edit"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(doctor.id)}
                          className={`action-button toggle ${doctor.status}`}
                          title={doctor.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                        >
                          {doctor.status === 'active' ? <X size={16} /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
                          className="action-button delete"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingDoctor ? 'Chỉnh Sửa Lịch Làm Việc' : 'Thêm Lịch Làm Việc Mới'}</h2>
              <button 
                onClick={handleCloseModal}
                className="close-button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Tên Bác Sĩ:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  placeholder="Nhập tên bác sĩ..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chuyên Khoa:</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  className="form-input"
                  placeholder="Nhập chuyên khoa..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Giờ Làm Việc:</label>
                <textarea
                  value={formData.workingHours}
                  onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
                  className="form-textarea"
                  placeholder="VD: Thứ 2-6: 8:00-12:00, 14:00-17:00"
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trạng Thái:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                  className="form-select"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm dừng</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="cancel-button"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="save-button"
                >
                  {editingDoctor ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorScheduleManagement;