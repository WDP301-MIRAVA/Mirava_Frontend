import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./PaymentSuccess.css";

interface OrderInfo {
  orderCode: string;
  totalAmount: number;
  status: string;
  paidAt: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get("orderId");
  const orderCode = searchParams.get("orderCode");

  useEffect(() => {
    const fetchOrderInfo = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `https://mirava-f0rz.onrender.com/api/vnpay/payment-status/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOrderInfo(data.data);
        }
      } catch (error) {
        console.error("Error fetching order info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="payment-loading">
          <div className="loading-spinner"></div>
          <p>Đang xác nhận thanh toán...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="payment-success-container">
        <div className="success-card">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2" />
              <path
                d="m9 12 2 2 4-4"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="success-title">Thanh toán thành công!</h1>
          <p className="success-message">
            Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của Mirava. Chúng tôi sẽ
            liên hệ với bạn trong thời gian sớm nhất.
          </p>

          {orderInfo && (
            <div className="order-summary">
              <h3>Thông tin đơn hàng</h3>
              <div className="order-details">
                <div className="detail-row">
                  <span>Mã đơn hàng:</span>
                  <strong>{orderInfo.orderCode}</strong>
                </div>
                <div className="detail-row">
                  <span>Tổng tiền:</span>
                  <strong className="amount">
                    {formatPrice(orderInfo.totalAmount)}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Thời gian thanh toán:</span>
                  <span>
                    {new Date(orderInfo.paidAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Trạng thái:</span>
                  <span className="status-success">Đã thanh toán</span>
                </div>
              </div>

              <div className="service-list">
                <h4>Dịch vụ đã đặt:</h4>
                {orderInfo.items.map((item, index) => (
                  <div key={index} className="service-item">
                    <span>{item.name}</span>
                    <span>{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <Link to="/appointment" className="btn-primary">
              Đặt lịch hẹn
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

export default PaymentSuccess;
