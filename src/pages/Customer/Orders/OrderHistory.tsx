import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { getOrderHistory } from "@/services/order.service";

interface Order {
  _id: string;
  orderCode: string;
  appointmentDate?: string;
  timeSlot?: string;
  totalAmount: number;
  items: Array<{
    service?: {
      name: string;
    };
    testPackage?: {
      name: string;
    };
    serviceName?: string;
  }>;
  orderStatus: string;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const getTextStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "Đang chờ thanh toán";
    case "paid":
      return "Đã thanh toán";
    default:
      return "Chưa xác định";
  }
};
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function CustomizedTables() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrderHistory();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch order history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">STT</StyledTableCell>
            <StyledTableCell align="center">Mã đơn hàng</StyledTableCell>
            <StyledTableCell align="center">Tên dịch vụ</StyledTableCell>
            <StyledTableCell align="center">Ngày hẹn khám</StyledTableCell>
            <StyledTableCell align="center">Trạng thái</StyledTableCell>
            <StyledTableCell align="center">Tổng giá</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order, index) => (
            <StyledTableRow key={order._id}>
              <StyledTableCell align="center" component="th" scope="row">
                {index + 1}
              </StyledTableCell>
              <StyledTableCell align="center">
                {order.orderCode}
              </StyledTableCell>
              <StyledTableCell align="center">
                {order.items
                  .map((item) => {
                    // Ưu tiên service, nếu không có thì lấy testPackage
                    const serviceName =
                      item.service?.name ||
                      item.testPackage?.name ||
                      item.serviceName;
                    return serviceName || "Không có tên";
                  })
                  .join(", ")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {order.appointmentDate || "Chưa có ngày hẹn"} |{" "}
                {order.timeSlot || "Chưa có khung giờ"}
              </StyledTableCell>
              <StyledTableCell align="center">
                {getTextStatus(order.orderStatus) || "Chưa xác định"}
              </StyledTableCell>
              <StyledTableCell align="center">
                {order.totalAmount}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
