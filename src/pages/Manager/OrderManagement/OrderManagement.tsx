import React, { useState, useEffect } from "react";
import { Search, Filter, Eye } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null); // Thêm state error
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    } catch (error: any) {
      setError(error.message || "Lỗi không xác định khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    // Tìm đơn hàng theo id để lấy doctorId
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
            // note: "Ghi chú nếu cần"
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        alert("Xác nhận đơn hàng và tạo kế hoạch điều trị thành công!");
        fetchOrders(); // Refresh lại danh sách
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
    <div className="order-management">
      <div className="order-header">
        <h1>Quản lý đơn hàng</h1>
        <div className="order-stats">
          <div className="stat-card">
            <h3>Tổng đơn hàng</h3>
            <p>{orders.length}</p>
          </div>
          <div className="stat-card">
            <h3>Chờ xử lý</h3>
            <p>{orders.filter((o) => o.orderStatus === "pending").length}</p>
          </div>
          <div className="stat-card">
            <h3>Đã thanh toán</h3>
            <p>{orders.filter((o) => o.orderStatus === "paid").length}</p>
          </div>
        </div>
      </div>

      <div className="order-controls">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <Filter size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="paid">Đã thanh toán</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="orders-table-container">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
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
                <th>Ngày tạo</th>
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
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
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
                          className="action-btn confirm-btn"
                          style={{
                            background: "#10b981",
                            color: "#fff",
                            marginLeft: 8,
                          }}
                          title="Xác nhận & tạo kế hoạch"
                          onClick={() => handleConfirmOrder(order._id)}
                        >
                          Xác nhận
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? "active" : ""}`}
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
