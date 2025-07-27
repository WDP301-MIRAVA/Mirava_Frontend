import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CheckOutPage.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";

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

interface AvailableDoctor {
  _id: string;
  name: string;
  specialty: string;
  isAvailable: boolean;
  timeSlots: string[];
}

interface OrderFormData {
  userName: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  appointmentDate: string;
  timeSlot: string;
  doctorId: string;
  paymentMethod: string;
  notes: string;
}

const CheckOutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [testPackage, setTestPackage] = useState<TestPackage | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<AvailableDoctor[]>(
    []
  );
  const [formData, setFormData] = useState<OrderFormData>({
    userName: "",
    phone: "",
    email: "",
    address: "",
    gender: "Male",
    appointmentDate: "",
    timeSlot: "",
    doctorId: "",
    paymentMethod: "Cash",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Danh sách khung giờ
  const timeSlots = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  useEffect(() => {
    const userStr = localStorage.getItem("userInfo");
    const token = localStorage.getItem("accessToken");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.userName && user.phone && user.email && user.address) {
          setFormData((prev) => ({
            ...prev,
            userName: user.userName || "",
            phone: user.phone || "",
            email: user.email || "",
            address: user.address || "",
            gender: user.gender || "Male",
          }));
        } else if (user.id && token) {
          // Gọi API lấy thông tin chi tiết với token
          fetch(
            `https://mirava-f0rz.onrender.com/api/user/profile/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
            .then((res) => {
              if (!res.ok) throw new Error("Không thể lấy thông tin user");
              return res.json();
            })
            .then((data) => {
              if (data && data.userName) {
                setFormData((prev) => ({
                  ...prev,
                  userName: data.userName || "",
                  phone: data.phone || "",
                  email: data.email || "",
                  address: data.address || "",
                  gender: data.gender || "Male",
                }));
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        // Không làm gì nếu lỗi parse
      }
    }
  }, []);

  useEffect(() => {
    if (location.state?.testPackage) {
      setTestPackage(location.state.testPackage);
    } else {
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

  // Hàm tìm bác sĩ có sẵn khi thay đổi ngày/giờ
  const findAvailableDoctors = async (date: string, time: string) => {
    if (!testPackage?._id || !date || !time) {
      setAvailableDoctors([]);
      return;
    }

    setLoadingDoctors(true);
    try {
      console.log("🔍 Tìm bác sĩ có sẵn với params:", {
        packageId: testPackage._id,
        date,
        time,
      });

      // Gọi API mới để lấy bác sĩ có sẵn cho test package
      const res = await fetch(
        `https://mirava-f0rz.onrender.com/api/test-registrations/available-doctors?packageId=${testPackage._id}&date=${date}&time=${time}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("🔍 API Response:", data);

      if (data.success && data.data && Array.isArray(data.data)) {
        setAvailableDoctors(
          data.data.map((doc: any) => ({
            _id: doc._id,
            name: doc.user?.userName || "Không có tên",
            specialty: doc.specialty || "Chưa cập nhật",
            isAvailable: doc.isAvailable || true,
            timeSlots: [time],
          }))
        );
        console.log("🟢 Bác sĩ có sẵn:", data.data);
      } else {
        console.log("⚠️ Không có bác sĩ hoặc API trả về dữ liệu không hợp lệ");
        setAvailableDoctors([]);
      }
    } catch (error) {
      console.error("❌ Lỗi khi tìm bác sĩ:", error);
      setAvailableDoctors([]);

      // Hiển thị thông báo lỗi cho người dùng
      if (error instanceof Error) {
        console.error("Chi tiết lỗi:", error.message);
      }
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Xử lý khi thay đổi ngày
  const handleDateChange = (date: string) => {
    setFormData((prev) => ({ ...prev, appointmentDate: date }));
    if (date && formData.timeSlot) {
      findAvailableDoctors(date, formData.timeSlot);
    } else {
      setAvailableDoctors([]);
    }
  };

  // Xử lý khi thay đổi giờ
  const handleTimeSlotChange = (time: string) => {
    setFormData((prev) => ({ ...prev, timeSlot: time }));
    if (formData.appointmentDate && time) {
      findAvailableDoctors(formData.appointmentDate, time);
    } else {
      setAvailableDoctors([]);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.userName.trim()) {
      toast.error("Vui lòng nhập họ và tên!");
      return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Số điện thoại không hợp lệ!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ!");
      return false;
    }

    if (!formData.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ!");
      return false;
    }

    if (!formData.appointmentDate) {
      toast.error("Vui lòng chọn ngày mong muốn!");
      return false;
    }

    // Nếu chọn đặt lịch thì kiểm tra ngày và giờ
    if (
      (formData.appointmentDate && !formData.timeSlot) ||
      (!formData.appointmentDate && formData.timeSlot)
    ) {
      toast.error("Vui lòng chọn đầy đủ ngày và khung giờ khám!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      toast.error("Vui lòng đồng ý với điều khoản và điều kiện");
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!testPackage) {
      toast.error("Không tìm thấy thông tin gói xét nghiệm!");
      return;
    }

    setIsSubmitting(true);
    try {
      const registrationData = {
        items: [
          {
            packageId: testPackage._id,
            quantity: 1,
          },
        ],
        paymentMethod: formData.paymentMethod,
        note: formData.notes,
        customerInfo: {
          userName: formData.userName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
        },
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot || undefined,
        doctorId: formData.doctorId || undefined,
        platform: "web",
      };

      console.log("Submitting test registration:", registrationData);

      const response = await fetch(
        "https://mirava-f0rz.onrender.com/api/test-registrations/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Có lỗi xảy ra. Vui lòng thử lại!");
      }

      console.log("✅ Đăng ký thành công:", result.data);

      // Xử lý response cho VNPay
      if (formData.paymentMethod === "VNPay" && result.data.vnpUrl) {
        toast.success("Chuyển đến cổng thanh toán...");
        window.location.href = result.data.vnpUrl;
        return;
      }

      toast.success("Đăng ký xét nghiệm thành công!");

      navigate("/payment-success", {
        state: {
          orderInfo: {
            orderId: result.data.order.id,
            orderCode: result.data.order.orderCode,
            paymentStatus: result.data.order.paymentStatus,
            totalAmount: result.data.order.totalAmount,
            testPackageName: testPackage.name,
            patientCode: result.data.customer.patientCode,
            isNewUser: result.data.customer.isNewUser,
          },
          userInfo: {
            userName: result.data.customer.userName,
            email: result.data.customer.email,
            phone: result.data.customer.phone,
          },
        },
      });
    } catch (error: any) {
      console.error("❌ Lỗi đăng ký xét nghiệm:", error);
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
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
              <h2>Thông tin đăng ký xét nghiệm</h2>

              <form onSubmit={handleSubmit} className="order-form">
                {!formData.userName && (
                  <div className="form-group">
                    <label htmlFor="userName">Họ và Tên *</label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                )}
                {!formData.phone && (
                  <div className="form-group">
                    <label htmlFor="phone">Số điện thoại *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập số điện thoại (10-11 số)"
                    />
                  </div>
                )}
                {!formData.email && (
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
                )}
                {!formData.address && (
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
                )}
                {!formData.gender && (
                  <div className="form-group">
                    <label htmlFor="gender">Giới tính</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                    </select>
                  </div>
                )}
                {/* Phần đặt lịch hẹn */}
                <div className="appointment-section">
                  <h3>Thông tin đặt lịch</h3>

                  <div className="form-group">
                    <label htmlFor="appointmentDate">
                      Ngày mong muốn xét nghiệm *
                    </label>
                    <input
                      type="date"
                      id="appointmentDate"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Chọn khung giờ:</label>
                    <div className="time-slots">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`time-slot ${
                            formData.timeSlot === time ? "active" : ""
                          }`}
                          onClick={() => handleTimeSlotChange(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hiển thị bác sĩ có sẵn */}
                  {formData.appointmentDate && formData.timeSlot && (
                    <div className="available-doctors">
                      <label className="label">
                        Bác sĩ có sẵn vào {formData.appointmentDate} lúc{" "}
                        {formData.timeSlot}:
                      </label>

                      {loadingDoctors ? (
                        <div className="loading-doctors">
                          <p>Đang kiểm tra lịch bác sĩ...</p>
                        </div>
                      ) : availableDoctors.length > 0 ? (
                        <div className="doctor-list">
                          <div className="doctor-option">
                            <input
                              type="radio"
                              id="no-doctor"
                              name="doctor"
                              value=""
                              checked={formData.doctorId === ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  doctorId: e.target.value,
                                }))
                              }
                            />
                            <label htmlFor="no-doctor">
                              Không chọn bác sĩ cụ thể
                            </label>
                          </div>
                          {availableDoctors.map((doctor) => (
                            <label key={doctor._id} className="doctor-option">
                              <input
                                type="radio"
                                name="doctor"
                                value={doctor._id}
                                checked={formData.doctorId === doctor._id}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    doctorId: e.target.value,
                                  }))
                                }
                              />
                              <div className="doctor-info">
                                <strong>
                                  {doctor.name} - {""}
                                  <span className="availability-badge">
                                    Có thể đặt lịch
                                  </span>
                                </strong>{" "}
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="no-doctors">
                          <p>Không có bác sĩ nào rảnh vào thời gian này.</p>
                          <p>
                            Vui lòng chọn thời gian khác hoặc để trống để chúng
                            tôi sắp xếp.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="paymentMethod">Phương thức thanh toán</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="Cash">Tiền mặt</option>
                    <option value="VNPay">Chuyển khoản (VNPay)</option>
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
                  {isSubmitting ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ XÉT NGHIỆM"}
                </button>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="order-summary-section">
              <h3>Thông tin gói xét nghiệm</h3>

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
                    <p className="duration">
                      <strong>Thời gian có kết quả:</strong>{" "}
                      {testPackage.duration}
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
                  <h4>Hướng dẫn thanh toán</h4>
                  <p>
                    Sau khi đăng ký thành công, chúng tôi sẽ gửi email xác nhận
                    và liên hệ với bạn để xác nhận lịch hẹn. Vui lòng thanh toán
                    tại phòng khám hoặc theo hướng dẫn trong email.
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
