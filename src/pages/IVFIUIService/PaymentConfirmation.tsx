import React from 'react';
import './PaymentConfirmation.css';
import { useLocation } from 'react-router-dom';

interface UserInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  appointmentDate: string;
  timeSlot: string;
  doctor: string;
  notes: string;
}



const PaymentConfirmation: React.FC = () => {
  const { state } = useLocation();
  const { userInfo, amount, transferContent, qrImageUrl } = state || {};
  return (
    <div className="payment-confirmation-container">
      <div className="left-panel">
        <h2>Mã QR chuyển khoản</h2>
        <img src={qrImageUrl} alt="QR Code" className="qr-code" />
        <div className="transfer-info">
          <p><strong>Số tiền:</strong> {amount.toLocaleString('vi-VN')} đ</p>
          <p><strong>Nội dung chuyển khoản:</strong> <span className="highlight">{transferContent}</span></p>
          <p><strong>Ngân hàng:</strong> VietinBank</p>
          <p><strong>Chủ tài khoản:</strong> BVĐK PHUONG DONG</p>
        </div>
      </div>

      <div className="right-panel">
        <h2>Thông tin thanh toán</h2>
        <div className="user-info">
          <p><strong>Họ và tên:</strong> {userInfo.fullName}</p>
          <p><strong>SĐT:</strong> {userInfo.phone}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Địa chỉ:</strong> {userInfo.address}</p>
          <p><strong>Ngày khám:</strong> {userInfo.appointmentDate}</p>
          <p><strong>Khung giờ:</strong> {userInfo.timeSlot}</p>
          <p><strong>Bác sĩ:</strong> {userInfo.doctor}</p>
          <p><strong>Ghi chú:</strong> {userInfo.notes || '(Không có)'}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
