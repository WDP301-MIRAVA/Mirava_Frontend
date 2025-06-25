import React from 'react';
import './CheckoutPage.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
const CheckoutPage: React.FC = () => {
 

  return (
    <div>
    <Header />
    <div className="checkout-container">
      <form className="checkout-form">
        <h2>Thông tin thanh toán</h2>
          <label className="label" htmlFor="name">Họ và Tên <span className="required">*</span></label>

        <input type="text"  required />
          <label className="label" htmlFor="name">Số Điện Thoại <span className="required">*</span></label>

        <input type="tel" required />
          <label className="label" htmlFor="name">Email <span className="required">*</span></label>

        <input type="email"  />
          <label className="label" htmlFor="name">Địa Chỉ <span className="required">*</span></label>

        <input type="text"  required />
<div className="appointment-section">
  <label htmlFor="date" className="label">
    Ngày khám<span className="required">*</span>
  </label>
  <input type="date" id="date" className="date-picker" required />

  <p className="label">Chọn khung giờ:</p>
  <div className="time-slots">
    {[
      '07:00', '09:00', '11:00', '13:00', '15:00', '17:00'
    ].map((time, index) => (
      <button key={index} type="button" className="time-slot">
        {time}
      </button>
    ))}
  </div>
</div>
  <label className="label" htmlFor="name">Chọn Bác sĩ </label>

         <select required>
            <option value="">Chọn bác sĩ điều trị</option>
             <option value="bs1">BS. Nguyễn Văn A</option>  
            <option value="bs2">BS. Trần Thị B</option>
            <option value="bs3">BS. Lê Quốc C</option>
        </select>


        <h2>Ghi Chú</h2>
        <textarea
          placeholder="Các Thông Tin Khác"
        />
      </form>

      <div className="order-summary">
        <h2>Đơn hàng của bạn</h2>
        <div className="summary-box">
          <div className="summary-item">
            <strong>Sản phẩm</strong>
            <span>Tạm tính</span>
          </div>
          <div className="summary-product">
            <p>Gói chăm sóc nghỉ dưỡng sau sinh STANDARD × 1</p>
            <small>Chọn gói: Cho 1 bé</small><br />
            <small>Thời gian: 3 ngày</small><br />
            <small>Tháng tuổi: Từ 1-2M</small>
            <span className="price">12.330.000 đ</span>
          </div>
          <div className="summary-item">
            <strong>Tạm tính</strong>
            <span>12.330.000 đ</span>
          </div>
          <div className="summary-item">
            <strong>Tổng</strong>
            <span className="total">12.330.000 đ</span>
          </div>
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
  <button className="place-order-button">ĐẶT HÀNG</button>
</div>
      </div>
     
    </div>
    <Footer />
    </div>
  );
};

export default CheckoutPage;
