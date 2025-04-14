import axios from "axios";
import { CreateOrderPayload, Order, OrderStatusUpdate } from "../../../interface/order";
import { API_URL } from "../../../config/constants";
import CartService from "./cart-service";

const api = axios.create({
  baseURL: API_URL,
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Token gửi trong yêu cầu:", token || "Không có token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("Không tìm thấy token trong localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Yêu cầu bị từ chối (401 Unauthorized). Kiểm tra token.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const OrderService = {
  // Lấy danh sách đơn hàng của người dùng
  getUserOrders: async (userId: number): Promise<Order[]> => {
    try {
      const response = await api.get("/orders", {
        params: {
          userId,
          _sort: "createdAt",
          _order: "desc",
        },
      });
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching user orders:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      return [];
    }
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (orderId: number): Promise<Order | null> => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data || null;
    } catch (error: any) {
      console.error("Error fetching order details:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      return null;
    }
  },

  // Tạo đơn hàng mới
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    try {
      const order: Order = {
        ...payload,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Dữ liệu đơn hàng gửi đi:", order);

      const response = await api.post("/orders", order);

      // Xóa giỏ hàng sau khi đặt hàng thành công
      try {
        await CartService.clearUserCart(payload.userId);
      } catch (cartError) {
        console.warn("Không thể xóa giỏ hàng:", cartError);
      }

      return response.data;
    } catch (error: any) {
      console.error("Error creating order:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      throw new Error(
        error.response?.data?.message || "Không thể tạo đơn hàng. Vui lòng thử lại."
      );
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId: number): Promise<Order | null> => {
    try {
      const order = await OrderService.getOrderById(orderId);
      if (!order) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      // Chỉ cho phép hủy đơn hàng ở trạng thái pending hoặc processing
      if (order.status !== "pending" && order.status !== "processing") {
        throw new Error("Không thể hủy đơn hàng ở trạng thái hiện tại");
      }

      const updateData: OrderStatusUpdate = {
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      };

      const response = await api.patch(`/orders/${orderId}`, updateData);
      return response.data || null;
    } catch (error: any) {
      console.error("Error cancelling order:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      throw new Error(
        error.response?.data?.message || "Không thể hủy đơn hàng."
      );
    }
  },
};

export default OrderService;