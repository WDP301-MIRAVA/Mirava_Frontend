import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./PaymentSuccess.css"; // Import your CSS styles
const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin từ query params
  const orderId = searchParams.get("orderId");
  const orderCode = searchParams.get("orderCode");
  const paymentStatus = searchParams.get("paymentStatus");
  const paidAt = searchParams.get("paidAt");

  useEffect(() => {
    if (!orderId || !orderCode) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      navigate("/");
      return;
    }
    setOrderInfo({
      orderId,
      orderCode,
      paymentStatus,
      paidAt,
    });
    setLoading(false);
    toast.success("Thanh toán thành công! Đơn hàng đã được tạo.");
  }, [orderId, orderCode, paymentStatus, paidAt, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {orderInfo && (
          <div className="order-success-card">
            <div className="order-success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#10B981"
                  strokeWidth="2"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="order-success-title">Thanh toán thành công!</h3>
            <p className="order-success-desc">
              Cảm ơn bạn đã sử dụng dịch vụ của Mirava.
              <br />
              Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
            <div className="order-info-list">
              <div className="order-info-row">
                <span className="order-info-label">Mã đơn hàng:</span>
                <span className="order-info-value">{orderInfo.orderCode}</span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Trạng thái thanh toán:</span>
                <span
                  className={`order-info-value status-${orderInfo.paymentStatus}`}
                >
                  {orderInfo.paymentStatus === "success"
                    ? "Đã thanh toán"
                    : orderInfo.paymentStatus}
                </span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Thời gian thanh toán:</span>
                <span className="order-info-value">
                  {orderInfo.paidAt
                    ? new Date(orderInfo.paidAt).toLocaleString("vi-VN")
                    : ""}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="order-success-actions">
          <button
            onClick={() => navigate("/services")}
            className="btn-order-success btn-primary"
          >
            Tiếp tục mua sắm
          </button>
          <button
            onClick={() => navigate("/searchresult")}
            className="btn-order-success btn-secondary"
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
