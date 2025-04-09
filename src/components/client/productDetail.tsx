"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { FaStar, FaHeart, FaMinus, FaPlus, FaTruck, FaUndoAlt } from "react-icons/fa"

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
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("M")
  const [selectedColor, setSelectedColor] = useState("red")
  const [mainImage, setMainImage] = useState("")
  const [originalMainImage, setOriginalMainImage] = useState("")
  const [thumbnails, setThumbnails] = useState<string[]>([])

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
          setProduct(foundProduct)

          // Xử lý ảnh chính và thumbnails
          const mainImg = foundProduct.image
          setMainImage(mainImg)
          setOriginalMainImage(mainImg)

          // Nếu có mảng images, sử dụng nó làm thumbnails
          if (foundProduct.images && foundProduct.images.length > 0) {
            setThumbnails(foundProduct.images)
          } else {
            // Nếu không có mảng images, chỉ sử dụng ảnh chính
            setThumbnails([mainImg])
          }

          // Tìm các sản phẩm liên quan (cùng danh mục, khác ID)
          const related = data.products
            .filter((p) => p.categoryId === foundProduct.categoryId && p.id !== foundProduct.id)
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
    }
  }, [productId])

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
                  src={thumb || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div
            className="flex-1 bg-gray-50 rounded-lg p-4 flex items-center justify-center cursor-pointer"
            onClick={handleMainImageClick}
          >
            <img
              src={mainImage || "/placeholder.svg"}
              alt={product.name}
              className="max-w-full max-h-[400px] object-contain"
            />
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          <div className="flex items-center gap-4 mb-3">
            {renderRatingStars(product.rating)}
            <span className="text-sm text-gray-500 border-l border-gray-300 pl-4">(150 Đánh giá)</span>
            <span className={`text-sm ${product.stockStatus ? "text-green-500" : "text-red-500"}`}>
              {product.stockStatus ? "| Còn hàng" : "| Hết hàng"}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-red-500">{formatPrice(product.price)}</span>
            {product.oldPrice > product.price && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {/* Colors */}
          <div className="mb-6">
            <span className="font-bold mr-4">Màu sắc:</span>
            {product.availableColors ? (
              // Hiển thị các màu có sẵn từ dữ liệu sản phẩm
              product.availableColors.map((colorValue) => {
                const colorOption = colorOptions.find((c) => c.value === colorValue)
                return (
                  <button
                    key={colorValue}
                    className={`w-8 h-8 rounded-full mr-3 ${selectedColor === colorValue ? "ring-2 ring-offset-2 ring-black" : ""}`}
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
                  className={`w-8 h-8 rounded-full bg-red-500 mr-3 ${selectedColor === "red" ? "ring-2 ring-offset-2 ring-black" : ""}`}
                  onClick={() => setSelectedColor("red")}
                  title="Đỏ"
                ></button>
                <button
                  className={`w-8 h-8 rounded-full bg-black ${selectedColor === "black" ? "ring-2 ring-offset-2 ring-black" : ""}`}
                  onClick={() => setSelectedColor("black")}
                  title="Đen"
                ></button>
              </>
            )}
          </div>

          {/* Sizes */}
          <div className="mb-6">
            <span className="font-bold mr-4">Kích thước:</span>
            {product.availableSizes
              ? // Hiển thị các kích thước có sẵn từ dữ liệu sản phẩm
              product.availableSizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 mr-2 rounded-md ${selectedSize === size
                    ? "bg-red-500 text-white border-red-500"
                    : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))
              : // Fallback nếu không có dữ liệu kích thước có sẵn
              ["XS", "S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 mr-2 rounded-md ${selectedSize === size
                    ? "bg-red-500 text-white border-red-500"
                    : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
          </div>

          {/* Quantity and Buy Now */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200" onClick={decreaseQuantity}>
                <FaMinus className="w-3 h-3" />
              </button>
              <span className="px-4 py-2 border-l border-r border-gray-300">{quantity}</span>
              <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200" onClick={increaseQuantity}>
                <FaPlus className="w-3 h-3" />
              </button>
            </div>

            <button className="px-6 py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-colors">
              Mua ngay
            </button>

            <button className="p-2 border border-gray-300 rounded-md hover:border-red-500 hover:text-red-500 transition-colors">
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
                <p className="text-sm text-gray-500">Nhập mã bưu điện để kiểm tra khả năng giao hàng</p>
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
                  src={relatedProduct.image || "/placeholder.svg"}
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

              <button className="w-full py-2 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition-colors">
                Thêm vào giỏ hàng
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

