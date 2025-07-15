import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./PaymentSuccess.css";

interface OrderInfo {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  patientCode: string;
  paymentStatus: string | null;
  paidAt: string | null;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ THÊM REF ĐỂ TRÁNH CHẠY LẠI NHIỀU LẦN
  const processedRef = useRef(false);

  const orderId = searchParams.get("orderId");
  const orderCode = searchParams.get("orderCode");
  const paymentStatus = searchParams.get("paymentStatus");
  const paidAt = searchParams.get("paidAt");

  useEffect(() => {
    console.log("PaymentSuccess mounted, location.search:", location.search);

    // Tránh chạy lại nếu đã xử lý
    if (processedRef.current) {
      console.log("⚠️ Đã xử lý rồi, bỏ qua...");
      return;
    }

    const processPaymentSuccess = async () => {
      try {
        processedRef.current = true; // Đánh dấu đã xử lý

        const urlParams = new URLSearchParams(location.search);

        // ✅ XỬ LÝ CẢ 2 FORMAT: VNPay gốc và custom
        let tempOrderId = urlParams.get("tempOrderId");
        let status = urlParams.get("status");
        let amount = urlParams.get("amount");

        // Nếu không có custom params, lấy từ VNPay params
        if (!tempOrderId || !status || !amount) {
          console.log("🔍 Không tìm thấy custom params, đọc từ VNPay params");

          const vnp_TxnRef = urlParams.get("vnp_TxnRef");
          const vnp_ResponseCode = urlParams.get("vnp_ResponseCode");
          const vnp_Amount = urlParams.get("vnp_Amount");

          console.log("🔍 VNPay params:", {
            vnp_TxnRef,
            vnp_ResponseCode,
            vnp_Amount,
          });

          // Chuyển đổi VNPay params sang custom format
          if (vnp_TxnRef) {
            tempOrderId = vnp_TxnRef;
          }

          if (vnp_ResponseCode) {
            status = vnp_ResponseCode === "00" ? "success" : "failed";
          }

          if (vnp_Amount) {
            // VNPay amount có đơn vị VND * 100, cần chia cho 100
            amount = (parseInt(vnp_Amount) / 100).toString();
          }
        }

        console.log("🔍 Final URL Params:", { tempOrderId, status, amount });

        if (tempOrderId && status === "success") {
          await handleVNPaySuccess(tempOrderId, amount);
        } else if (status === "failed") {
          toast.error("Thanh toán thất bại!");
          navigate("/payment-failed");
        } else {
          handleRegularPayment();
        }
      } catch (error) {
        console.error("❌ Lỗi xử lý thanh toán:", error);
        toast.error("Có lỗi xảy ra khi xử lý thanh toán!");
        navigate("/");
      }
    };

    processPaymentSuccess();
  }, [location.search, navigate]);

  // ✅ KIỂM TRA ĐƠN HÀNG TỒN TẠI
  const checkOrderExists = async (tempOrderId: string) => {
    try {
      console.log("🔍 Kiểm tra đơn hàng tồn tại:", tempOrderId);

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/orders/check-exists/${tempOrderId}`
      );

      const result = await response.json();

      if (result.success && result.exists) {
        console.log("✅ Đơn hàng đã tồn tại:", result.data);

        setOrderInfo({
          orderId: result.data.order.id,
          orderCode: result.data.order.orderCode,
          paymentStatus: result.data.order.paymentStatus || "success",
          totalAmount: result.data.order.totalAmount,
          patientCode: result.data.customer?.patientCode || "",
          paidAt: result.data.order.paidAt || new Date().toISOString(),
        });

        localStorage.removeItem("vnpayOrderData");
        localStorage.removeItem("vnpayTestData");
        localStorage.removeItem("vnpayUnifiedData");

        toast.success("Đơn hàng đã được xử lý!");
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Lỗi kiểm tra đơn hàng:", error);
      return false;
    }
  };

  const handleVNPaySuccess = async (
    tempOrderId: string,
    amount: string | null
  ) => {
    try {
      setLoading(true);
      console.log("💳 Bắt đầu xử lý thanh toán VNPay thành công");
      console.log("🔍 TempOrderId từ URL:", tempOrderId);

      // Kiểm tra đơn hàng đã tồn tại trước
      const orderExists = await checkOrderExists(tempOrderId);
      if (orderExists) {
        return;
      }

      // Lấy thông tin đơn hàng từ localStorage
      const storedOrderData = localStorage.getItem("vnpayOrderData");

      if (!storedOrderData) {
        console.error("❌ Không tìm thấy dữ liệu đơn hàng trong localStorage");

        // Kiểm tra các loại dữ liệu khác
        const testPackageData = localStorage.getItem("vnpayTestData");
        if (testPackageData) {
          console.log("🔍 Tìm thấy dữ liệu test package:", testPackageData);
          await handleTestPackageVNPaySuccess(tempOrderId, amount);
          return;
        }

        const unifiedData = localStorage.getItem("vnpayUnifiedData");
        if (unifiedData) {
          console.log("🔍 Tìm thấy dữ liệu unified checkout:", unifiedData);
          await handleUnifiedVNPaySuccess(tempOrderId, amount);
          return;
        }

        if (tempOrderId.match(/^[0-9a-fA-F]{24}$/)) {
          console.log(
            "🔍 TempOrderId có vẻ là MongoDB ObjectID, thử lấy từ API"
          );
          await handleObjectIdVNPaySuccess(tempOrderId, amount);
          return;
        }

        // ✅ FALLBACK: Tạo orderData cơ bản từ tempOrderId format TEMP_
        if (tempOrderId.startsWith("TEMP_")) {
          console.log("🔍 TempOrderId là format TEMP_, tạo orderData cơ bản");

          const basicOrderData = {
            items: [{ serviceId: "unknown", quantity: 1 }],
            paymentMethod: "VNPay",
            note: `Thanh toán VNPay - ${tempOrderId}`,
            customerInfo: {
              userName: "Khách hàng",
              email: "unknown@example.com",
              phone: "0000000000",
              address: "Chưa cập nhật",
              gender: "Other",
            },
            totalAmount: amount ? parseInt(amount) : 0,
            orderItems: [],
          };

          console.log("📦 Tạo orderData cơ bản:", basicOrderData);
          await createOrderAfterVNPaySuccess(basicOrderData, tempOrderId);
          return;
        }

        toast.error("Không tìm thấy thông tin đơn hàng!");
        navigate("/");
        return;
      }

      const { orderData } = JSON.parse(storedOrderData);
      console.log("📦 Dữ liệu đơn hàng từ localStorage:", orderData);

      await createOrderAfterVNPaySuccess(orderData, tempOrderId);
    } catch (error: any) {
      console.error("❌ Lỗi xử lý VNPay success:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xử lý thanh toán!");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý cho trường hợp ObjectID
  const handleObjectIdVNPaySuccess = async (
    orderId: string,
    amount: string | null
  ) => {
    try {
      console.log("🔍 Xử lý ObjectID VNPay success:", orderId);

      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/orders/${orderId}`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy thông tin đơn hàng");
      }

      const result = await response.json();

      if (result.success) {
        setOrderInfo({
          orderId: result.data._id,
          orderCode: result.data.orderCode,
          paymentStatus: "success",
          totalAmount: result.data.totalAmount,
          patientCode: result.data.user?.patientCode || "",
          paidAt: new Date().toISOString(),
        });

        toast.success("Thanh toán thành công!");
      } else {
        throw new Error("Không thể lấy thông tin đơn hàng");
      }
    } catch (error: any) {
      console.error("❌ Lỗi xử lý ObjectID VNPay:", error);
      toast.error(error.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý cho Test Package
  const handleTestPackageVNPaySuccess = async (
    tempOrderId: string,
    amount: string | null
  ) => {
    try {
      console.log("🔍 Xử lý Test Package VNPay success:", tempOrderId);

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/test-registrations/confirm-vnpay",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: tempOrderId,
            paymentStatus: "success",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setOrderInfo({
          orderId: result.data.order.id,
          orderCode: result.data.order.orderCode,
          paymentStatus: "success",
          totalAmount: result.data.order.totalAmount,
          patientCode: result.data.customer?.patientCode || "",
          paidAt: new Date().toISOString(),
        });

        localStorage.removeItem("vnpayTestData");
        toast.success("Thanh toán thành công!");
      } else {
        throw new Error(result.message || "Có lỗi xảy ra!");
      }
    } catch (error: any) {
      console.error("❌ Lỗi xử lý Test Package VNPay:", error);
      toast.error(error.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleUnifiedVNPaySuccess = async (
    tempOrderId: string,
    amount: string | null
  ) => {
    try {
      console.log("🔍 Xử lý Unified Checkout VNPay success:", tempOrderId);

      const unifiedData = localStorage.getItem("vnpayUnifiedData");
      if (!unifiedData) {
        throw new Error("Không tìm thấy dữ liệu unified checkout");
      }

      const parsedData = JSON.parse(unifiedData);
      console.log("📦 Dữ liệu unified checkout:", parsedData);

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/unified-orders/confirm-vnpay",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tempOrderId,
            paymentStatus: "success",
            orderData: parsedData,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setOrderInfo({
          orderId: result.data.order?.id || tempOrderId,
          orderCode: result.data.order?.orderCode || `UNI${Date.now()}`,
          paymentStatus: "success",
          totalAmount: result.data.order?.totalAmount || 0,
          patientCode: result.data.customer?.patientCode || "",
          paidAt: new Date().toISOString(),
        });

        localStorage.removeItem("vnpayUnifiedData");
        toast.success("Thanh toán thành công!");
      } else {
        throw new Error(result.message || "Có lỗi xảy ra!");
      }
    } catch (error: any) {
      console.error("❌ Lỗi xử lý Unified VNPay:", error);
      toast.error(error.message || "Có lỗi xảy ra!");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const createOrderAfterVNPaySuccess = async (
    orderData: any,
    tempOrderId: string
  ) => {
    try {
      console.log("🚀 Tạo đơn hàng sau VNPay với data:", {
        orderData,
        tempOrderId,
      });

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/orders/create-after-vnpay",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderData,
            tempOrderId,
          }),
        }
      );

      const result = await response.json();

      console.log("📋 Response từ API create-after-vnpay:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Có lỗi xảy ra khi tạo đơn hàng!");
      }

      setOrderInfo({
        orderId: result.data.order.id,
        orderCode: result.data.order.orderCode,
        paymentStatus: result.data.order.paymentStatus || "success",
        totalAmount: result.data.order.totalAmount,
        patientCode: result.data.customer?.patientCode || "",
        paidAt: result.data.order.paidAt || new Date().toISOString(),
      });

      // ✅ XÓA TẤT CẢ DỮ LIỆU LOCALSTORAGE
      localStorage.removeItem("vnpayOrderData");
      localStorage.removeItem("vnpayTestData");
      localStorage.removeItem("vnpayUnifiedData");

      console.log("✅ Tạo đơn hàng thành công:", result.data);
      toast.success("Thanh toán thành công! Đơn hàng đã được tạo.");
    } catch (error: any) {
      console.error("❌ Lỗi tạo đơn hàng sau VNPay:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleRegularPayment = () => {
    try {
      const state = location.state;

      if (state && state.orderInfo) {
        console.log("✅ Tìm thấy orderInfo trong state:", state.orderInfo);

        // ✅ XỬ LÝ CẢ SINGLE ORDER VÀ MULTIPLE ORDERS
        if (Array.isArray(state.orderInfo)) {
          // Multiple orders từ unified checkout
          const firstOrder = state.orderInfo[0];
          setOrderInfo(firstOrder);
        } else {
          // Single order
          setOrderInfo(state.orderInfo);
        }

        setLoading(false);
        toast.success("Thanh toán thành công!");
        return;
      }

      // Kiểm tra thông tin từ query params
      const orderId = searchParams.get("orderId");
      const orderCode = searchParams.get("orderCode");
      const paymentStatus = searchParams.get("paymentStatus");
      const totalAmount = searchParams.get("totalAmount");
      const patientCode = searchParams.get("patientCode");
      const paidAt = searchParams.get("paidAt");

      if (orderId && orderCode) {
        console.log("✅ Tìm thấy thông tin từ query params");
        setOrderInfo({
          orderId,
          orderCode,
          paymentStatus: paymentStatus || "success",
          totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
          patientCode: patientCode || "",
          paidAt: paidAt || new Date().toISOString(),
        });
        setLoading(false);
        toast.success("Thanh toán thành công!");
        return;
      }

      console.error("❌ Thiếu thông tin thanh toán!");
      console.error("❌ State:", state);
      console.error("❌ Query params:", {
        orderId,
        orderCode,
        paymentStatus,
        totalAmount,
        patientCode,
        paidAt,
      });

      toast.error("Thiếu thông tin thanh toán!");
      navigate("/");
    } catch (error) {
      console.error("❌ Lỗi xử lý thanh toán thường:", error);
      navigate("/");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-container">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg text-gray-600">Đang xử lý thanh toán...</p>
        </div>
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
              {orderInfo.totalAmount > 0 && (
                <div className="order-info-row">
                  <span className="order-info-label">Tổng tiền:</span>
                  <span className="order-info-value">
                    {orderInfo.totalAmount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              )}
              {orderInfo.patientCode && (
                <div className="order-info-row">
                  <span className="order-info-label">Mã bệnh nhân:</span>
                  <span className="order-info-value">
                    {orderInfo.patientCode}
                  </span>
                </div>
              )}
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
                  {new Date(orderInfo.paidAt).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="order-success-actions">
          <button
            onClick={() => navigate("/")}
            className="btn-order-success btn-primary"
          >
            Về trang chủ
          </button>
          <button
            onClick={() => navigate("/services")}
            className="btn-order-success btn-secondary"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
