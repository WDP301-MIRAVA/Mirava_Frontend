import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CheckOutPage.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Test {
  testName: string;
  testCode: string;
  normalRange: string;
  unit: string;
  _id: string;
}

interface TestPackage {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  treatmentSubjects: string[];
  treatmentProcess: string[];
  treatmentProcessImage: string;
  type: "male" | "female" | "couple";
  tests: Test[];
  price: number;
  duration: string;
  preparation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  appointmentDate: string;
  appointmentTime: string;
  paymentMethod: string;
  notes: string;
}

const CheckOutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [testPackage, setTestPackage] = useState<TestPackage | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    gender: "Nam",
    appointmentDate: "",
    appointmentTime: "",
    paymentMethod: "Tiền mặt",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Time slots for appointment
  const timeSlots = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  useEffect(() => {
    // Get test package data from location state (passed from detail page)
    if (location.state?.testPackage) {
      setTestPackage(location.state.testPackage);
    } else {
      // If no data found, redirect back to packages page
      navigate("/test-packages");
    }
  }, [location.state, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTimeSlotClick = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      appointmentTime: time,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      alert("Vui lòng đồng ý với điều khoản và điều kiện");
      return;
    }

    setIsSubmitting(true);
    try {
      // API call to submit order
      const orderData = {
        ...formData,
        testPackageId: testPackage?._id,
        testPackageName: testPackage?.name,
        totalAmount: testPackage?.price,
      };

      console.log("Submitting order:", orderData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
      navigate("/");
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!testPackage) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="order-page">
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="order-wrapper">
            {/* Left Column - Order Form */}
            <div className="order-form-section">
              <h2>Thông tin thanh toán</h2>

              <form onSubmit={handleSubmit} className="order-form">
                <div className="form-group">
                  <label htmlFor="fullName">Họ và Tên *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Địa chỉ *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Giới tính</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="appointmentDate">
                    Thông tin đặt lịch (tùy chọn)
                  </label>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Chọn khung giờ</label>
                  <div className="time-slots">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={`time-slot ${
                          formData.appointmentTime === time ? "active" : ""
                        }`}
                        onClick={() => handleTimeSlotClick(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="paymentMethod">Phương thức thanh toán</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Ghi chú</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Nhập ghi chú cho đơn hàng..."
                    rows={4}
                  />
                </div>

                <div className="terms-checkbox">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                  />
                  <label htmlFor="agreeToTerms">
                    Tôi đồng ý với điều khoản và điều kiện của website *
                  </label>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting || !agreeToTerms}
                >
                  {isSubmitting ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG"}
                </button>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="order-summary-section">
              <h3>Đơn hàng của bạn</h3>

              <div className="order-summary">
                <div className="product-item">
                  <div className="product-image">
                    <img src={testPackage.imageUrl} alt={testPackage.name} />
                  </div>
                  <div className="product-details">
                    <h4>{testPackage.name}</h4>
                    <p>
                      Gói xét nghiệm{" "}
                      {testPackage.type === "male"
                        ? "nam giới"
                        : testPackage.type === "female"
                        ? "nữ giới"
                        : "cặp đôi"}
                    </p>
                  </div>
                </div>

                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Tạm tính</span>
                    <span>{formatPrice(testPackage.price)} đ</span>
                  </div>
                  <div className="price-row">
                    <span>Tổng</span>
                    <span className="total-price">
                      {formatPrice(testPackage.price)} đ
                    </span>
                  </div>
                </div>

                <div className="payment-method-info">
                  <h4>Chuyển khoản ngân hàng (Quét QR)</h4>
                  <p>
                    Thực hiện thanh toán vào ngay tài khoản ngân hàng của chúng
                    tôi. Vui lòng sử dụng Mã đơn hàng của bạn trong phần Nội
                    dung thanh toán. Đơn hàng sẽ chỉ được giao sau khi tiền đã
                    chuyển khoản.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckOutPage;
