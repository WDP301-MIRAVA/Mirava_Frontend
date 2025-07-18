import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Package, Clock, CheckCircle } from "lucide-react";
import "./OrderManagement.css";

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
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const handleConfirmOrder = async (orderId: string) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order?.doctorId) {
      setError(
        "Đơn hàng chưa có bác sĩ. Vui lòng cập nhật doctorId trước khi xác nhận!"
      );
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
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="om-order-code">{order.orderCode}</div>
                    </td>
                    <td>
                      <div className="om-customer-info">
                        <div className="om-customer-name">
                          {order.user?.userName ||
                            order.customerInfo?.userName ||
                            "N/A"}
                        </div>
                        <div className="om-patient-code">
                          {order.user?.patientCode || ""}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="om-services-list">
                        {order.items.map((item, index) => (
                          <div key={index} className="om-service-item">
                            {item.service.name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="om-price-cell">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </td>
                    <td>{getStatusBadge(order.orderStatus)}</td>
                    <td>
                      <div className="om-date-cell">
                        {order.appointmentDate
                          ? new Date(order.appointmentDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Chưa đặt lịch"}
                      </div>
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
    </div>
  );
};

export default OrderManagement;
