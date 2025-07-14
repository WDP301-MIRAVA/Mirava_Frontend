import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UnifiedCheckOutPage.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  originalPrice?: number;
  image: string;
  type: "service" | "test-package";
  quantity: number;
  addedAt?: string;
  testPackageInfo?: {
    duration: string;
    preparation: string;
    packageType: "male" | "female" | "couple";
    testsCount: number;
  };
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
  gender: "Male" | "Female";
  appointmentDate: string;
  timeSlot: string;
  doctorId: string;
  paymentMethod: string;
  notes: string;
}

const UnifiedCheckOutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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
    // Lấy dữ liệu từ giỏ hàng
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          const normalizedCart = parsedCart.map((item: any) => ({
            ...item,
            quantity: item.quantity || 1, // Mặc định là 1 nếu không có quantity
          }));
          setCartItems(normalizedCart);
          localStorage.setItem("cart", JSON.stringify(normalizedCart));
        } else {
          navigate("/cart");
        }
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu giỏ hàng:", error);
        navigate("/cart");
      }
    } else {
      navigate("/cart");
    }
  }, [navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Hàm tìm bác sĩ có sẵn cho dịch vụ
  const findAvailableDoctorsForService = async (
    serviceId: string,
    date: string,
    time: string
  ) => {
    try {
      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/treatment-registration/available-doctors?serviceId=${serviceId}&date=${date}&time=${time}`
      );
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        return data.data.map((doc: any) => ({
          _id: doc._id,
          name: doc.user?.userName || "Không có tên",
          specialty: doc.specialty || "Chưa cập nhật",
          isAvailable: true,
          timeSlots: [time],
        }));
      }
      return [];
    } catch (error) {
      console.error("Lỗi khi tìm bác sĩ cho dịch vụ:", error);
      return [];
    }
  };

  // Hàm tìm bác sĩ có sẵn cho gói xét nghiệm
  const findAvailableDoctorsForTestPackage = async (
    packageId: string,
    date: string,
    time: string
  ) => {
    try {
      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/test-registrations/available-doctors?packageId=${packageId}&date=${date}&time=${time}`
      );
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        return data.data.map((doc: any) => ({
          _id: doc._id,
          name: doc.user?.userName || "Không có tên",
          specialty: doc.specialty || "Chưa cập nhật",
          isAvailable: true,
          timeSlots: [time],
        }));
      }
      return [];
    } catch (error) {
      console.error("Lỗi khi tìm bác sĩ cho gói xét nghiệm:", error);
      return [];
    }
  };

  // Hàm tìm bác sĩ có sẵn cho tất cả items trong giỏ hàng
  const findAvailableDoctors = async (date: string, time: string) => {
    if (!date || !time || cartItems.length === 0) {
      setAvailableDoctors([]);
      return;
    }

    setLoadingDoctors(true);
    try {
      const allDoctors: AvailableDoctor[] = [];

      // Tìm bác sĩ cho từng item trong giỏ hàng
      for (const item of cartItems) {
        let doctors: AvailableDoctor[] = [];

        if (item.type === "service") {
          doctors = await findAvailableDoctorsForService(item.id, date, time);
        } else if (item.type === "test-package") {
          doctors = await findAvailableDoctorsForTestPackage(
            item.id,
            date,
            time
          );
        }

        allDoctors.push(...doctors);
      }

      // Loại bỏ bác sĩ trùng lặp
      const uniqueDoctors = allDoctors.filter(
        (doctor, index, self) =>
          self.findIndex((d) => d._id === doctor._id) === index
      );

      setAvailableDoctors(uniqueDoctors);
    } catch (error) {
      console.error("Lỗi khi tìm bác sĩ:", error);
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

  // Xử lý thay đổi input
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

    // Kiểm tra nếu chọn đặt lịch thì phải chọn đầy đủ
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

    setIsSubmitting(true);

    console.log("🚀 Bắt đầu xử lý đơn hàng...");
    console.log("🛒 Current cart items:", cartItems);

    try {
      // Phân tách items theo loại
      const services = cartItems.filter((item) => {
        const isService =
          item.type === "service" ||
          (item.type !== "test-package" && !item.testPackageInfo);
        console.log(
          `Item ${item.name} - Type: ${item.type}, Is Service: ${isService}`
        );
        return isService;
      });
      const testPackages = cartItems.filter((item) => {
        const isTestPackage =
          item.type === "test-package" || item.testPackageInfo !== undefined;
        console.log(
          `Item ${item.name} - Type: ${item.type}, Is Test Package: ${isTestPackage}`
        );
        return isTestPackage;
      });
      console.log("📊 Phân tích giỏ hàng chi tiết:", {
        totalItems: cartItems.length,
        cartItemsRaw: cartItems,
        services: {
          count: services.length,
          items: services,
          ids: services.map((s) => s.id),
        },
        testPackages: {
          count: testPackages.length,
          items: testPackages,
          ids: testPackages.map((t) => t.id),
        },
      });
      // Kiểm tra nếu không có items nào được phân loại
      if (services.length === 0 && testPackages.length === 0) {
        console.error("❌ Không thể phân loại items trong giỏ hàng!");
        toast.error("Có lỗi với dữ liệu giỏ hàng. Vui lòng thử lại!");
        return;
      }
      // Chuẩn bị dữ liệu chung cho cả 2 API
      const commonData = {
        paymentMethod: formData.paymentMethod,
        note: formData.notes,
        customerInfo: {
          userName: formData.userName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
        },
        appointmentDate: formData.appointmentDate || undefined,
        timeSlot: formData.timeSlot || undefined,
        doctorId: formData.doctorId || undefined,
      };

      console.log("📝 Dữ liệu chung:", commonData);

      // Tạo array chứa các promises để gửi đồng thời
      const orderPromises: Promise<any>[] = [];
      const orderTypes: string[] = [];

      // ✅ XỬ LÝ DỊCH VỤ IUI/IVF
      if (services.length > 0) {
        console.log("🏥 Chuẩn bị gửi API cho dịch vụ IUI/IVF...");

        const serviceOrderData = {
          ...commonData,
          items: services.map((item) => ({
            serviceId: item.id,
            quantity: item.quantity || 1,
          })),
        };

        console.log("📤 Service Order Data:", serviceOrderData);
        console.log(
          "⏰ Thời điểm tạo Service Promise:",
          new Date().toLocaleTimeString()
        );

        const servicePromise = fetch(
          "https://mirava-f0rz.onrender.com/api/orders/guest",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(serviceOrderData),
          }
        )
          .then(async (response) => {
            console.log("📡 Service API Response Status:", response.status);
            console.log(
              "⏰ Service API Response Time:",
              new Date().toLocaleTimeString()
            );

            const result = await response.json();
            console.log("📦 Service API Result:", result);

            if (!response.ok || !result.success) {
              throw new Error(
                result.message || "Có lỗi xảy ra khi đặt dịch vụ điều trị!"
              );
            }

            const serviceResult = {
              type: "service",
              data: result.data,
              orderCode: result.data.orderCode,
            };

            console.log("✅ Service Order thành công:", serviceResult);
            return serviceResult;
          })
          .catch((error) => {
            console.error("❌ Service API Error:", error);
            throw error;
          });

        orderPromises.push(servicePromise);
        orderTypes.push("service");

        console.log("➕ Đã thêm Service Promise vào queue");
      }

      // ✅ XỬ LÝ GÓI XÉT NGHIỆM
      if (testPackages.length > 0) {
        console.log("🧪 Chuẩn bị gửi API cho gói xét nghiệm...");

        const testOrderData = {
          ...commonData,
          items: testPackages.map((item) => ({
            packageId: item.id,
            quantity: item.quantity || 1,
          })),
        };

        console.log("📤 Test Package Order Data:", testOrderData);
        console.log(
          "⏰ Thời điểm tạo Test Package Promise:",
          new Date().toLocaleTimeString()
        );

        const testPromise = fetch(
          "https://mirava-f0rz.onrender.com/api/test-registrations/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(testOrderData),
          }
        )
          .then(async (response) => {
            console.log(
              "📡 Test Package API Response Status:",
              response.status
            );
            console.log(
              "⏰ Test Package API Response Time:",
              new Date().toLocaleTimeString()
            );

            const result = await response.json();
            console.log("📦 Test Package API Result:", result);

            if (!response.ok || !result.success) {
              throw new Error(
                result.message || "Có lỗi xảy ra khi đặt gói xét nghiệm!"
              );
            }

            const testResult = {
              type: "test-package",
              data: result.data,
              orderCode: result.data.orderCode,
            };

            console.log("✅ Test Package Order thành công:", testResult);
            return testResult;
          })
          .catch((error) => {
            console.error("❌ Test Package API Error:", error);
            throw error;
          });

        orderPromises.push(testPromise);
        orderTypes.push("test-package");

        console.log("➕ Đã thêm Test Package Promise vào queue");
      }

      console.log("🔄 Sẵn sàng gửi đồng thời các API:", {
        totalPromises: orderPromises.length,
        orderTypes: orderTypes,
      });

      // Kiểm tra nếu không có promise nào
      if (orderPromises.length === 0) {
        throw new Error("Không có sản phẩm nào để đặt hàng!");
      }

      // Ghi log thời gian bắt đầu
      const startTime = Date.now();
      console.log(
        "⏱️ Bắt đầu gửi API đồng thời lúc:",
        new Date(startTime).toLocaleTimeString()
      );

      // ✅ GỬI TẤT CẢ API ĐỒNG THỜI
      const results = await Promise.all(orderPromises);

      const endTime = Date.now();
      console.log(
        "⏱️ Hoàn thành tất cả API lúc:",
        new Date(endTime).toLocaleTimeString()
      );
      console.log("⚡ Tổng thời gian xử lý:", endTime - startTime + "ms");
      console.log("🎯 Tất cả kết quả API:", results);

      // Xử lý thanh toán VNPay - tìm URL từ bất kỳ đơn hàng nào
      let vnpUrl = null;
      if (formData.paymentMethod === "VNPay") {
        console.log("💳 Tìm kiếm VNPay URL...");

        for (const result of results) {
          console.log("🔍 Kiểm tra VNPay URL trong result:", result.data);

          if (result.data.vnpUrl) {
            vnpUrl = result.data.vnpUrl;
            console.log("💰 Tìm thấy VNPay URL:", vnpUrl);
            break; // Sử dụng URL đầu tiên tìm thấy
          }
        }

        if (!vnpUrl) {
          console.log("⚠️ Không tìm thấy VNPay URL trong bất kỳ response nào");
        }
      }

      // Xử lý thanh toán VNPay
      if (vnpUrl) {
        console.log("🔄 Chuyển hướng đến VNPay:", vnpUrl);
        toast.success("Chuyển đến cổng thanh toán...");
        window.location.href = vnpUrl;
        return;
      }

      // Hiển thị thông báo thành công dựa trên loại đơn hàng
      const orderCodes = results.map((r) => r.orderCode).filter(Boolean);
      console.log("📋 Danh sách mã đơn hàng:", orderCodes);

      if (services.length > 0 && testPackages.length > 0) {
        const successMessage = `Đặt hàng thành công! Tạo được ${
          results.length
        } đơn hàng: ${orderCodes.join(", ")}`;
        console.log("🎉 " + successMessage);
        toast.success(successMessage);
      } else if (services.length > 0) {
        const successMessage = `Đặt dịch vụ điều trị thành công! Mã đơn hàng: ${orderCodes[0]}`;
        console.log("🎉 " + successMessage);
        toast.success(successMessage);
      } else {
        const successMessage = `Đặt gói xét nghiệm thành công! Mã đơn hàng: ${orderCodes[0]}`;
        console.log("🎉 " + successMessage);
        toast.success(successMessage);
      }

      // Xóa giỏ hàng sau khi đặt hàng thành công
      console.log("🗑️ Xóa giỏ hàng...");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("storage"));

      // Chuyển hướng đến trang thanh toán thành công
      const navigationState = {
        orderInfo: results,
        userInfo: formData,
        orderType:
          services.length > 0 && testPackages.length > 0
            ? "separate"
            : services.length > 0
            ? "service"
            : "test-package",
        totalOrders: results.length,
      };

      console.log("🧭 Chuyển hướng với state:", navigationState);

      navigate("/payment-success", {
        state: navigationState,
      });
    } catch (error: any) {
      console.error("❌ Lỗi tổng thể:", error);
      console.error("❌ Error stack:", error.stack);

      // Hiển thị lỗi cụ thể
      if (error.message.includes("dịch vụ")) {
        const errorMsg = `Lỗi đặt dịch vụ: ${error.message}`;
        console.error("🏥 " + errorMsg);
        toast.error(errorMsg);
      } else if (error.message.includes("xét nghiệm")) {
        const errorMsg = `Lỗi đặt gói xét nghiệm: ${error.message}`;
        console.error("🧪 " + errorMsg);
        toast.error(errorMsg);
      } else {
        const errorMsg = error.message || "Có lỗi xảy ra. Vui lòng thử lại!";
        console.error("⚠️ " + errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      console.log("🔚 Kết thúc xử lý đơn hàng");
      setIsSubmitting(false);
    }
  };

  // Tính tổng tiền
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.discountPrice ?? item.price;
      const quantity = item.quantity || 1;
      return total + itemPrice * quantity;
    }, 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <Header />
        <div className="loading-container">
          <p>Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.</p>
          <button
            className="back-to-shop-btn"
            onClick={() => navigate("/test-services")}
          >
            Quay lại mua sắm
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="checkout-wrapper">
            {/* Form thông tin khách hàng */}
            <form onSubmit={handleSubmit} className="checkout-form">
              <h2>Thông tin khách hàng</h2>

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
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </select>
              </div>

              {/* Phần đặt lịch hẹn */}
              <div className="appointment-section">
                <h3>Thông tin đặt lịch (Tùy chọn)</h3>

                <div className="form-group">
                  <label htmlFor="appointmentDate">Ngày khám</label>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="date-picker"
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
                            name="doctorId"
                            value=""
                            checked={formData.doctorId === ""}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="no-doctor">
                            Không chọn bác sĩ cụ thể
                          </label>
                        </div>
                        {availableDoctors.map((doctor) => (
                          <div key={doctor._id} className="doctor-option">
                            <input
                              type="radio"
                              id={`doctor-${doctor._id}`}
                              name="doctorId"
                              value={doctor._id}
                              checked={formData.doctorId === doctor._id}
                              onChange={handleInputChange}
                            />
                            <label htmlFor={`doctor-${doctor._id}`}>
                              <div className="doctor-info">
                                <strong>{doctor.name}</strong> -{" "}
                                {doctor.specialty}
                                <span className="availability-badge">
                                  Có thể đặt lịch
                                </span>
                              </div>
                            </label>
                          </div>
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
                {isSubmitting ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG"}
              </button>
            </form>

            {/* Hiển thị đơn hàng */}
            <div className="order-summary">
              <h2>Đơn hàng của bạn</h2>
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p className="item-type">
                      {item.type === "service" ? "Dịch vụ" : "Gói xét nghiệm"}
                    </p>
                    <p className="item-price">
                      {formatPrice(item.discountPrice ?? item.price)} đ
                    </p>
                    <p className="item-quantity">Số lượng: {item.quantity}</p>
                    {item.testPackageInfo && (
                      <p className="package-info">
                        {item.testPackageInfo.packageType === "male"
                          ? "Nam giới"
                          : item.testPackageInfo.packageType === "female"
                          ? "Nữ giới"
                          : "Cặp đôi"}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="order-total">
                <div className="total-row">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(getTotalPrice())} đ</span>
                </div>
                <div className="total-row final-total">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(getTotalPrice())} đ</span>
                </div>
              </div>

              <div className="payment-info">
                <h4>Thông tin thanh toán</h4>
                <p>
                  {formData.paymentMethod === "VNPay"
                    ? "Thanh toán online qua VNPay"
                    : "Thanh toán tiền mặt tại phòng khám"}
                </p>
                <p className="payment-note">
                  Đơn hàng sẽ được xác nhận sau khi thanh toán thành công.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UnifiedCheckOutPage;
