"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { FaSearch, FaBell, FaUser, FaCog, FaSignOutAlt, FaShoppingCart, FaChartBar } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/authContext"

const AdminHeader = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Đơn hàng mới #1234", time: "5 phút trước", read: false },
    { id: 2, text: "Sản phẩm sắp hết hàng: Áo thun nam", time: "30 phút trước", read: false },
    { id: 3, text: "Khách hàng mới đăng ký", time: "1 giờ trước", read: true },
    { id: 4, text: "Báo cáo doanh thu tháng đã sẵn sàng", time: "3 giờ trước", read: true },
  ])

  const userRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
    } else if (user && user.role !== "admin") {
      navigate("/")
    }
  }, [isAuthenticated, user, navigate])

  // Xử lý click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý tìm kiếm trong trang admin
    console.log("Searching for:", searchTerm)
  }

  // Đánh dấu thông báo đã đọc
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter((notification) => !notification.read).length

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="bg-white w-full shadow-md flex p-4 relative z-50">
      <div className="logo w-1/5">
        <Link to="/dashboard" className="text-xl font-bold text-red-500">
          MinhnkPH51915
        </Link>
      </div>
      <div className="right-header w-4/5 flex justify-between items-center">
        <form onSubmit={handleSearch} className="w-1/3">
          <div className="relative">
            <input
              className="border rounded-md w-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              type="text"
              placeholder="Tìm kiếm đơn hàng, sản phẩm, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <FaSearch />
            </button>
          </div>
        </form>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              className="p-2 rounded-full hover:bg-gray-100 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Thông báo</h3>
                  {unreadCount > 0 && (
                    <button className="text-xs text-red-500 hover:text-red-700" onClick={markAllAsRead}>
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 mr-2 ${!notification.read ? "bg-blue-500" : "bg-transparent"}`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm">{notification.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">Không có thông báo nào</div>
                  )}
                </div>
                <div className="p-2 border-t text-center">
                  <Link to="/dashboard/notifications" className="text-sm text-red-500 hover:text-red-700">
                    Xem tất cả thông báo
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={userRef}>
            <button
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <span className="hidden md:inline-block">Xin chào {user?.name || "Admin"}</span>
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b text-center">
                  <p className="font-semibold">{user?.name || "Admin"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "admin@example.com"}</p>
                </div>
                <div>
                  <Link to="/dashboard/profile" className="flex items-center px-4 py-2 hover:bg-gray-50">
                    <FaUser className="mr-2 text-gray-600" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <Link to="/dashboard/settings" className="flex items-center px-4 py-2 hover:bg-gray-50">
                    <FaCog className="mr-2 text-gray-600" />
                    <span>Cài đặt</span>
                  </Link>
                  <Link to="/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-50">
                    <FaChartBar className="mr-2 text-gray-600" />
                    <span>Thống kê</span>
                  </Link>
                  <Link to="/dashboard/orders" className="flex items-center px-4 py-2 hover:bg-gray-50">
                    <FaShoppingCart className="mr-2 text-gray-600" />
                    <span>Đơn hàng</span>
                  </Link>
                  <button
                    className="flex items-center px-4 py-2 hover:bg-gray-50 w-full text-left text-red-500"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="mr-2" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
