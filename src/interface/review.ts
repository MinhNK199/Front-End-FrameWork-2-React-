export interface ProductReview {
  id?: number
  productId: number
  userId: number
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  date: string
  helpful: number
  replies?: ReviewReply[]
}

export interface ReviewReply {
  id?: number
  reviewId: number
  userId: number
  userName: string
  userAvatar?: string
  comment: string
  date: string
}

export interface CreateReviewPayload {
  productId: number
  userId: number
  userName: string
  userAvatar?: string
  rating: number
  comment: string
}
