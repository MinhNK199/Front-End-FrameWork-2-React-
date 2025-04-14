"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  FaStar,
  FaHeart,
  FaMinus,
  FaPlus,
  FaTruck,
  FaUndoAlt,
  FaShoppingCart,
  FaCheck,
  FaShare,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaThumbsUp,
} from "react-icons/fa"

import type { ProductReview } from "../../interface/review"
import { useAuth } from "../context/authContext"
import ReviewService from "./services/review-service"
import CartService from "./services/cart-service"
import ReviewForm from "./ReviewForm"

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
  id: number
  name: string
  categoryId: number
  oldPrice: number
  price: number
  color: string
  stockStatus: boolean
  rating: number
  image: string
  images?: string[] // Thêm mảng images để lưu trữ nhiều ảnh
  sku: string
  brand: string
  weight: number
  description: string
  type: string
  parent: number
  availableColors?: string[]
  availableSizes?: string[]
  specifications?: Record<string, string> // Thêm thông số kỹ thuật
}

// Định nghĩa kiểu dữ liệu cho danh mục
interface Category {
  id: number
  name: string
  icon: string
  description: string
}

// Định nghĩa kiểu dữ liệu cho database
interface Database {
  products: Product[]
  categories: Category[]
  carts: any[]
  users: any[]
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [mainImage, setMainImage] = useState("")
  const [originalMainImage, setOriginalMainImage] = useState("")
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("description") // Tab hiện tại: description, specifications, reviews
  const [isInWishlist, setIsInWishlist] = useState(false) // Trạng thái yêu thích
  const [showShareOptions, setShowShareOptions] = useState(false) // Hiển thị tùy chọn chia sẻ
  const [addedToCart, setAddedToCart] = useState(false) // Thông báo đã thêm vào giỏ hàng
  const [addingToCart, setAddingToCart] = useState(false) // Trạng thái đang thêm vào giỏ hàng
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  // Danh sách màu để hiển thị tên màu
  const colorOptions = [
    { label: "Đen", value: "black" },
    { label: "Trắng", value: "white" },
    { label: "Xanh dương", value: "blue" },
    { label: "Xanh lá", value: "green" },
    { label: "Đỏ", value: "red" },
    { label: "Vàng", value: "yellow" },
    { label: "Xám", value: "gray" },
    { label: "Hồng", value: "pink" },
    { label: "Tím", value: "purple" },
    { label: "Cam", value: "orange" },
    { label: "Nâu", value: "brown" },
    { label: "Be", value: "beige" },
    { label: "Xanh ngọc", value: "turquoise" },
    { label: "Xanh oliu", value: "olive" },
    { label: "Đồng", value: "bronze" },
    { label: "Bạc", value: "silver" },
    { label: "Vàng ánh kim", value: "gold" },
    { label: "Xanh navy", value: "navy" },
    { label: "Hồng phấn", value: "lightpink" },
    { label: "Xám đậm", value: "darkgray" },
  ]

  // Hàm định dạng giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Hàm lấy tên danh mục từ categoryId
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : ""
  }

  // Tăng số lượng sản phẩm
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  // Giảm số lượng sản phẩm
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  // Tính giảm giá phần trăm
  const calculateDiscount = (oldPrice: number, price: number) => {
    if (oldPrice <= price) return 0
    return Math.round(((oldPrice - price) / oldPrice) * 100)
  }

  // Xử lý khi hover vào thumbnail
  const handleThumbnailHover = (imageUrl: string) => {
    setMainImage(imageUrl)
  }

  // Xử lý khi click vào thumbnail
  const handleThumbnailClick = (imageUrl: string) => {
    setMainImage(imageUrl)
  }

  // Xử lý khi click vào ảnh chính để reset về ảnh ban đầu
  const handleMainImageClick = () => {
    setMainImage(originalMainImage)
  }

  // Lấy đánh giá sản phẩm
  const fetchReviews = async () => {
    if (!productId) return

    setLoadingReviews(true)
    try {
      const productReviews = await ReviewService.getProductReviews(Number(productId))
      setReviews(productReviews)

      // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
      if (isAuthenticated && user) {
        const hasReviewed = await ReviewService.hasUserReviewed(Number(productId), user.id)
        setHasReviewed(hasReviewed)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoadingReviews(false)
    }
  }

  // Xử lý đánh dấu đánh giá là hữu ích
  const handleMarkHelpful = async (reviewId: number) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/productdetail/${productId}` } })
      return
    }

    try {
      await ReviewService.markReviewAsHelpful(reviewId)
      // Cập nhật lại danh sách đánh giá
      fetchReviews()
    } catch (error) {
      console.error("Error marking review as helpful:", error)
    }
  }

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      navigate("/login", { state: { from: `/productdetail/${productId}` } });
      return;
    }

    if (!product) return;

    if (!selectedColor) {
      alert("Vui lòng chọn màu sắc");
      return;
    }

    if (
      product.availableSizes &&
      product.availableSizes.length > 0 &&
      !selectedSize
    ) {
      alert("Vui lòng chọn kích thước");
      return;
    }

    // Debug token và user
    const token = localStorage.getItem("token");
    console.log("Token in handleAddToCart:", token);
    console.log("User in handleAddToCart:", user);

    try {
      setAddingToCart(true);

      await CartService.addToCart({
        productId: product.id,
        userId: user.id,
        quantity: quantity,
        color: selectedColor,
        size: selectedSize || "M",
      });

      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error in handleAddToCart:", error);
      alert(error.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng");
    } finally {
      setAddingToCart(false);
    }
  };
  // Xử lý mua ngay
  const handleBuyNow = async () => {
    if (!isAuthenticated || !user) {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      navigate("/login", { state: { from: `/productdetail/${productId}` } })
      return
    }

    try {
      await handleAddToCart()
      navigate("/cart")
    } catch (error) {
      console.error("Lỗi khi mua ngay:", error)
    }
  }

  // Xử lý thêm/xóa khỏi danh sách yêu thích
  const toggleWishlist = () => {
    if (!isAuthenticated || !user) {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      navigate("/login", { state: { from: `/productdetail/${productId}` } })
      return
    }

    // Trong thực tế, bạn sẽ gọi API để thêm/xóa khỏi danh sách yêu thích
    setIsInWishlist(!isInWishlist)
  }

  // Render stars for ratings
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`} />
        ))}
        <span className="ml-2 text-gray-500">({rating})</span>
      </div>
    )
  }

  // Lấy tên màu từ mã màu
  const getColorName = (colorValue: string) => {
    const color = colorOptions.find((c) => c.value === colorValue)
    return color ? color.label : colorValue
  }

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true)
      try {
        const response = await fetch("/db.json")
        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }
        const data: Database = await response.json()

        // Lưu danh sách danh mục
        setCategories(data.categories || [])

        // Tìm sản phẩm theo ID
        const foundProduct = data.products.find((p) => p.id === Number(productId))

        if (foundProduct) {
          // Thêm thông số kỹ thuật giả lập
          const productWithSpecs = {
            ...foundProduct,
            specifications: {
              "Thương hiệu": foundProduct.brand,
              "Mã sản phẩm": foundProduct.sku,
              "Trọng lượng": `${foundProduct.weight}g`,
              "Kích thước": "10 x 5 x 2 cm",
              "Xuất xứ": "Việt Nam",
              "Bảo hành": "12 tháng",
            },
          }

          setProduct(productWithSpecs)

          // Xử lý ảnh chính và thumbnails
          const mainImg = productWithSpecs.image
          setMainImage(mainImg)
          setOriginalMainImage(mainImg)

          // Nếu có mảng images, sử dụng nó làm thumbnails
          if (productWithSpecs.images && productWithSpecs.images.length > 0) {
            setThumbnails(productWithSpecs.images)
          } else {
            // Nếu không có mảng images, chỉ sử dụng ảnh chính
            setThumbnails([mainImg])
          }

          // Thiết lập màu và kích thước mặc định
          if (productWithSpecs.availableColors && productWithSpecs.availableColors.length > 0) {
            setSelectedColor(productWithSpecs.availableColors[0])
          } else {
            setSelectedColor(productWithSpecs.color || "red")
          }

          if (productWithSpecs.availableSizes && productWithSpecs.availableSizes.length > 0) {
            setSelectedSize(productWithSpecs.availableSizes[0])
          }

          // Tìm các sản phẩm liên quan (cùng danh mục, khác ID)
          const related = data.products
            .filter((p) => p.categoryId === productWithSpecs.categoryId && p.id !== productWithSpecs.id)
            .slice(0, 4) // Lấy tối đa 4 sản phẩm liên quan

          setRelatedProducts(related)
        }
      } catch (error) {
        console.error("Error loading product details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProductDetails()
      fetchReviews()
    }
  }, [productId, isAuthenticated, user])

  // Khi chuyển tab sang đánh giá, tải lại đánh giá
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews()
    }
  }, [activeTab])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
        <p className="mb-8">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link
          to="/"
          className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
        >
          Quay lại trang chủ
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Thông báo đã thêm vào giỏ hàng */}
      {addedToCart && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center">
          <FaCheck className="mr-2" />
          Đã thêm vào giỏ hàng
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-red-500">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${product.categoryId}`} className="hover:text-red-500">
          {getCategoryName(product.categoryId)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-16">
        {/* Left: Product Images */}
        <div className="flex md:w-1/2 gap-4">
          {/* Thumbnails (Vertical) */}
          <div className="flex flex-col gap-4">
            {thumbnails.map((thumb, index) => (
              <div
                key={index}
                className={`w-28 h-28 border rounded-md overflow-hidden cursor-pointer transition-all ${mainImage === thumb ? "border-red-500 shadow-md" : "border-gray-200 hover:border-red-500"
                  }`}
                onMouseEnter={() => handleThumbnailHover(thumb)}
                onClick={() => handleThumbnailClick(thumb)}
              >
                <img
                  src={thumb || "/placeholder.svg?height=200&width=200"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div
            className="flex-1 bg-gray-50 rounded-lg p-4 flex items-center justify-center cursor-pointer relative group"
            onClick={handleMainImageClick}
          >
            <img
              src={mainImage || "/placeholder.svg?height=400&width=400"}
              alt={product.name}
              className="max-w-full max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-300"
            />

            {/* Discount Badge */}
            {product.oldPrice > product.price && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{calculateDiscount(product.oldPrice, product.price)}%
              </div>
            )}

            {/* Share Button */}
            <div className="absolute top-4 right-4">
              <div className="relative">
                <button
                  className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowShareOptions(!showShareOptions)
                  }}
                >
                  <FaShare className="text-gray-600" />
                </button>

                {/* Share Options */}
                {showShareOptions && (
                  <div className="absolute right-0 mt-2 bg-white rounded-md shadow-lg p-2 flex space-x-2">
                    <button className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600">
                      <FaFacebook />
                    </button>
                    <button className="p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500">
                      <FaTwitter />
                    </button>
                    <button className="p-2 rounded-full bg-pink-600 text-white hover:bg-pink-700">
                      <FaInstagram />
                    </button>
                    <button className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800">
                      <FaLinkedin />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          <div className="flex items-center gap-4 mb-3">
            {renderRatingStars(product.rating)}
            <span className="text-sm text-gray-500 border-l border-gray-300 pl-4">
              ({reviews.length || 0} Đánh giá)
            </span>
            <span className={`text-sm ${product.stockStatus ? "text-green-500" : "text-red-500"}`}>
              {product.stockStatus ? "| Còn hàng" : "| Hết hàng"}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-red-500">{formatPrice(product.price)}</span>
            {product.oldPrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                  Tiết kiệm {formatPrice(product.oldPrice - product.price)}
                </span>
              </>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Brand & SKU */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 mb-6 text-sm">
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Thương hiệu:</span>
              <span className="font-medium">{product.brand}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">SKU:</span>
              <span className="font-medium">{product.sku}</span>
            </div>
          </div>

          {/* Colors */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="font-bold mr-2">Màu sắc:</span>
              {selectedColor && <span className="text-sm text-gray-600">{getColorName(selectedColor)}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.availableColors ? (
                // Hiển thị các màu có sẵn từ dữ liệu sản phẩm
                product.availableColors.map((colorValue) => {
                  const colorOption = colorOptions.find((c) => c.value === colorValue)
                  return (
                    <button
                      key={colorValue}
                      className={`w-10 h-10 rounded-full ${selectedColor === colorValue ? "ring-2 ring-offset-2 ring-black" : ""}`}
                      style={{
                        backgroundColor: colorValue,
                        border: colorValue === "white" ? "1px solid #ccc" : "none",
                      }}
                      onClick={() => setSelectedColor(colorValue)}
                      title={colorOption?.label || colorValue}
                    ></button>
                  )
                })
              ) : (
                // Fallback nếu không có dữ liệu màu có sẵn
                <>
                  <button
                    className={`w-10 h-10 rounded-full bg-red-500 ${selectedColor === "red" ? "ring-2 ring-offset-2 ring-black" : ""}`}
                    onClick={() => setSelectedColor("red")}
                    title="Đỏ"
                  ></button>
                  <button
                    className={`w-10 h-10 rounded-full bg-black ${selectedColor === "black" ? "ring-2 ring-offset-2 ring-black" : ""}`}
                    onClick={() => setSelectedColor("black")}
                    title="Đen"
                  ></button>
                </>
              )}
            </div>
          </div>

          {/* Sizes */}
          {product.availableSizes && product.availableSizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="font-bold mr-2">Kích thước:</span>
                {selectedSize && <span className="text-sm text-gray-600">{selectedSize}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`px-4 py-2 rounded-md ${selectedSize === size
                      ? "bg-red-500 text-white border-red-500"
                      : "border border-gray-300 hover:bg-gray-100"
                      }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Buy Now */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <FaMinus className="w-3 h-3" />
              </button>
              <span className="px-4 py-2 border-l border-r border-gray-300 min-w-[40px] text-center">{quantity}</span>
              <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors" onClick={increaseQuantity}>
                <FaPlus className="w-3 h-3" />
              </button>
            </div>

            <button
              className={`px-6 py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-colors flex-1 flex items-center justify-center ${addingToCart || !product.stockStatus ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={handleBuyNow}
              disabled={addingToCart || !product.stockStatus}
            >
              {addingToCart ? "Đang xử lý..." : "Mua ngay"}
            </button>

            <button
              className={`px-6 py-2 border border-black text-black font-bold rounded-md hover:bg-gray-100 transition-colors flex-1 flex items-center justify-center ${addingToCart || !product.stockStatus ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={handleAddToCart}
              disabled={addingToCart || !product.stockStatus}
            >
              <FaShoppingCart className="mr-2" />
              {addingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>

            <button
              className={`p-2 border rounded-md transition-colors ${isInWishlist ? "border-red-500 text-red-500 bg-red-50" : "border-gray-300 hover:border-red-500 hover:text-red-500"}`}
              onClick={toggleWishlist}
            >
              <FaHeart className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Info */}
          <div className="border border-gray-200 rounded-md p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FaTruck className="text-gray-600" />
              </div>
              <div>
                <p className="font-bold">Miễn phí vận chuyển</p>
                <p className="text-sm text-gray-500">Miễn phí vận chuyển cho đơn hàng từ 2.000.000₫</p>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FaUndoAlt className="text-gray-600" />
              </div>
              <div>
                <p className="font-bold">Đổi trả hàng</p>
                <p className="text-sm text-gray-500">
                  Miễn phí đổi trả trong 30 ngày. <span className="text-red-500 cursor-pointer">Chi tiết</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-16">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === "description" ? "border-red-500 text-red-500" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("description")}
            >
              Mô tả sản phẩm
            </button>
            <button
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === "specifications" ? "border-red-500 text-red-500" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("specifications")}
            >
              Thông số kỹ thuật
            </button>
            <button
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === "reviews" ? "border-red-500 text-red-500" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("reviews")}
            >
              Đánh giá ({reviews.length || 0})
            </button>
          </div>
        </div>

        <div className="py-6">
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur.
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Chất liệu cao cấp, bền đẹp theo thời gian</li>
                <li>Thiết kế hiện đại, sang trọng</li>
                <li>Dễ dàng sử dụng và bảo quản</li>
                <li>Phù hợp với nhiều không gian và phong cách</li>
              </ul>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="bg-white rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {product.specifications &&
                    Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 w-1/3">
                          {key}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Đánh giá từ khách hàng</h3>
              </div>

              {/* Form đánh giá */}
              {isAuthenticated && user ? (
                !hasReviewed ? (
                  <ReviewForm
                    productId={Number(productId)}
                    user={user}
                    onReviewSubmitted={() => {
                      fetchReviews()
                      setHasReviewed(true)
                    }}
                  />
                ) : (
                  <div className="bg-green-50 p-4 rounded-md mb-8">
                    <p className="text-green-700">Bạn đã đánh giá sản phẩm này. Cảm ơn bạn đã chia sẻ ý kiến!</p>
                  </div>
                )
              ) : (
                <div className="bg-gray-50 p-4 rounded-md mb-8">
                  <p className="text-gray-700">
                    Vui lòng{" "}
                    <Link to="/login" className="text-red-500 font-medium hover:underline">
                      đăng nhập
                    </Link>{" "}
                    để viết đánh giá.
                  </p>
                </div>
              )}

              {/* Danh sách đánh giá */}
              {loadingReviews ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-3">
                            {review.userAvatar ? (
                              <img
                                src={review.userAvatar || "/placeholder.svg"}
                                alt={review.userName}
                                className="w-full h-full rounded-full"
                              />
                            ) : (
                              review.userName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{review.userName}</p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-500">{formatDate(review.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                      <div className="flex items-center mt-3">
                        <button
                          className="text-sm text-gray-500 flex items-center hover:text-gray-700"
                          onClick={() => handleMarkHelpful(review.id || 0)}
                        >
                          <FaThumbsUp className="mr-1" /> Hữu ích ({review.helpful})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này</p>
                  {isAuthenticated && !hasReviewed && (
                    <p className="mt-2 text-gray-600">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Items Section */}
      <div className="mb-16">
        <h3 className="text-lg font-bold mb-6 text-red-500 flex items-center">
          <span className="inline-block w-2 h-6 bg-red-500 mr-2"></span>
          Sản phẩm liên quan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((relatedProduct) => (
            <Link to={`/productdetail/${relatedProduct.id}`} key={relatedProduct.id} className="group">
              <div className="relative bg-gray-50 rounded-lg p-4 mb-3 overflow-hidden">
                <img
                  src={relatedProduct.image || "/placeholder.svg?height=200&width=200"}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-contain transition-transform group-hover:scale-105"
                />
                {relatedProduct.oldPrice > relatedProduct.price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    -{calculateDiscount(relatedProduct.oldPrice, relatedProduct.price)}%
                  </div>
                )}
                <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                  <FaHeart className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-semibold mb-2">{relatedProduct.name}</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-red-500">{formatPrice(relatedProduct.price)}</span>
                {renderRatingStars(relatedProduct.rating)}
              </div>

              <button onClick={() => navigate(`/productdetail/${product.id}`)} className="w-full py-2 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition-colors">
                Xem thông tin chi tiết
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
