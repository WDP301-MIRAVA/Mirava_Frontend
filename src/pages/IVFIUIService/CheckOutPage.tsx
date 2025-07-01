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

  // Hàm kiểm tra bác sĩ có rảnh trong khung giờ cụ thể không
  const checkDoctorAvailability = (
    doctor: Doctor,
    date: string,
    time: string
  ): boolean => {
    console.log("🔍 Checking doctor availability:", {
      doctorName: doctor.user.userName,
      workSchedule: doctor.workSchedule,
      status: doctor.status,
      date,
      time,
    });

    if (!doctor.workSchedule || doctor.workSchedule.length === 0) {
      console.log("❌ Doctor has no work schedule");
      return false;
    }

    // SỬA LẠI: Chỉ loại trừ những bác sĩ có status là "inactive" hoặc "blocked"
    if (doctor.status === "inactive" || doctor.status === "blocked") {
      console.log("❌ Doctor not available, status:", doctor.status);
      return false;
    }

    // Phần còn lại giữ nguyên...
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[dayOfWeek];

    console.log("📅 Day info:", {
      dayOfWeek,
      dayName,
      appointmentDate: appointmentDate.toISOString(),
    });

    const workingDay = doctor.workSchedule.find((schedule) => {
      console.log("🔍 Checking schedule:", schedule);
      const lowerSchedule = schedule.toLowerCase();
      const lowerDayName = dayName.toLowerCase();
      const includes = lowerSchedule.includes(lowerDayName);
      console.log(
        `🔍 Does "${lowerSchedule}" include "${lowerDayName}"?`,
        includes
      );
      return includes;
    });

    console.log("🗓️ Working day found:", workingDay);

    if (!workingDay) {
      console.log("❌ Doctor doesn't work on this day");
      return false;
    }

    const timeMatch = workingDay.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
      console.log("❌ Time format not matched, workingDay:", workingDay);
      return false;
    }

    const startHour = parseInt(timeMatch[1]);
    const startMinute = parseInt(timeMatch[2]);
    const endHour = parseInt(timeMatch[3]);
    const endMinute = parseInt(timeMatch[4]);

    const [appointmentHour, appointmentMinute] = time.split(":").map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const appointmentTime = appointmentHour * 60 + appointmentMinute;

    const isInRange = appointmentTime >= startTime && appointmentTime < endTime;

    console.log("⏰ Time comparison:", {
      workingHours: `${startHour}:${startMinute
        .toString()
        .padStart(2, "0")}-${endHour}:${endMinute.toString().padStart(2, "0")}`,
      appointmentTimeFormatted: `${appointmentHour}:${appointmentMinute
        .toString()
        .padStart(2, "0")}`,
      startTime,
      endTime,
      appointmentTime,
      isInRange,
    });

    return isInRange;
  };

  // Hàm tìm bác sĩ có sẵn khi thay đổi ngày/giờ
  const findAvailableDoctors = async (date: string, time: string) => {
    console.log("🔍 Finding available doctors for:", { date, time });

    if (!date || !time || !service?.doctor) {
      console.log("❌ Missing required data:", {
        date,
        time,
        doctorsCount: service?.doctor?.length,
      });
      return;
    }

    console.log("👨‍⚕️ Total doctors in service:", service.doctor.length);
    console.log(
      "👨‍⚕️ All doctors:",
      service.doctor.map((d) => ({
        name: d.user.userName,
        workSchedule: d.workSchedule,
        status: d.status,
      }))
    );
    // api để lấy thông tin bác sĩ có sẵn
    setLoadingDoctors(true);
    try {
      // Thay đổi URL API từ appointment sang treatment-registration
      const apiUrl = `https://mirava-f0rz.onrender.com/api/treatment-registration/check-availability?date=${date}&time=${time}`;
      console.log("🌐 API call:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let bookedDoctors: string[] = [];
      if (response.ok) {
        const bookingData = await response.json();
        bookedDoctors = bookingData.bookedDoctors || [];
        console.log("📅 Booked doctors from API:", bookedDoctors);
      } else {
        console.log(
          "⚠️ API response not ok:",
          response.status,
          response.statusText
        );
        // Không có API endpoint hoặc lỗi - tiếp tục với danh sách trống
      }

      // Lọc bác sĩ có sẵn
      const available = service.doctor

        .map((doctor) => {
          console.log("🧪 Doctor raw object:", doctor);
          const isWorkingTime = checkDoctorAvailability(doctor, date, time);
          const isBooked = bookedDoctors.includes(doctor._id);
          console.log(`👨‍⚕️ Doctor ${doctor.user.userName}:`, {
            isWorkingTime,
            isBooked,
            isAvailable: isWorkingTime && !isBooked,
          });

          return {
            _id: doctor._id,
            name: doctor.user.userName,
            specialty: doctor.specialty,
            isAvailable: isWorkingTime && !isBooked,
            timeSlots: isWorkingTime ? [time] : [],
          };
        })
        .filter((doctor) => doctor.isAvailable);

      console.log("✅ Available doctors:", available);
      setAvailableDoctors(available);

      // Reset doctor selection nếu bác sĩ đã chọn không còn available
      if (
        formData.doctorId &&
        !available.find((d) => d._id === formData.doctorId)
      ) {
        toast("Bác sĩ bạn đã chọn hiện không còn rảnh. Vui lòng chọn lại.");
        setFormData((prev) => ({ ...prev, doctorId: "" }));
      }
    } catch (error) {
      console.error("❌ Error checking doctor availability:", error);
      toast.error("Không thể kiểm tra lịch bác sĩ");
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
    console.log("📋 Dữ liệu người dùng:", formData);
    // Validate form
    if (
      !formData.userName ||
      !formData.phone ||
      !formData.address ||
      !formData.email
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!service) {
      toast.error("Không tìm thấy thông tin dịch vụ!");
      return;
    }

    try {
      setLoading(true);

      // Bước 1: Tạo đơn hàng
      const orderData = {
        items: [
          {
            serviceId: service._id,
            quantity: 1,
          },
        ],
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
      if (formData.doctorId) {
        orderData.doctorId = formData.doctorId;
      }
      console.log("📦 Tạo đơn hàng:", orderData);
      // Gửi yêu cầu tạo đơn hàng
      const orderResponse = await fetch(
        "https://mirava-f0rz.onrender.com/api/orders/guest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );
      console.log("📦 Đáp ứng từ API tạo đơn hàng:", orderResponse);
      const orderResult = await orderResponse.json();

      if (!orderResponse.ok || !orderResult.success) {
        throw new Error(orderResult.message || "Tạo đơn hàng thất bại");
      }

      console.log("✅ Đơn hàng đã tạo:", orderResult.data);

      // Bước 2: Xác nhận thanh toán (giả lập thanh toán thành công)
      const paymentResponse = await fetch(
        `https://mirava-f0rz.onrender.com/api/orders/${orderResult.data.order.id}/confirm-payment`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentStatus: "success",
            paymentMethod: formData.paymentMethod,
          }),
        }
      );

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentResult.success) {
        throw new Error(
          paymentResult.message || "Xác nhận thanh toán thất bại"
        );
      }

      console.log("✅ Thanh toán thành công");

      toast.success("Đặt hàng thành công!");

      // Navigate to success page
      navigate("/payment-confirmation", {
        state: {
          orderData: orderResult.data,
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
