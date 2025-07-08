import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CheckoutPage.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";

interface Doctor {
  _id: string;
  user: {
    userName: string;
  };
  specialty: string;
  workSchedule: string[];
  status: string;
}

interface ServiceDetail {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  shortDescription?: string[];
  imageUrl: string;
  doctor?: Doctor[];
}

interface AvailableDoctor {
  _id: string;
  name: string;
  specialty: string;
  isAvailable: boolean;
  timeSlots: string[];
}

const CheckoutPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<AvailableDoctor[]>(
    []
  );

  const [formData, setFormData] = useState({
    userName: "",
    phone: "",
    email: "",
    address: "",
    appointmentDate: "",
    timeSlot: "",
    doctorId: "",
    appointmentNote: "",
    gender: "Male" as "Male" | "Female",
    paymentMethod: "Cash",
  });

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
  // api để lấy thông tin dịch vụ
  useEffect(() => {
    const fetchService = async () => {
      try {
        console.log("🟢 ID lấy từ useParams:", serviceId);
        const res = await fetch(
          `https://mirava-f0rz.onrender.com/api/service/${serviceId}`
        );
        const data = await res.json();
        console.log("📦 Dữ liệu API trả về:", data);
        setService(data);
      } catch (error) {
        console.error("Lỗi khi tải dịch vụ:", error);
        toast.error("Không thể tải thông tin dịch vụ");
      }
    };

    if (serviceId) fetchService();
  }, [serviceId]);

  // Hàm tìm bác sĩ có sẵn khi thay đổi ngày/giờ
  const findAvailableDoctors = async (date: string, time: string) => {
    if (!service?._id || !date || !time) {
      setAvailableDoctors([]);
      return;
    }
    setLoadingDoctors(true);
    try {
      const res = await fetch(
        `https://mirava-f0rz.onrender.com/api/treatment-registration/available-doctors?serviceId=${service._id}&date=${date}&time=${time}`
      );
      const data = await res.json();
      if (data.success) {
        setAvailableDoctors(
          data.data.map((doc: any) => ({
            _id: doc._id,
            name: doc.user.userName,
            specialty: doc.specialty,
            isAvailable: true,
            timeSlots: [time],
          }))
        );
        console.log("🟢 Bác sĩ có sẵn:", data);
      } else {
        setAvailableDoctors([]);
      }
    } catch {
      setAvailableDoctors([]);
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + " đ";

  const calculateFinalPrice = (price: number, salePercent: number = 0) =>
    Math.round(price * (1 - salePercent / 100));

  const handlePlaceOrder = async () => {
    if (!validatePaymentInfo()) return;
    if (!service) {
      toast.error("Không tìm thấy thông tin dịch vụ!");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: [{ serviceId: service._id, quantity: 1 }],
        paymentMethod: formData.paymentMethod,
        note: formData.appointmentNote || `Đặt dịch vụ: ${service.name}`,
        customerInfo: {
          userName: formData.userName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
        },
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot,
        doctorId: formData.doctorId,
      };

      const res = await fetch(
        "https://mirava-f0rz.onrender.com/api/orders/guest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Có lỗi xảy ra. Vui lòng thử lại!");
      }

      const { order, vnpUrl } = result.data;

      // 🔁 Nếu chọn VNPay → chuyển hướng đến VNPay URL
      if (formData.paymentMethod === "VNPay" && vnpUrl) {
        toast.success("Chuyển đến cổng thanh toán...");
        window.location.href = vnpUrl;
        return;
      }

      // ✅ Với thanh toán thường (cash)
      toast.success("Đặt hàng thành công!");
      navigate("/payment-confirmation", {
        state: {
          orderData: result.data,
          userInfo: formData,
          service: service,
        },
      });
    } catch (error: any) {
      console.error("❌ Lỗi:", error);
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!service) {
    return (
      <div>
        <Header />
        <div className="loading-container">
          <p>Đang tải thông tin dịch vụ...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Hàm validate thông tin thanh toán
  const validatePaymentInfo = () => {
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
    if (!formData.paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán!");
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

  return (
    <div>
      <Header />
      <div className="checkout-container">
        <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
          <h2>Thông tin thanh toán</h2>

          <label className="label">
            Họ và Tên <span className="required">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.userName}
            onChange={(e) =>
              setFormData({ ...formData, userName: e.target.value })
            }
          />

          <label className="label">
            Số Điện Thoại <span className="required">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <label className="label">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <label className="label">
            Địa Chỉ <span className="required">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />

          <label className="label">Giới tính</label>
          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData({
                ...formData,
                gender: e.target.value as "Male" | "Female",
              })
            }
          >
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
          </select>

          <div className="appointment-section">
            <h3>Thông tin đặt lịch (Tùy chọn)</h3>

            <label className="label">Ngày khám</label>
            <input
              type="date"
              className="date-picker"
              min={new Date().toISOString().split("T")[0]}
              value={formData.appointmentDate}
              onChange={(e) => handleDateChange(e.target.value)}
            />

            <label className="label">Chọn khung giờ:</label>
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
                          <strong>{doctor.name}</strong> -{" "}
                          {doctor.specialty || "Chưa cập nhật"}
                          <span className="availability-badge">
                            Có thể đặt lịch
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="no-doctors">
                    <p>Không có bác sĩ nào rảnh vào thời gian này.</p>
                    <p>
                      Vui lòng chọn thời gian khác hoặc để trống để chúng tôi
                      sắp xếp.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <label className="label">Phương thức thanh toán</label>
          <select
            value={formData.paymentMethod}
            onChange={(e) =>
              setFormData({ ...formData, paymentMethod: e.target.value })
            }
          >
            <option value="Cash">Tiền mặt</option>
            <option value="VNPay">Chuyển khoản</option>
          </select>

          <h2>Ghi Chú</h2>
          <textarea
            value={formData.appointmentNote}
            onChange={(e) =>
              setFormData({ ...formData, appointmentNote: e.target.value })
            }
            placeholder="Nhập ghi chú nếu có..."
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
              <p>{service.name} × 1</p>
              {service.shortDescription?.map((d, i) => (
                <small key={i}>{d}</small>
              ))}
              <span className="price">
                {formatPrice(
                  calculateFinalPrice(service.price, service.salePrice)
                )}
              </span>
            </div>

            <div className="summary-item">
              <strong>Tạm tính</strong>
              <span>
                {formatPrice(
                  calculateFinalPrice(service.price, service.salePrice)
                )}
              </span>
            </div>
            <div className="summary-item">
              <strong>Tổng</strong>
              <span className="total">
                {formatPrice(
                  calculateFinalPrice(service.price, service.salePrice)
                )}
              </span>
            </div>
          </div>

          <div className="payment-info">
            <p>
              <strong>Chuyển khoản ngân hàng (Quét mã QR)</strong> VietinBank
            </p>
            <p className="note">
              Chuyển khoản vào tài khoản Vietinbank của chúng tôi. Đơn hàng sẽ
              được xác nhận ngay sau khi chuyển khoản.
            </p>
          </div>

          <div className="order-submit">
            <label className="checkbox">
              <input type="checkbox" required />
              <strong>
                Tôi đã đọc và đồng ý với điều khoản và điều kiện của website *
              </strong>
            </label>
            <button
              className="place-order-button"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "ĐẶT HÀNG"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
