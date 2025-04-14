export interface OrderItem {
  productId: number
  quantity: number
  price: number
  color: string
  size: string
  productName: string
  productImage: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  city: string
  district: string
  ward: string
  notes?: string
}

export interface Order {
  id?: number
  userId: number
  items: OrderItem[]
  totalAmount: number
  shippingAddress: ShippingAddress
  paymentMethod: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  userId: number
  items: OrderItem[]
  totalAmount: number
  shippingAddress: ShippingAddress
  paymentMethod: string
}

export interface OrderStatusUpdate {
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  updatedAt: string
}

export interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: string
}
