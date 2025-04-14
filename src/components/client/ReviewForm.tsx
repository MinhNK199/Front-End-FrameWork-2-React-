"use client"

import type React from "react"

import { useState } from "react"
import { FaStar } from "react-icons/fa"
import type { CreateReviewPayload } from "../../interface/review"
import { IAuthUser } from "../../interface/auth"
import ReviewService from "./services/review-service"

interface ReviewFormProps {
  productId: number
  user: IAuthUser
  onReviewSubmitted: () => void
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, user, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [hover, setHover] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá")
      return
    }

    if (comment.trim().length < 10) {
      setError("Nội dung đánh giá phải có ít nhất 10 ký tự")
      return
    }

    setLoading(true)
    setError("")

    try {
      const reviewData: CreateReviewPayload = {
        productId,
        userId: user.id,
        userName: user.name,
        // userAvatar: user.avatar || undefined,
        rating,
        comment,
      }

      await ReviewService.createReview(reviewData)
      setComment("")
      setRating(5)
      setShowForm(false)
      onReviewSubmitted()
    } catch (error) {
      console.error("Error submitting review:", error)
      setError("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Viết đánh giá
        </button>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1
                  return (
                    <label key={index} className="cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        className="hidden"
                        value={ratingValue}
                        onClick={() => setRating(ratingValue)}
                      />
                      <FaStar
                        className="w-8 h-8 mr-1"
                        color={ratingValue <= (hover || rating) ? "#FBBF24" : "#D1D5DB"}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      />
                    </label>
                  )
                })}
                <span className="ml-2 text-sm text-gray-500">
                  {rating === 1
                    ? "Rất không hài lòng"
                    : rating === 2
                      ? "Không hài lòng"
                      : rating === 3
                        ? "Bình thường"
                        : rating === 4
                          ? "Hài lòng"
                          : "Rất hài lòng"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung đánh giá
              </label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Tối thiểu 10 ký tự</p>
            </div>

            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors disabled:bg-red-300"
              >
                {loading ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default ReviewForm
