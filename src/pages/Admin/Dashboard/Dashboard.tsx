import React, { useEffect, useState } from "react";
import { Card, Col, Row, Table, Statistic, Typography, Tag } from "antd";
import { DollarOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Column } from "@ant-design/charts";
import "./Dashboard.css";
import { getOrders } from "@/services/order.service";

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      console.log({ res });
      setOrders(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, order) =>
      order.paymentStatus === "success" ? sum + (order.totalAmount || 0) : sum,
    0
  );

  const chartData = orders.reduce((acc: any[], order) => {
    const date = new Date(order.createdAt).toLocaleDateString("vi-VN");
    const found = acc.find((item) => item.date === date);
    if (order.paymentStatus === "success") {
      if (found) {
        found.total += order.totalAmount;
      } else {
        acc.push({ date, total: order.totalAmount });
      }
    }
    return acc;
  }, []);

  const dataSource = orders.map((order) => ({
    id: order.orderCode,
    customerName: order.customerInfo?.userName || "N/A",
    createdAt: order.createdAt,
    total: order.totalAmount,
    status: order.orderStatus,
  }));

  const columns = [
    { title: "Mã đơn", dataIndex: "id", key: "id" },
    { title: "Tên khách hàng", dataIndex: "customerName", key: "customerName" },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleString("vi-VN"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (value: number) => `${value.toLocaleString()} đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        let text = "Không xác định";

        switch (status) {
          case "pending":
            color = "orange";
            text = "Đang xử lý";
            break;
          case "paid":
            color = "green";
            text = "Đã thanh toán";
            break;
          case "cancelled":
            color = "red";
            text = "Đã hủy";
            break;
          default:
            color = "default";
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div className="dashboard-container">
      <Title level={2}>Thống kê đơn hàng</Title>

      <Row gutter={16} className="dashboard-statistics">
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng đơn hàng"
              value={orders.length}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<DollarOutlined />}
              suffix=" đ"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Biểu đồ doanh thu theo ngày" className="dashboard-chart">
        <Column
          data={chartData}
          xField="date"
          yField="total"
          xAxis={{ label: { autoHide: true, autoRotate: false } }}
          yAxis={{
            label: {
              formatter: (v: number | string) =>
                `${Number(v).toLocaleString()} đ`,
            },
          }}
          meta={{ total: { alias: "Doanh thu" } }}
          height={300}
        />
      </Card>

      <Card title="Danh sách đơn hàng" className="dashboard-table">
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
