import React, { useState } from 'react';
import './appointmentForm.css';
import Header from "../../components/Header/index";
import Footer from "../../components/Footer/index";

interface FormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
  specialty: string;
  doctor: string;
  requestContent: string;
}

const AppointmentPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    address: '',
    specialty: '',
    doctor: '',
    requestContent: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const specialties = [
    { value: '', label: 'Chọn chuyên khoa' },
    { value: 'ivf', label: 'IVF - Thụ tinh trong ống nghiệm' },
    { value: 'iui', label: 'IUI - Thụ tinh nhân tạo' },
    { value: 'general', label: 'Khám tổng quát' },
    { value: 'fertility-consultation', label: 'Tư vấn hiếm muộn' },
    { value: 'hormone-treatment', label: 'Điều trị hormone' },
    { value: 'genetic-testing', label: 'Xét nghiệm di truyền' }
  ];

  const doctors = [
    { value: '', label: 'Chọn bác sĩ' },
    { value: 'dr-nguyen-thi-lan', label: 'TS.BS Nguyễn Thị Lan' },
    { value: 'dr-tran-van-minh', label: 'PGS.TS Trần Văn Minh' },
    { value: 'dr-le-thi-hong', label: 'BS.CKI Lê Thị Hồng' },
    { value: 'dr-pham-duc-nam', label: 'BS.CKII Phạm Đức Nam' },
    { value: 'dr-vo-thi-mai', label: 'TS.BS Võ Thị Mai' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    }

    if (!formData.gender) {
      newErrors.gender = 'Vui lòng chọn giới tính';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.specialty) {
      newErrors.specialty = 'Vui lòng chọn chuyên khoa';
    }

    if (!formData.doctor) {
      newErrors.doctor = 'Vui lòng chọn bác sĩ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      alert('Đặt lịch khám thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.');
      console.log('Form submitted:', formData);
      
      // Reset form after successful submission
      setFormData({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        email: '',
        address: '',
        specialty: '',
        doctor: '',
        requestContent: ''
      });
    }
  };

  return (
    <>
    <Header />
    <div className="intro-page">
      <div className="intro-container">
        <div className="intro-header">
          <h1 className="intro-title">Đặt lịch khám dịch vụ</h1>
          <p className="intro-subtitle">
            Vui lòng điền đầy đủ thông tin để chúng tôi hỗ trợ bạn nhanh chóng và chính xác nhất.
          </p>
        </div>

        <form className="intro-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Họ và tên <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="Nhập họ và tên đầy đủ"
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth" className="form-label">
                Ngày sinh <span className="required">*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
              />
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Giới tính <span className="required">*</span>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="nam"
                  checked={formData.gender === 'nam'}
                  onChange={handleInputChange}
                  className="radio-input"
                />
                <span className="radio-custom"></span>
                Nam
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="nu"
                  checked={formData.gender === 'nu'}
                  onChange={handleInputChange}
                  className="radio-input"
                />
                <span className="radio-custom"></span>
                Nữ
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="khac"
                  checked={formData.gender === 'khac'}
                  onChange={handleInputChange}
                  className="radio-input"
                />
                <span className="radio-custom"></span>
                Khác
              </label>
            </div>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                Số điện thoại <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                placeholder="0123 456 789"
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="example@email.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Địa chỉ <span className="required">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`form-input ${errors.address ? 'error' : ''}`}
              placeholder="Nhập địa chỉ đầy đủ"
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="specialty" className="form-label">
                Chuyên khoa <span className="required">*</span>
              </label>
              <select
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                className={`form-select ${errors.specialty ? 'error' : ''}`}
              >
                {specialties.map(specialty => (
                  <option key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </option>
                ))}
              </select>
              {errors.specialty && <span className="error-message">{errors.specialty}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="doctor" className="form-label">
                Chọn bác sĩ <span className="required">*</span>
              </label>
              <select
                id="doctor"
                name="doctor"
                value={formData.doctor}
                onChange={handleInputChange}
                className={`form-select ${errors.doctor ? 'error' : ''}`}
              >
                {doctors.map(doctor => (
                  <option key={doctor.value} value={doctor.value}>
                    {doctor.label}
                  </option>
                ))}
              </select>
              {errors.doctor && <span className="error-message">{errors.doctor}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="requestContent" className="form-label">
              Nội dung yêu cầu
            </label>
            <textarea
              id="requestContent"
              name="requestContent"
              value={formData.requestContent}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Nhập nội dung yêu cầu hoặc ghi chú đặc biệt (nếu có)"
              rows={4}
            />
          </div>

          <button type="submit" className="submit-button">
            Đặt lịch khám
          </button>
        </form>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default AppointmentPage;