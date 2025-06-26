import React, { useEffect, useState } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import './CheckoutPage.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Doctor {
  user: {
    userName: string;
  };
}

interface ServiceDetail {
  _id: string;
  name: string;
  price: number;
  salePrice: number; // percent
  shortDescription: string[];
  doctor: Doctor[];
}

const CheckoutPage: React.FC = () => {
 const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<ServiceDetail | null>(null);
    const navigate = useNavigate();
    
   const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    appointmentDate: '',
    timeSlot: '',
    doctor: '',
    notes: '',
  });
    const [selectedTime, setSelectedTime] = useState('');
const handlePlaceOrder = () => {
  if (!formData.fullName || !formData.phone || !formData.address || !formData.appointmentDate || !formData.timeSlot ) {
    alert('Vui lòng nhập đầy đủ thông tin');
    return;
  }

  navigate('/checkout/paymentConfirm', {
    state: {
      userInfo: formData,
      amount: calculateFinalPrice(service?.price || 0, service?.salePrice || 0),
      transferContent: 'PHUONGDONG10115',
      serviceName: service?.name,
      qrImageUrl: 'data:image/png;base64,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' 
    }
  });
  };
    useEffect(() => {
  const fetchService = async () => {
    console.log("🟢 ID lấy từ useParams:", serviceId);
    const res = await fetch(`https://mirava-f0rz.onrender.com/api/service/${serviceId}`);
    const data = await res.json();
    console.log("📦 Dữ liệu API trả về:", data);
    setService(data);
  };

  if (serviceId) fetchService();
}, [serviceId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + ' đ';

  const calculateFinalPrice = (price: number, salePercent: number) =>
    Math.round(price * (1 - salePercent / 100));

  return (
    <div>
      <Header />
      <div className="checkout-container">
        <form className="checkout-form">
          <h2>Thông tin thanh toán</h2>

          <label className="label">Họ và Tên <span className="required">*</span></label>
<input type="text" required onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />

          <label className="label">Số Điện Thoại <span className="required">*</span></label>
<input type="tel" required onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

          <label className="label">Email <span className="required">*</span></label>
<input type="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

          <label className="label">Địa Chỉ <span className="required">*</span></label>
<input type="text" required onChange={(e) => setFormData({ ...formData, address: e.target.value })} />

          <div className="appointment-section">
            <label className="label">Ngày khám <span className="required">*</span></label>
<input type="date" className="date-picker" required onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })} />

            <p className="label">Chọn khung giờ:</p>
            <div className="time-slots">
  {['07:00', '09:00', '11:00', '13:00', '15:00', '17:00'].map((time, idx) => (
    <button
      key={idx}
      type="button"
      className={`time-slot ${selectedTime === time ? 'active' : ''}`}
      onClick={() => {
        setSelectedTime(time);
        setFormData({ ...formData, timeSlot: time });
      }}
    >
      {time}
    </button>
  ))}
</div>
          </div>

          <label className="label">Chọn Bác sĩ</label>
          <select required>
            <option value="">Chọn bác sĩ điều trị</option>
            {service?.doctor?.map((doc, idx) => (
              <option key={idx} value={doc.user.userName}>
                {doc.user.userName}
              </option>
            ))}
          </select>

          <h2>Ghi Chú</h2>
<textarea onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
        </form>

        <div className="order-summary">
          <h2>Đơn hàng của bạn</h2>
          <div className="summary-box">
            <div className="summary-item">
              <strong>Sản phẩm</strong>
              <span>Tạm tính</span>
            </div>

            {service ? (
              <div className="summary-product">
                <p>{service.name} × 1</p>
                {service.shortDescription?.map((d, i) => (
                  <small key={i}>{d}</small>
                ))}
                <span className="price">
                  {formatPrice(calculateFinalPrice(service.price, service.salePrice))}
                </span>
              </div>
            ) : ( 
              <p>Đang tải dữ liệu đơn hàng...</p>
            )}

            {service && (
              <>
                <div className="summary-item">
                  <strong>Tạm tính</strong>
                  <span>{formatPrice(calculateFinalPrice(service.price, service.salePrice))}</span>
                </div>
                <div className="summary-item">
                  <strong>Tổng</strong>
                  <span className="total">
                    {formatPrice(calculateFinalPrice(service.price, service.salePrice))}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="payment-info">
            <p>
              <strong>Chuyển khoản ngân hàng (Quét mã QR)</strong> VietinBank
            </p>
            <p className="note">
              Chuyển khoản vào tài khoản Vietinbank của chúng tôi. Đơn hàng sẽ được xác nhận ngay sau khi chuyển khoản.
            </p>
          </div>

          <div className="order-submit">
            <label className="checkbox">
              <input type="checkbox" required />
              <strong>Tôi đã đọc và đồng ý với điều khoản và điều kiện của website *</strong>
            </label>
            <button className="place-order-button" onClick={handlePlaceOrder}>ĐẶT HÀNG</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
