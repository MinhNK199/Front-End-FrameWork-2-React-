"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaStar, FaEye, FaTrash } from "react-icons/fa"
import { Pagination } from "antd"
import axios from "axios"
import type { Category, Product } from "../../interface/product"

const CategoryItem: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 8

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        // Lấy thông tin danh mục
        const categoryResponse = await axios.get(`http://localhost:4000/categories/${categoryId}`)
        setCategory(categoryResponse.data)

        // Lấy tất cả sản phẩm
        const productsResponse = await axios.get("http://localhost:4000/products")

        // Lọc sản phẩm theo categoryId
        // Đảm bảo so sánh đúng kiểu dữ liệu (string vs string hoặc number vs number)
        const filteredProducts = productsResponse.data.filter(
          (product: Product) => String(product.categoryId) === String(categoryId),
        )

        setProducts(filteredProducts || [])

        // Reset về trang 1 khi thay đổi danh mục
        setCurrentPage(1)
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error)
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.")
        setCategory(null)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchCategoryAndProducts()
    } else {
      setLoading(false)
      setError("Không tìm thấy mã danh mục")
    }
  }, [categoryId])

  // Tính toán sản phẩm hiển thị trên trang hiện tại
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentProducts = products.slice(startIndex, endIndex)

  // Xử lý khi thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
  }

  if (!category) {
    return <div className="flex justify-center items-center min-h-screen">Không tìm thấy danh mục.</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto py-12 px-4 lg:px-0">
        <h2 className="text-2xl font-bold mb-8">{category.name}</h2>

        {/* Product Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-md shadow-sm hover:shadow-lg transition-shadow duration-200 relative group"
                >
                  {/* Product Image */}
                  <div className="relative w-full h-60 bg-gray-100 rounded-t-md overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                      style={{ borderRadius: "10px", transition: "transform 0.3s" }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                    <button onClick={() => navigate(`/productdetail/${product.id}`)} className="absolute bottom-0 left-0 w-full bg-black text-white py-2 rounded-b-md opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out">
                      Xem thông tin chi tiết
                    </button>
                    {/* Discount Badge */}
                    {product.oldPrice && product.price && product.price < product.oldPrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        {`-${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%`}
                      </span>
                    )}
                    {/* Action Icons */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-2">
                      <button
                        className="bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => navigate(`/productdetail/${product.id}`)}
                      >
                        <FaEye className="w-4 h-4 text-gray-600" />
                      </button>

                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-red-500">{product.price.toLocaleString()} VND</span>
                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {product.oldPrice.toLocaleString()} VND
                        </span>
                      )}
                    </div>
                    {product.rating && (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${i < product.rating ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={products.length}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-600">Không có sản phẩm nào trong danh mục này.</div>
        )}
      </main>
    </div>
  )
}

export default CategoryItem

