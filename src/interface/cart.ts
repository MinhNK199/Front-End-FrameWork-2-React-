import type { Product } from "./product"

export interface CartItem {
  id: number
  productId: number
  userId: number
  quantity: number
  color: string
  size: string
  product?: Product
}

export interface AddToCartPayload {
  productId: number
  userId: number
  quantity: number
  color: string
  size: string
}

export interface CartSummary {
  totalItems: number
  subtotal: number
  shipping: number
  discount: number
  total: number
}
