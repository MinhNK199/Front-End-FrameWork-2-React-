"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCreditCard, FaMoneyBill, FaUniversity, FaWallet } from "react-icons/fa";

import type { CartItem } from "../../interface/cart";
import type { ShippingAddress, OrderItem } from "../../interface/order";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD, PAYMENT_METHODS } from "../../config/constants";
import { useAuth } from "../context/authContext";
import CartService from "./services/cart-service";
import OrderService from "./services/order-service";

const Checkout = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [discount, setDiscount] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    notes: "",
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    const fetchCart = async () => {
      try {
        setLoading(true);
        console.log("Token in fetchCart:", localStorage.getItem("token"));
        const items = await CartService.getUserCart(user.id);

        if (items.length === 0) {
          navigate("/carts");
          return;
        }

        setCartItems(items);

        try {
          const response = await fetch(`http://localhost:4000/users/${user.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const userData = await response.json();

          setShippingAddress({
            fullName: userData.name || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: "",
            district: "",
            ward: "",
            notes: "",
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } catch (error: any) {
        console.error("Error fetching cart:", error);
        setErrorMessage("Không thể tải giỏ hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, navigate, user]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product ? item.product.price : 0;
      return total + price * item.quantity;
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() - discount;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!shippingAddress.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(shippingAddress.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!shippingAddress.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    }

    if (!shippingAddress.district.trim()) {
      newErrors.district = "Vui lòng chọn quận/huyện";
    }

    if (!shippingAddress.ward.trim()) {
      newErrors.ward = "Vui lòng chọn phường/xã";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.getElementById(firstError);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    setProcessingOrder(true);
    setErrorMessage(null);

    try {
      const orderItems: OrderItem[] = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product ? item.product.price : 0,
        color: item.color,
        size: item.size,
        productName: item.product ? item.product.name : "",
        productImage: item.product ? item.product.image : "",
      }));

      const orderData = {
        userId: user.id,
        items: orderItems,
        totalAmount: calculateTotal(),
        shippingAddress,
        paymentMethod,
      };

      const response = await OrderService.createOrder(orderData);
      setOrderId(response.id || null);
      setOrderSuccess(true);
    } catch (error: any) {
      console.error("Error placing order:", error);
      setErrorMessage(error.message || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setProcessingOrder(false);
    }
  };

  const renderPaymentIcon = (method: string) => {
    switch (method) {
      case "cod":
        return <FaMoneyBill className="text-green-500" />;
      case "bank_transfer":
        return <FaUniversity className="text-blue-500" />;
      case "credit_card":
        return <FaCreditCard className="text-purple-500" />;
      case "momo":
        return <FaWallet className="text-pink-500" />;
      default:
        return <FaMoneyBill className="text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đặt hàng thành công!</h2>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </p>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-gray-700">
              Mã đơn hàng: <span className="font-semibold">#{orderId}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
            >
              Xem đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin giao hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.fullName ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-1 focus:ring-red-500`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.phone ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-1 focus:ring-red-500`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.address ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-1 focus:ring-red-500`}
                  placeholder="Số nhà, tên đường"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.city ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-1 focus:ring-red-500`}
                >
                  <option value="">Chọn Tỉnh/Thành phố</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện <span className="text-red-500">*</span>
                </label>
                <select
                  id="district"
                  name="district"
                  value={shippingAddress.district}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.district ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-1 focus:ring-red-500`}
                >
                  <option value="">Chọn Quận/Huyện</option>
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 2">Quận 2</option>
                  <option value="Quận 3">Quận 3</option>
                  <option value="Quận 4">Quận 4</option>
                  <option value="Quận 5">Quận 5</option>
                </select>
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
              </div>

              <div>
                <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
                  Phường/Xã <span className="text-red-500">*</span>
                </label>
                <select
                  id="ward"
                  name="ward"
                  value={shippingAddress.ward}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.ward ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-1 focus:ring-red-500`}
                >
                  <option value="">Chọn Phường/Xã</option>
                  <option value="Phường 1">Phường 1</option>
                  <option value="Phường 2">Phường 2</option>
                  <option value="Phường 3">Phường 3</option>
                  <option value="Phường 4">Phường 4</option>
                  <option value="Phường 5">Phường 5</option>
                </select>
                {errors.ward && <p className="text-red-500 text-xs mt-1">{errors.ward}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={shippingAddress.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
            <div className="space-y-4">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-md p-4 cursor-pointer transition-colors ${paymentMethod === method.id ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                    }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="flex items-center">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="h-4 w-4 text-red-500 border-gray-300 focus:ring-red-500"
                      />
                    </div>
                    <div className="ml-3 flex items-center">
                      <span className="mr-2">{renderPaymentIcon(method.id)}</span>
                      <label className="font-medium text-gray-700">{method.name}</label>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 ml-7">{method.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Sản phẩm đã chọn</h2>
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 flex">
                  <div className="h-20 w-20 flex-shrink-0">
                    {item.product && (
                      <img
                        className="h-20 w-20 object-cover rounded"
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                      />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{item.product?.name}</h3>
                        <div className="text-xs text-gray-500 mt-1">
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-1"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          {item.color.charAt(0).toUpperCase() + item.color.slice(1)}
                          {item.size && <span className="ml-2">Size: {item.size}</span>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.product && formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính ({cartItems.length} sản phẩm)</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-medium">
                  {calculateShipping() === 0 ? "Miễn phí" : formatCurrency(calculateShipping())}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t pt-4 flex justify-between">
                <span className="font-semibold">Tổng cộng</span>
                <span className="font-bold text-red-500">{formatCurrency(calculateTotal())}</span>
              </div>

              <button
                className="w-full bg-red-500 text-white py-3 rounded-md font-semibold hover:bg-red-600 transition-colors disabled:bg-red-300"
                onClick={handlePlaceOrder}
                disabled={processingOrder}
              >
                {processingOrder ? "Đang xử lý..." : "Đặt hàng"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                Bằng cách đặt hàng, bạn đồng ý với{" "}
                <a href="#" className="text-red-500 hover:underline">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" className="text-red-500 hover:underline">
                  Chính sách bảo mật
                </a>{" "}
                của chúng tôi.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => navigate("/cart")}
                className="flex items-center text-red-500 hover:text-red-600 transition-colors"
              >
                <FaArrowLeft className="mr-2" /> Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;