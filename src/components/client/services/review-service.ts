import axios from "axios"
import { CreateReviewPayload, ProductReview } from "../../../interface/review"
import { API_URL } from "../../../config/constants"


const ReviewService = {
  // Lấy tất cả đánh giá của một sản phẩm
  getProductReviews: async (productId: number): Promise<ProductReview[]> => {
    try {
      const response = await axios.get(`${API_URL}/reviews`, {
        params: {
          productId,
          _sort: "date",
          _order: "desc",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching product reviews:", error)
      throw error
    }
  },

  // Tạo đánh giá mới
  createReview: async (reviewData: CreateReviewPayload): Promise<ProductReview> => {
    try {
      const newReview: ProductReview = {
        ...reviewData,
        date: new Date().toISOString(),
        helpful: 0,
      }

      const response = await axios.post(`${API_URL}/reviews`, newReview)
      return response.data
    } catch (error) {
      console.error("Error creating review:", error)
      throw error
    }
  },

  // Đánh dấu đánh giá là hữu ích
  markReviewAsHelpful: async (reviewId: number): Promise<ProductReview> => {
    try {
      // Lấy đánh giá hiện tại
      const reviewResponse = await axios.get(`${API_URL}/reviews/${reviewId}`)
      const review = reviewResponse.data

      // Tăng số lượng helpful lên 1
      const updatedReview = {
        ...review,
        helpful: review.helpful + 1,
      }

      // Cập nhật đánh giá
      const response = await axios.put(`${API_URL}/reviews/${reviewId}`, updatedReview)
      return response.data
    } catch (error) {
      console.error("Error marking review as helpful:", error)
      throw error
    }
  },

  // Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
  hasUserReviewed: async (productId: number, userId: number): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_URL}/reviews`, {
        params: {
          productId,
          userId,
        },
      })
      return response.data.length > 0
    } catch (error) {
      console.error("Error checking if user has reviewed:", error)
      throw error
    }
  },
}

export default ReviewService
