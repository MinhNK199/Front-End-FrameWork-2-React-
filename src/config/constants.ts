// API URL
export const API_URL = "http://localhost:4000"

// Shipping cost
export const SHIPPING_COST = 30000 // 30,000 VND

// Free shipping threshold
export const FREE_SHIPPING_THRESHOLD = 2000000 // 2,000,000 VND

// Payment methods
export const PAYMENT_METHODS = [
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng (COD)",
    description: "Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng",
    icon: "cash",
  },
  {
    id: "bank_transfer",
    name: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản đến tài khoản ngân hàng của chúng tôi",
    icon: "bank",
  },
  {
    id: "credit_card",
    name: "Thẻ tín dụng / Ghi nợ",
    description: "Thanh toán an toàn với thẻ của bạn",
    icon: "credit-card",
  },
  {
    id: "momo",
    name: "Ví MoMo",
    description: "Thanh toán qua ví điện tử MoMo",
    icon: "wallet",
  },
]

// Order status
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
}

// Order status display names
export const ORDER_STATUS_DISPLAY = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy",
}

// Order status colors
export const ORDER_STATUS_COLORS = {
  pending: "blue",
  processing: "orange",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
}
