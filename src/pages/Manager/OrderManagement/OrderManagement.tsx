import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Package, Clock, CheckCircle } from "lucide-react";
import "./OrderManagement.css";

interface Doctor {
  _id: string;
  user: {
    _id: string;
    userName: string;
  };
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
  customerInfo?: {
    userName: string;
  };
  doctorId?: string;
  items: Array<{
    service: {
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
  doctorId?: Doctor; // Thêm trường doctorId
  customerInfo?: {
    userName: string;
  };
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal chọn bác sĩ
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectingOrder, setSelectingOrder] = useState<Order | null>(null);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // Hàm lấy danh sách bác sĩ rảnh cho đơn hàng
  const fetchAvailableDoctors = async (order: Order) => {
    setAvailableDoctors([]);
    setSelectedDoctorId("");
    try {
      // Lấy packageId từ dịch vụ đầu tiên của đơn hàng
      const packageId = order.items[0]?.service?._id || order.items[0]?.service;
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
    setShowDoctorModal(false);
    await handleConfirmOrder(selectingOrder._id, selectedDoctorId);
  };
  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
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
    } catch (error: any) {
      setError(error.message || "Lỗi không xác định khi tải đơn hàng");
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
            doctorId: order.doctorId,
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        alert("Xác nhận đơn hàng và tạo kế hoạch điều trị thành công!");
        fetchOrders();
      } else {
        setError(data.message || "Xác nhận đơn hàng thất bại");
      }
    } catch (error: any) {
      setError(error.message || "Lỗi không xác định khi xác nhận đơn hàng");
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
      <span className={`om-status-badge ${statusInfo.class}`}>
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
      <div className="om-container">
        <div className="om-loading">
          <div className="om-loading-spinner"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="om-container">
        <div className="om-loading">
          <p className="om-error-message">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="om-container">
      {/* Stats Cards */}
      <div className="om-stats">
        <div className="om-stat-card">
          <div className="om-stat-icon">
            <Package size={24} />
          </div>
          <div className="om-stat-content">
            <h3>Tổng đơn hàng</h3>
            <p>{orders.length}</p>
          </div>
        </div>
        <div className="om-stat-card">
          <div className="om-stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="om-stat-content">
            <h3>Chờ xử lý</h3>
            <p>{orders.filter((o) => o.orderStatus === "pending").length}</p>
          </div>
        </div>
        <div className="om-stat-card">
          <div className="om-stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="om-stat-content">
            <h3>Đã thanh toán</h3>
            <p>{orders.filter((o) => o.orderStatus === "paid").length}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="om-controls">
        <div className="om-search-box">
          <Search size={18} />
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

      {/* Table */}
      <div className="om-table-container">
        <div className="om-table-header">
          <h2>Danh sách đơn hàng ({filteredOrders.length})</h2>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="om-no-data">
            <Package size={40} />
            <p>Không có đơn hàng nào được tìm thấy</p>
          </div>
        ) : (
          <table className="orders-table">
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
                  <td>{order.orderCode}</td>
                  <td>
                    <div className="customer-info">
                      <strong>
                        {order.user?.userName ||
                          order.customerInfo?.userName ||
                          "N/A"}
                      </strong>
                      <br />
                      <small>{order.user?.patientCode || ""}</small>
                    </div>
                  </td>
                  <td>
                    <div className="services-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="service-item">
                          {item.service.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="price-cell">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td>{getStatusBadge(order.orderStatus)}</td>
                  <td>
                    {order.appointmentDate
                      ? new Date(order.appointmentDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "Chưa đặt lịch"}
                    {/* {new Date(order.createdAt).toLocaleDateString("vi-VN")} */}
                  </td>
                  <td>
                    {order.doctorId ? (
                      <span className="doctor-name">
                        {order.doctorId.user?.userName || "Chưa có bác sĩ"}
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
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {order.orderStatus === "pending" && (

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
                            <CheckCircle size={16} />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="om-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`om-page-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
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
                {availableDoctors.map((doc: any) => (
                  <li
                    key={doc._id}
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
                      {doc.specialty ? `- ${doc.specialty}` : ""}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: 16 }}>
              <button
                disabled={!selectedDoctorId}
                onClick={handleConfirmWithDoctor}
                style={{
                  background: "#10b981",
                  color: "#fff",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 4,
                  marginRight: 8,
                  cursor: selectedDoctorId ? "pointer" : "not-allowed",
                }}
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowDoctorModal(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  background: "#fff",
                  cursor: "pointer",
                }}
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
