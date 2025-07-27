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
  const [checkingDoctor, setCheckingDoctor] = useState(false);
  const [agreed, setAgreed] = useState(false);

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

  // Lấy thông tin dịch vụ
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(
          `https://mirava-f0rz.onrender.com/api/service/${serviceId}`
        );
        const data = await res.json();
        setService(data);
      } catch (error: unknown) {
        console.error("Lỗi khi tải thông tin dịch vụ:", error);
        toast.error("Không thể tải thông tin dịch vụ");
      }
    };
    if (serviceId) fetchService();
  }, [serviceId]);

  // Hàm kiểm tra tính khả dụng của bác sĩ
  const checkDoctorAvailability = async (
    doctorId: string,
    date: string,
    time: string
  ): Promise<boolean> => {
    try {
      setCheckingDoctor(true);
      const res = await fetch(
        `https://mirava-f0rz.onrender.com/api/work-schedules/availability?doctorId=${doctorId}&date=${date}&startTime=${time}&endTime=${time}`
      );
      const data = await res.json();
      setCheckingDoctor(false);
      if (data.available) return true;
      toast.error(data.reason || "Bác sĩ không khả dụng vào thời gian này");
      return false;
    } catch {
      setCheckingDoctor(false);
      toast.error("Không kiểm tra được lịch bác sĩ");
      return false;
    }
  };

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
          data.data.map((doc: Doctor) => ({
            _id: doc._id,
            name: doc.user.userName,
            specialty: doc.specialty,
            isAvailable: true,
            timeSlots: [time],
          }))
        );
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
    setFormData((prev) => {
      const newForm = { ...prev, appointmentDate: date, doctorId: "" };
      if (date && newForm.timeSlot) {
        findAvailableDoctors(date, newForm.timeSlot);
      } else {
        setAvailableDoctors([]);
      }
      return newForm;
    });
  };

  const handleTimeSlotChange = (time: string) => {
    setFormData((prev) => {
      const newForm = { ...prev, timeSlot: time, doctorId: "" };
      if (newForm.appointmentDate && time) {
        findAvailableDoctors(newForm.appointmentDate, time);
      } else {
        setAvailableDoctors([]);
      }
      return newForm;
    });
  };

  // Xử lý khi chọn bác sĩ
  const handleDoctorSelect = async (doctorId: string) => {
    if (!formData.appointmentDate || !formData.timeSlot) {
      toast.error("Vui lòng chọn ngày và khung giờ trước!");
      return;
    }
    const ok = await checkDoctorAvailability(
      doctorId,
      formData.appointmentDate,
      formData.timeSlot
    );
    if (ok) {
      setFormData((prev) => ({ ...prev, doctorId }));
    } else {
      setFormData((prev) => ({ ...prev, doctorId: "" }));
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + " đ";

  const calculateFinalPrice = (price: number, salePercent: number = 0) =>
    Math.round(price * (1 - salePercent / 100));

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
    if (
      (formData.appointmentDate && !formData.timeSlot) ||
      (!formData.appointmentDate && formData.timeSlot)
    ) {
      toast.error("Vui lòng chọn đầy đủ ngày và khung giờ khám!");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validatePaymentInfo()) return;
    if (!service) {
      toast.error("Không tìm thấy thông tin dịch vụ!");
      return;
    }

    // Kiểm tra lại khả dụng trước khi gửi đơn hàng
    if (formData.doctorId && formData.appointmentDate && formData.timeSlot) {
      const ok = await checkDoctorAvailability(
        formData.doctorId,
        formData.appointmentDate,
        formData.timeSlot
      );
      if (!ok) return;
    }

    try {
      setLoading(true);

      const finalPrice = service.salePrice
        ? calculateFinalPrice(service.price, service.salePrice)
        : service.price;

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
        platform: "web",
        totalAmount: finalPrice,
        orderItems: [
          {
            service: service._id,
            serviceName: service.name,
            price: finalPrice,
            originalPrice: service.price,
            quantity: 1,
            subtotal: finalPrice,
          },
        ],
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

      // Xử lý thanh toán VNPay
      if (formData.paymentMethod === "VNPay" && result.data.vnpUrl) {
        const vnpayOrderData = {
          orderData: result.data.orderData,
          tempOrderId: result.data.tempOrderId,
          service: {
            _id: service._id,
            name: service.name,
            price: service.price,
            salePrice: service.salePrice,
          },

          userInfo: formData,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("vnpayOrderData", JSON.stringify(vnpayOrderData));
        toast.success("Chuyển đến cổng thanh toán...");
        window.location.href = result.data.vnpUrl;
        return;
      }

      toast.success("Đặt hàng thành công!");
      navigate("/payment-confirmation", {
        state: {
          orderData: result.data,
          userInfo: formData,
          service: service,
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại!";
      toast.error(errorMessage);
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
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            doctorId: "",
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
                          onChange={() => handleDoctorSelect(doctor._id)}
                          disabled={checkingDoctor}
                        />
                        <div className="doctor-info">
                          <strong>
                            {doctor.name} -{" "}
                            <span className="availability-badge">
                              Có thể đặt lịch
                            </span>
                          </strong>
                          {/* {doctor.specialty || "Chưa cập nhật"} */}
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
          <div>
            {service.imageUrl && (
              <img
                src={service.imageUrl}
                alt={service.name}
                className="summary-product-image"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            )}
          </div>
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
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <strong>
                Tôi đã đọc và đồng ý với điều khoản và điều kiện của website *
              </strong>
            </label>
            <button
              className="place-order-button"
              onClick={handlePlaceOrder}
              disabled={loading || !agreed}
              style={{
                opacity: !agreed ? 0.6 : 1,
                cursor: !agreed ? "not-allowed" : "pointer",
              }}
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
