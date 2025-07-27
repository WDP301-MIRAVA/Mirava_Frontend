import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Check } from "lucide-react";
import "./OrderManagement.css";

interface Doctor {
  _id: string;
  user: {
    _id: string;
    userName: string;
  };
}
interface OrderItem {
  service: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  subtotal: number;
  // 👇 Thêm các trường optional
  testPackage?: {
    name: string;
  };
  serviceName?: string;
  testPackageName?: string;
}
interface Order {
  _id: string;
  orderCode: string;
  user: {
    userName: string;
    email: string;
    phone: string;
    patientCode: string;
  };
  items: Array<{
    testPackage?: {
      _id: string; // Thêm dòng này
      name: string;
      price: number;
    };
    service: {
      _id: string; // Thêm dòng này
      name: string;
      price: number;
    };
    quantity: number;
    subtotal: number;
  }>;

  totalAmount: number;
  paymentStatus: "pending" | "success" | "failed";
  orderStatus: "pending" | "paid" | "completed" | "cancelled";
  createdAt: string;
  appointmentDate?: string;
  timeSlot?: string;
  doctorId?: Doctor;
  customerInfo?: {
    userName: string;
  };
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Thêm state error
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal chọn bác sĩ
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectingOrder, setSelectingOrder] = useState<Order | null>(null);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // Hàm lấy danh sách bác sĩ rảnh cho đơn hàng
  const fetchAvailableDoctors = async (order: Order) => {
    setAvailableDoctors([]);
    setSelectedDoctorId("");
    try {
      // Lấy packageId từ dịch vụ đầu tiên của đơn hàng
      const packageId =
        order.items[0]?.service?._id ||
        order.items[0]?.service ||
        order.items[0]?.testPackage?._id ||
        order.items[0]?.testPackage;
      if (!packageId) {
        setError("Không tìm thấy gói xét nghiệm trong đơn hàng!");
        return;
      }
      const res = await fetch(
        `https://mirava-f0rz.onrender.com/api/test-registrations/available-doctors?packageId=${packageId}&date=${order.appointmentDate}&time=${order.timeSlot}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) setAvailableDoctors(data.data);
      else setError(data.message || "Không lấy được danh sách bác sĩ");
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bác sĩ:", err);
      setError("Lỗi khi lấy danh sách bác sĩ cho gói xét nghiệm");
    }
  };

  // Khi bấm xác nhận đơn hàng mà chưa có doctorId
  const handleSelectDoctor = (order: Order) => {
    setSelectingOrder(order);
    setShowDoctorModal(true);
    fetchAvailableDoctors(order);
  };

  // Khi xác nhận chọn bác sĩ
  const handleConfirmWithDoctor = async () => {
    if (!selectingOrder || !selectedDoctorId) return;
    console.log("Xác nhận với doctorId:", selectedDoctorId);
    setShowDoctorModal(false);
    await handleConfirmOrder(selectingOrder._id, selectedDoctorId);
  };
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error trước khi fetch
      const token = localStorage.getItem("accessToken");

      let url = `https://mirava-f0rz.onrender.com/api/orders?page=${currentPage}&limit=10`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        const data = await response.json();
        setError(data.message || "Lỗi khi tải đơn hàng");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Lỗi không xác định khi tải đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: string, doctorId?: string) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;
    // Nếu chưa có doctorId và không truyền doctorId mới => mở modal chọn bác sĩ
    if (!order.doctorId && !doctorId) {
      handleSelectDoctor(order);
      return;
    }

    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xác nhận đơn hàng này và tạo kế hoạch điều trị?"
      )
    )
      return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `https://mirava-f0rz.onrender.com/api/orders/${orderId}/confirm-and-create-treatment-plan`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctorId: doctorId || order.doctorId,
            // note: "Ghi chú nếu cần"
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.data && Array.isArray(data.data.testRegistrations)) {
          if (data.data.testRegistrations.length === 0) {
            console.warn("⚠️ Không có testRegistrations nào được trả về.");
          }

          const updatePromises = data.data.testRegistrations.map(
            async (reg: any) => {
              if (!reg?._id) {
                console.warn("⚠️ Thiếu _id trong testRegistration:", reg);
                return;
              }

              const url = `https://mirava-f0rz.onrender.com/api/test-registrations/${reg._id}/status`;
              const payload = { status: "completed" };

              console.log("🔥 Gửi PUT để cập nhật status:", { url, payload });

              const response = await fetch(url, {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              const resJson = await response.json();
              console.log("📥 Kết quả từ server:", resJson);

              if (!response.ok || !resJson.success) {
                console.error(
                  `❌ Cập nhật thất bại cho ${reg._id} – status: ${response.status}`,
                  resJson.message
                );
              }
            }
          );

          await Promise.all(updatePromises);
        }
        alert("Xác nhận đơn hàng và tạo kế hoạch điều trị thành công!");
        fetchOrders(); // Refresh lại danh sách
      } else {
        setError(data.message || "Xác nhận đơn hàng thất bại");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Lỗi không xác định khi xác nhận đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Chờ xử lý", class: "status-pending" },
      paid: { label: "Đã thanh toán", class: "status-paid" },
      completed: { label: "Hoàn thành", class: "status-completed" },
      cancelled: { label: "Đã hủy", class: "status-cancelled" },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      class: "status-default",
    };

    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const filteredOrders = orders.filter(
    (order) =>
      (order.orderCode?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (
        order.user?.userName?.toLowerCase() ||
        order.customerInfo?.userName?.toLowerCase() ||
        ""
      ).includes(searchTerm.toLowerCase()) ||
      (order.user?.patientCode?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );
  if (loading) {
    return (
      <div className="order-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-management">
        <div className="loading-container">
          <p style={{ color: "red", fontWeight: 600 }}>Lỗi: {error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="om-container">
      {loading ? (
        <div className="om-loading">
          <div className="om-loading-spinner"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      ) : error ? (
        <div className="om-loading">
          <p className="om-error-message">Lỗi: {error}</p>
        </div>
      ) : (
        <>
          <div className="om-stats">
            <div className="om-stat-card">
              <div className="om-stat-icon">
                <Search size={28} />
              </div>
              <div className="om-stat-content">
                <h3>Tổng đơn hàng</h3>
                <p>{orders.length}</p>
              </div>
            </div>
            <div className="om-stat-card">
              <div className="om-stat-icon pending">
                <Filter size={28} />
              </div>
              <div className="om-stat-content">
                <h3>Chờ xử lý</h3>
                <p>
                  {orders.filter((o) => o.orderStatus === "pending").length}
                </p>
              </div>
            </div>
            <div className="om-stat-card">
              <div className="om-stat-icon completed">
                <Eye size={28} />
              </div>
              <div className="om-stat-content">
                <h3>Đã thanh toán</h3>
                <p>{orders.filter((o) => o.orderStatus === "paid").length}</p>
              </div>
            </div>
          </div>

          <div className="om-controls">
            <div className="om-search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="om-filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="paid">Đã thanh toán</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="om-table-container">
            {filteredOrders.length === 0 ? (
              <div className="om-no-data">
                <p>Không có đơn hàng nào được tìm thấy</p>
              </div>
            ) : (
              <div className="om-table-wrapper">
                <table className="om-table">
                  <thead>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Khách hàng</th>
                      <th>Dịch vụ</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày hẹn khám</th>
                      <th>Bác sĩ</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <span className="om-order-code">
                            {order.orderCode}
                          </span>
                        </td>
                        <td>
                          <div className="om-customer-info">
                            <span className="om-customer-name">
                              {order.user?.userName ||
                                order.customerInfo?.userName ||
                                "N/A"}
                            </span>
                            <span className="om-patient-code">
                              {order.user?.patientCode || ""}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="om-services-list">
                            {order.items.map((item, index) => (
                              <div key={index} className="om-service-item">
                                {item.service?.name
                                  ? `${item.service.name} x${item.quantity}`
                                  : item.testPackage?.name
                                  ? `${item.testPackage.name} x${item.quantity}`
                                  : item.serviceName
                                  ? `${item.serviceName} x${item.quantity}`
                                  : item.testPackageName
                                  ? `${item.testPackageName} x${item.quantity}`
                                  : "Không xác định"}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="om-price-cell">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td>
                          <span
                            className={`om-status-badge ${getStatusBadge(
                              order.orderStatus
                            ).props.className?.replace("status-badge ", "")}`}
                          >
                            {getStatusBadge(order.orderStatus).props.children}
                          </span>
                        </td>
                        <td className="om-date-cell">
                          {order.appointmentDate
                            ? new Date(
                                order.appointmentDate
                              ).toLocaleDateString("vi-VN")
                            : "Chưa đặt lịch"}
                        </td>
                        <td>
                          {order.doctorId ? (
                            <span className="doctor-name">
                              {order.doctorId.user.userName || "Chưa có bác sĩ"}
                            </span>
                          ) : (
                            <button
                              className="select-doctor-btn"
                              onClick={() => handleSelectDoctor(order)}
                            >
                              Chọn bác sĩ
                            </button>
                          )}
                        </td>
                        <td>
                          <div className="om-action-buttons">
                            <button
                              className="om-action-btn om-view-btn"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            {order.orderStatus === "pending" && (
                              <button
                                className="om-action-btn om-confirm-btn"
                                title="Xác nhận & tạo kế hoạch"
                                onClick={() => handleConfirmOrder(order._id)}
                              >
                                <Check size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="om-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`om-page-btn ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}

      {showDoctorModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Chọn bác sĩ rảnh cho đơn hàng</h3>
            {availableDoctors.length === 0 ? (
              <p style={{ margin: "16px 0" }}>
                Không có bác sĩ nào rảnh vào thời gian này.
              </p>
            ) : (
              <ul style={{ maxHeight: 250, overflowY: "auto", padding: 0 }}>
                {availableDoctors.map((doc: Doctor) => (
                  <li
                    key={doc._id}
                    className="doctor-item"
                    style={{ marginBottom: 8, listStyle: "none" }}
                  >
                    <label style={{ cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="doctor"
                        value={doc._id}
                        checked={selectedDoctorId === doc._id}
                        onChange={() => setSelectedDoctorId(doc._id)}
                        style={{ marginRight: 8 }}
                      />
                      {doc.user?.userName || "Không có tên"}{" "}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-actions">
              <button
                disabled={!selectedDoctorId}
                onClick={handleConfirmWithDoctor}
                className="modal-confirm-btn"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="modal-cancel-btn"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
