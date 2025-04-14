"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaBox, FaShoppingBag, FaFileInvoice, FaTruck, FaCheck, FaTimes } from "react-icons/fa"

import { ORDER_STATUS_DISPLAY, ORDER_STATUS_COLORS } from "../../config/constants"
import { useAuth } from "../context/authContext"
import { Order } from "../../interface/order"
import OrderService from "./services/order-service"

const OrderHistory = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!isAuthenticated || !user) {
      navigate("/login", { state: { from: "/profile" } })
      return
    }

    // Lấy danh sách đơn hàng
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const userOrders = await OrderService.getUserOrders(user.id)
        setOrders(userOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, navigate, user])

  // Định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Xử lý hiển thị chi tiết đơn hàng
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return
    }

    try {
      await OrderService.cancelOrder(orderId)
      // Cập nhật lại danh sách đơn hàng
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled", updatedAt: new Date().toISOString() } : order,
        ),
      )
      // Cập nhật selectedOrder nếu đang xem chi tiết
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: "cancelled",
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (error: any) {
      alert(error.message || "Không thể hủy đơn hàng. Vui lòng thử lại sau.")
    }
  }

  // Render icon cho trạng thái đơn hàng
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FaBox className="text-blue-500" />
      case "processing":
        return <FaShoppingBag className="text-orange-500" />
      case "shipped":
        return <FaTruck className="text-purple-500" />
      case "delivered":
        return <FaCheck className="text-green-500" />
      case "cancelled":
        return <FaTimes className="text-red-500" />
      default:
        return <FaFileInvoice className="text-gray-500" />
    }
  }

  // Render badge cho trạng thái đơn hàng
  const renderStatusBadge = (status: string) => {
    const color = ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || "gray"
    const displayName = ORDER_STATUS_DISPLAY[status as keyof typeof ORDER_STATUS_DISPLAY] || status

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
      >
        {renderStatusIcon(status)}
        <span className="ml-1">{displayName}</span>
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md shadow-md">
          <FaShoppingBag className="mx-auto text-gray-300 text-6xl mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào trong lịch sử mua sắm</p>
          <Link
            to="/"
            className="inline-flex items-center bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</div>
                    <div className="text-xs text-gray-500">{order.items.length} sản phẩm</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewOrderDetails(order)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Chi tiết
                    </button>
                    {(order.status === "pending" || order.status === "processing") && (
                      <button
                        onClick={() => order.id && handleCancelOrder(order.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.id}</h2>
                <button onClick={() => setShowOrderDetails(false)} className="text-gray-500 hover:text-gray-700">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Thông tin đơn hàng</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="font-medium">#{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Ngày đặt:</span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span>{renderStatusBadge(selectedOrder.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phương thức thanh toán:</span>
                      <span>
                        {selectedOrder.paymentMethod === "cod"
                          ? "Thanh toán khi nhận hàng"
                          : selectedOrder.paymentMethod === "bank_transfer"
                            ? "Chuyển khoản ngân hàng"
                            : selectedOrder.paymentMethod === "credit_card"
                              ? "Thẻ tín dụng / Ghi nợ"
                              : selectedOrder.paymentMethod === "momo"
                                ? "Ví MoMo"
                                : selectedOrder.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Địa chỉ giao hàng</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.phone}</p>
                    <p>
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward},{" "}
                      {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}
                    </p>
                    {selectedOrder.shippingAddress.notes && (
                      <p className="mt-2 text-gray-600">Ghi chú: {selectedOrder.shippingAddress.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Sản phẩm đã đặt</h3>
              <div className="border rounded-md overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-16 w-16 flex-shrink-0">
                              <img
                                className="h-16 w-16 object-cover rounded"
                                src={item.productImage || "/placeholder.svg"}
                                alt={item.productName}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-1"
                                  style={{ backgroundColor: item.color }}
                                ></span>
                                {item.color.charAt(0).toUpperCase() + item.color.slice(1)}
                                {item.size && <span className="ml-2">Size: {item.size}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(item.price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-full md:w-1/2 lg:w-1/3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span>Đã bao gồm</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors mr-4"
                >
                  Đóng
                </button>
                {(selectedOrder.status === "pending" || selectedOrder.status === "processing") && (
                  <button
                    onClick={() => {
                      selectedOrder.id && handleCancelOrder(selectedOrder.id)
                      setShowOrderDetails(false)
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderHistory
