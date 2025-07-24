import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  Home,
  ShoppingBag,
  Clock,
  CreditCard,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import "./PaymentSuccess.css";

interface OrderInfo {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  patientCode: string;
  paymentStatus: string | null;
  paidAt: string | null;
  customerInfo?: {
    userName: string;
    email: string;
    phone: string;
    address: string;
  };
  services?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface OrderData {
  items: Array<{ serviceId: string; quantity: number }>;
  paymentMethod: string;
  note: string;
  customerInfo: {
    userName: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
  };
  totalAmount: number;
  orderItems: unknown[];
}

interface APIResponse {
  success: boolean;
  message?: string;
  data?: {
    order: {
      id: string;
      orderCode: string;
      paymentStatus?: string;
      totalAmount: number;
      paidAt?: string;
      customerInfo?: {
        userName: string;
        email: string;
        phone: string;
        address: string;
      };
    };
    customer?: {
      patientCode?: string;
    };
  };
}

interface CheckExistsResponse {
  success: boolean;
  exists: boolean;
  data?: {
    order: {
      id: string;
      orderCode: string;
      paymentStatus?: string;
      totalAmount: number;
      paidAt?: string;
      customerInfo?: {
        userName: string;
        email: string;
        phone: string;
        address: string;
      };
    };
    customer?: {
      patientCode?: string;
    };
  };
}

interface ObjectIdResponse {
  success: boolean;
  data?: {
    _id: string;
    orderCode: string;
    totalAmount: number;
    user?: {
      patientCode?: string;
    };
    customerInfo?: {
      userName: string;
      email: string;
      phone: string;
      address: string;
    };
    paidAt?: string;
    paymentStatus?: string;
  };
}

interface UnifiedResponse {
  success: boolean;
  message?: string;
  data?: {
    order?: {
      id?: string;
      orderCode?: string;
      totalAmount?: number;
      customerInfo?: {
        userName: string;
        email: string;
        phone: string;
        address: string;
      };
      paidAt?: string;
      paymentStatus?: string;
    };
    customer?: {
      patientCode?: string;
    };
  };
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const processPaymentSuccess = async (): Promise<void> => {
      try {
        processedRef.current = true;

        const urlParams = new URLSearchParams(location.search);

        let tempOrderId = urlParams.get("tempOrderId");
        let status = urlParams.get("status");
        let amount = urlParams.get("amount");

        if (!tempOrderId || !status || !amount) {
          const vnp_TxnRef = urlParams.get("vnp_TxnRef");
          const vnp_ResponseCode = urlParams.get("vnp_ResponseCode");
          const vnp_Amount = urlParams.get("vnp_Amount");

          if (vnp_TxnRef) tempOrderId = vnp_TxnRef;
          if (vnp_ResponseCode)
            status = vnp_ResponseCode === "00" ? "success" : "failed";
          if (vnp_Amount) amount = (parseInt(vnp_Amount) / 100).toString();
        }

        if (tempOrderId && status === "success") {
          await handleVNPaySuccess(tempOrderId, amount);
        } else if (status === "failed") {
          toast.error("Thanh toán thất bại!");
          navigate("/payment-failed");
        } else {
          handleRegularPayment();
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xử lý thanh toán!");
        navigate("/");
      }
    };

    processPaymentSuccess();
  }, [location.search, navigate]);

  // Kiểm tra đơn hàng tồn tại
  const checkOrderExists = async (tempOrderId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/orders/check-exists/${tempOrderId}`
      );
      const result: CheckExistsResponse = await response.json();

      if (result.success && result.exists && result.data) {
        setOrderInfo({
          orderId: result.data.order.id,
          orderCode: result.data.order.orderCode,
          paymentStatus: result.data.order.paymentStatus || "success",
          totalAmount: result.data.order.totalAmount,
          patientCode: result.data.customer?.patientCode || "",
          paidAt: result.data.order.paidAt || new Date().toISOString(),
          customerInfo: result.data.order.customerInfo,
        });
        localStorage.removeItem("vnpayOrderData");
        localStorage.removeItem("vnpayTestData");
        localStorage.removeItem("vnpayUnifiedData");
        toast.success("Đơn hàng đã được xử lý!");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Xử lý VNPay thành công
  const handleVNPaySuccess = async (
    tempOrderId: string,
    amount: string | null
  ): Promise<void> => {
    try {
      setLoading(true);
      const orderExists = await checkOrderExists(tempOrderId);
      if (orderExists) return;

      const storedOrderData = localStorage.getItem("vnpayOrderData");

      if (!storedOrderData) {
        const testPackageData = localStorage.getItem("vnpayTestData");
        if (testPackageData) {
          await handleTestPackageVNPaySuccess(tempOrderId);
          return;
        }
        const unifiedData = localStorage.getItem("vnpayUnifiedData");
        if (unifiedData) {
          await handleUnifiedVNPaySuccess(tempOrderId);
          return;
        }
        if (tempOrderId.match(/^[0-9a-fA-F]{24}$/)) {
          await handleObjectIdVNPaySuccess(tempOrderId);
          return;
        }
        if (tempOrderId.startsWith("TEMP_")) {
          const basicOrderData: OrderData = {
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
          await createOrderAfterVNPaySuccess(basicOrderData, tempOrderId);
          return;
        }
        toast.error("Không tìm thấy thông tin đơn hàng!");
        navigate("/");
        return;
      }

      const { orderData }: { orderData: OrderData } =
        JSON.parse(storedOrderData);
      await createOrderAfterVNPaySuccess(orderData, tempOrderId);
    } catch {
      toast.error("Có lỗi xảy ra khi xử lý thanh toán!");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý ObjectId
  const handleObjectIdVNPaySuccess = async (orderId: string): Promise<void> => {
    try {
      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/orders/${orderId}`
      );
      if (!response.ok) throw new Error("Không thể lấy thông tin đơn hàng");
      const result: ObjectIdResponse = await response.json();
      if (result.success && result.data) {
        setOrderInfo({
          orderId: result.data._id,
          orderCode: result.data.orderCode,
          paymentStatus: result.data.paymentStatus || "success",
          totalAmount: result.data.totalAmount,
          patientCode: result.data.user?.patientCode || "",
          paidAt: result.data.paidAt || new Date().toISOString(),
          customerInfo: result.data.customerInfo,
        });
        toast.success("Thanh toán thành công!");
      } else {
        throw new Error("Không thể lấy thông tin đơn hàng");
      }
    } catch {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Test Package
  const handleTestPackageVNPaySuccess = async (
    tempOrderId: string
  ): Promise<void> => {
    try {
      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/test-registrations/confirm-vnpay",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: tempOrderId,
            paymentStatus: "success",
          }),
        }
      );
      const result: APIResponse = await response.json();
      if (result.success && result.data) {
        setOrderInfo({
          orderId: result.data.order.id,
          orderCode: result.data.order.orderCode,
          paymentStatus: "success",
          totalAmount: result.data.order.totalAmount,
          patientCode: result.data.customer?.patientCode || "",
          paidAt: result.data.order.paidAt || new Date().toISOString(),
          customerInfo: result.data.order.customerInfo,
        });
        localStorage.removeItem("vnpayTestData");
        toast.success("Thanh toán thành công!");
      } else {
        throw new Error(result.message || "Có lỗi xảy ra!");
      }
    } catch {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý unified checkout
  const handleUnifiedVNPaySuccess = async (
    tempOrderId: string
  ): Promise<void> => {
    try {
      const unifiedData = localStorage.getItem("vnpayUnifiedData");
      if (!unifiedData)
        throw new Error("Không tìm thấy dữ liệu unified checkout");
      const parsedData: unknown = JSON.parse(unifiedData);

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/unified-orders/confirm-vnpay",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tempOrderId,
            paymentStatus: "success",
            orderData: parsedData,
          }),
        }
      );
      const result: UnifiedResponse = await response.json();
      if (result.success && result.data) {
        setOrderInfo({
          orderId: result.data.order?.id || tempOrderId,
          orderCode: result.data.order?.orderCode || `UNI${Date.now()}`,
          paymentStatus: result.data.order?.paymentStatus || "success",
          totalAmount: result.data.order?.totalAmount || 0,
          patientCode: result.data.customer?.patientCode || "",
          paidAt: result.data.order?.paidAt || new Date().toISOString(),
          customerInfo: result.data.order?.customerInfo,
        });
        localStorage.removeItem("vnpayUnifiedData");
        toast.success("Thanh toán thành công!");
      } else {
        throw new Error(result.message || "Có lỗi xảy ra!");
      }
    } catch {
      toast.error("Có lỗi xảy ra!");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // Tạo đơn hàng sau VNPay
  const createOrderAfterVNPaySuccess = async (
    orderData: OrderData,
    tempOrderId: string
  ): Promise<void> => {
    try {
      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/orders/create-after-vnpay",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderData,
            tempOrderId,
          }),
        }
      );
      const result: APIResponse = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Có lỗi xảy ra khi tạo đơn hàng!");
      }
      if (!result.data) throw new Error("Không có dữ liệu trả về từ API!");
      setOrderInfo({
        orderId: result.data.order.id,
        orderCode: result.data.order.orderCode,
        paymentStatus: result.data.order.paymentStatus || "success",
        totalAmount: result.data.order.totalAmount,
        patientCode: result.data.customer?.patientCode || "",
        paidAt: result.data.order.paidAt || new Date().toISOString(),
        customerInfo: result.data.order.customerInfo,
      });
      localStorage.removeItem("vnpayOrderData");
      localStorage.removeItem("vnpayTestData");
      localStorage.removeItem("vnpayUnifiedData");
      toast.success("Thanh toán thành công! Đơn hàng đã được tạo.");
    } catch {
      toast.error("Có lỗi xảy ra khi tạo đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thanh toán thường (không VNPay)
  const handleRegularPayment = (): void => {
    try {
      const state = location.state as {
        orderInfo?: OrderInfo | OrderInfo[];
      } | null;

      if (state && state.orderInfo) {
        if (Array.isArray(state.orderInfo)) {
          const firstOrder = state.orderInfo[0];
          setOrderInfo(firstOrder);
        } else {
          setOrderInfo(state.orderInfo);
        }
        setLoading(false);
        toast.success("Thanh toán thành công!");
        return;
      }

      // Nếu không có state, lấy từ query params
      const orderId = searchParams.get("orderId");
      const orderCode = searchParams.get("orderCode");
      const paymentStatus = searchParams.get("paymentStatus");
      const totalAmount = searchParams.get("totalAmount");
      const patientCode = searchParams.get("patientCode");
      const paidAt = searchParams.get("paidAt");

      if (orderId && orderCode) {
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

      toast.error("Thiếu thông tin thanh toán!");
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="ps-loading-container">
        <div className="ps-loading-content">
          <div className="ps-loading-spinner">
            <div className="ps-spinner"></div>
          </div>
          <h2>Đang xử lý thanh toán...</h2>
          <p>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-container">
      <div className="ps-success-wrapper">
        {/* Success Header */}
        <div className="ps-success-header">
          <div className="ps-success-icon">
            <CheckCircle size={80} />
          </div>
          <h1 className="ps-success-title">Thanh toán thành công!</h1>
          <p className="ps-success-subtitle">
            Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của Mirava Center
          </p>
        </div>

        {orderInfo && (
          <div className="ps-content-grid">
            {/* Order Information Card */}
            <div className="ps-card ps-order-card">
              <div className="ps-card-header">
                <CreditCard size={24} />
                <h3>Thông tin đơn hàng</h3>
              </div>
              <div className="ps-card-content">
                <div className="ps-info-row">
                  <span className="ps-label">Mã đơn hàng:</span>
                  <span className="ps-value ps-highlight">
                    {orderInfo.orderCode}
                  </span>
                </div>
                <div className="ps-info-row">
                  <span className="ps-label">Tổng tiền:</span>
                  <span className="ps-value ps-price">
                    {typeof orderInfo.totalAmount === "number" &&
                    !isNaN(orderInfo.totalAmount)
                      ? orderInfo.totalAmount.toLocaleString("vi-VN") + " VNĐ"
                      : "0 VNĐ"}
                  </span>
                </div>
                {orderInfo.patientCode && (
                  <div className="ps-info-row">
                    <span className="ps-label">Mã bệnh nhân:</span>
                    <span className="ps-value ps-patient-code">
                      {orderInfo.patientCode}
                    </span>
                  </div>
                )}
                <div className="ps-info-row">
                  <span className="ps-label">Trạng thái:</span>
                  <span
                    className={`ps-status ps-status-${orderInfo.paymentStatus}`}
                  >
                    {orderInfo.paymentStatus === "success"
                      ? "Đã thanh toán"
                      : "Đang xử lý"}
                  </span>
                </div>
                <div className="ps-info-row">
                  <span className="ps-label">Thời gian:</span>
                  <span className="ps-value">
                    {orderInfo.paidAt &&
                      new Date(orderInfo.paidAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            {orderInfo.customerInfo && (
              <div className="ps-card ps-customer-card">
                <div className="ps-card-header">
                  <User size={24} />
                  <h3>Thông tin khách hàng</h3>
                </div>
                <div className="ps-card-content">
                  <div className="ps-info-row">
                    <User size={16} />
                    <span className="ps-customer-name">
                      {orderInfo.customerInfo.userName}
                    </span>
                  </div>
                  <div className="ps-info-row">
                    <Mail size={16} />
                    <span className="ps-customer-email">
                      {orderInfo.customerInfo.email}
                    </span>
                  </div>
                  <div className="ps-info-row">
                    <Phone size={16} />
                    <span className="ps-customer-phone">
                      {orderInfo.customerInfo.phone}
                    </span>
                  </div>
                  <div className="ps-info-row">
                    <MapPin size={16} />
                    <span className="ps-customer-address">
                      {orderInfo.customerInfo.address}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps Card */}
            <div className="ps-card ps-next-steps-card">
              <div className="ps-card-header">
                <Calendar size={24} />
                <h3>Các bước tiếp theo</h3>
              </div>
              <div className="ps-card-content">
                <div className="ps-step">
                  <div className="ps-step-number">1</div>
                  <div className="ps-step-content">
                    <h4>Xác nhận đơn hàng</h4>
                    <p>
                      Chúng tôi sẽ xác nhận đơn hàng và liên hệ với quý khách
                      trong vòng 2-4 giờ
                    </p>
                  </div>
                </div>
                <div className="ps-step">
                  <div className="ps-step-number">2</div>
                  <div className="ps-step-content">
                    <h4>Tư vấn và lên lịch</h4>
                    <p>
                      Đội ngũ chuyên gia sẽ tư vấn chi tiết và sắp xếp lịch hẹn
                      phù hợp
                    </p>
                  </div>
                </div>
                <div className="ps-step">
                  <div className="ps-step-number">3</div>
                  <div className="ps-step-content">
                    <h4>Bắt đầu điều trị</h4>
                    <p>
                      Theo dõi kế hoạch điều trị được cá nhân hóa cho từng
                      trường hợp
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support Card */}
            <div className="ps-card ps-support-card">
              <div className="ps-card-header">
                <Phone size={24} />
                <h3>Hỗ trợ khách hàng</h3>
              </div>
              <div className="ps-card-content">
                <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ:</p>
                <div className="ps-contact-info">
                  <div className="ps-contact-item">
                    <Phone size={16} />
                    <span>Hotline: 1900 2247</span>
                  </div>
                  <div className="ps-contact-item">
                    <Mail size={16} />
                    <span>Email: support@mirava.vn</span>
                  </div>
                  <div className="ps-contact-item">
                    <Clock size={16} />
                    <span>Thời gian: 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="ps-actions">
          <button
            onClick={() => navigate("/")}
            className="ps-btn ps-btn-primary"
          >
            <Home size={20} />
            Về trang chủ
          </button>
          <button
            onClick={() => navigate("/services")}
            className="ps-btn ps-btn-secondary"
          >
            <ShoppingBag size={20} />
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
