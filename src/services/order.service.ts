import axiosInstance from "./MainService";

export interface Order {
  _id: string;
  orderCode: string;
  items: Array<{
    service: {
      name: string;
      price: number;
      // Có thể có thêm các trường khác như method, imageUrl...
    };
    quantity: number;
    subtotal: number;
  }>;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  appointmentDate?: string;
  timeSlot?: string;
  createdAt: string;
  updatedAt: string;
}

export const getOrderHistory = async (): Promise<Order[]> => {
  try {
    const response = await axiosInstance.get("/api/orders/my-orders");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
};
