import axios from "axios";
import { AddToCartPayload, CartItem } from "../../../interface/cart";
import { API_URL } from "../../../config/constants";

const api = axios.create({
  baseURL: API_URL,
});

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

const CartService = {
  getUserCart: async (userId: number): Promise<CartItem[]> => {
    try {
      const response = await api.get("/carts", {
        params: {
          userId,
          _expand: "product",
        },
      });
      console.log("Response từ GET /carts:", response.data);

      // Xử lý response
      const data = response.data.data || {};
      const items = data.Items || [];

      // Chuyển đổi Items thành CartItem[]
      const cartItems: CartItem[] = items
        .filter((item: any) => item.productId) // Loại bỏ phần tử rỗng
        .map((item: any, index: number) => ({
          id: `${data.id}-${index}`, // Tạo ID tạm thời
          userId: data.userId || userId,
          productId: item.productId.id,
          quantity: item.quantity || 1,
          color: item.productId.color || "N/A",
          size: item.size || "N/A",
          product: item.productId || null, // Sử dụng productId làm product
        }));

      return cartItems;
    } catch (error: any) {
      console.error("Error fetching user cart:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      return []; // Trả về mảng rỗng thay vì throw error
    }
  },

  addToCart: async (payload: AddToCartPayload): Promise<CartItem> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      }

      console.log("Dữ liệu gửi đi:", payload);

      const newCartItem = {
        userId: payload.userId,
        productId: payload.productId,
        quantity: payload.quantity,
        color: payload.color,
        size: payload.size,
        addedAt: new Date().toISOString(),
      };

      const response = await api.post("/carts", newCartItem);
      return response.data;
    } catch (error: any) {
      console.error("Error adding to cart:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        payload,
      });
      throw new Error(
        error.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng."
      );
    }
  },

  updateCartItemQuantity: async (
    cartItemId: number,
    quantity: number
  ): Promise<CartItem> => {
    try {
      const response = await api.patch(`/carts/${cartItemId}`, { quantity });
      return response.data;
    } catch (error: any) {
      console.error("Error updating cart item quantity:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      throw new Error(
        error.response?.data?.message || "Không thể cập nhật số lượng."
      );
    }
  },

  removeFromCart: async (cartItemId: number): Promise<void> => {
    try {
      await api.delete(`/carts/${cartItemId}`);
    } catch (error: any) {
      console.error("Error removing from cart:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      throw new Error(
        error.response?.data?.message || "Không thể xóa sản phẩm khỏi giỏ hàng."
      );
    }
  },

  clearUserCart: async (userId: number): Promise<void> => {
    try {
      const cartItems = await CartService.getUserCart(userId);
      const deletePromises = cartItems.map((item) =>
        CartService.removeFromCart(item.id || 0)
      );
      await Promise.all(deletePromises);
    } catch (error: any) {
      console.error("Error clearing user cart:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      throw new Error(
        error.response?.data?.message || "Không thể xóa toàn bộ giỏ hàng."
      );
    }
  },

  calculateCartTotal: (cartItems: CartItem[]): number => {
    return cartItems.reduce((total, item) => {
      const price = item.product ? item.product.price : 0;
      return total + price * item.quantity;
    }, 0);
  },
};

export default CartService;