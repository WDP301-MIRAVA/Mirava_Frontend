import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { BarChart } from "@mui/x-charts/BarChart";
import { getOrders } from "@/services/order.service";

const Dashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
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
    createdAt: new Date(order.createdAt).toLocaleString("vi-VN"),
    total: order.totalAmount,
    status: order.orderStatus,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "paid":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f9fafc", minHeight: "100vh" }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Dashboard
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Tổng đơn hàng
              </Typography>
              <Typography variant="h5" mt={1} fontWeight={600}>
                <ShoppingCartIcon sx={{ mr: 1, color: "#0ea5e9" }} />
                {orders.length.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Tổng doanh thu
              </Typography>
              <Typography variant="h5" mt={1} fontWeight={600}>
                <MonetizationOnIcon sx={{ mr: 1, color: "#10b981" }} />
                {totalRevenue.toLocaleString()} đ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Doanh thu theo ngày
          </Typography>
          <BarChart
            height={300}
            xAxis={[{ scaleType: "band", data: chartData.map((d) => d.date) }]}
            series={[
              {
                data: chartData.map((d) => d.total),
                label: "Doanh thu",
                color: "#4ECDC4",
              },
            ]}
            grid={{ vertical: true }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách đơn hàng
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã đơn</TableCell>
                    <TableCell>Tên khách hàng</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Tổng tiền</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSource.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>{row.createdAt}</TableCell>
                      <TableCell>{row.total?.toLocaleString()} đ</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            row.status === "pending"
                              ? "Đang xử lý"
                              : row.status === "paid"
                              ? "Đã thanh toán"
                              : row.status === "cancelled"
                              ? "Đã hủy"
                              : row.status
                          }
                          color={getStatusColor(row.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
