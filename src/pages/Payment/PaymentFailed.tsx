import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./PaymentFailed.css";

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const orderId = searchParams.get("orderId");

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "payment_failed":
        return "Thanh toán không thành công. Vui lòng thử lại.";
      case "order_not_found":
        return "Không tìm thấy thông tin đơn hàng.";
      case "invalid_signature":
        return "Thông tin thanh toán không hợp lệ.";
      case "server_error":
        return "Có lỗi xảy ra từ phía hệ thống.";
      default:
        return "Đã có lỗi xảy ra trong quá trình thanh toán.";
    }
  };

  return (
    <div>
      <Header />
      <div className="payment-failed-container">
        <div className="failed-card">
          <div className="failed-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
              <path
                d="m15 9-6 6"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m9 9 6 6"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="failed-title">Thanh toán thất bại!</h1>
          <p className="failed-message">{getErrorMessage(error)}</p>

          {orderId && (
            <div className="order-info">
              <p>
                Mã đơn hàng: <strong>{orderId}</strong>
              </p>
            </div>
          )}

          <div className="action-buttons">
            <Link to="/services" className="btn-primary">
              Thử lại
            </Link>
            <Link to="/home" className="btn-secondary">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentFailed;
