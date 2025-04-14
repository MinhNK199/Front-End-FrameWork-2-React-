"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { useAuth } from "../context/authContext";
import CartService from "./services/cart-service";
import { CartItem } from "../../interface/cart";

const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const fetchCart = async () => {
    if (!isAuthenticated || !user) {
      setError("Vui lòng đăng nhập để xem giỏ hàng");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Token in fetchCart:", localStorage.getItem("token"));
      const items = await CartService.getUserCart(user.id);
      console.log("Cart data:", items);
      setCartItems(items);
    } catch (error: any) {
      console.error("Error fetching cart:", error);
      setError(error.message || "Không thể tải giỏ hàng");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await CartService.updateCartItemQuantity(Number(cartItemId), quantity);
      fetchCart();
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      alert(error.message || "Không thể cập nhật số lượng");
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      await CartService.removeFromCart(Number(cartItemId));
      fetchCart();
    } catch (error: any) {
      console.error("Error removing item:", error);
      alert(error.message || "Không thể xóa sản phẩm");
    }
  };

  const calculateTotal = () => {
    return CartService.calculateCartTotal(cartItems);
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link
          to="/login"
          className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <p className="mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
        <Link
          to="/"
          className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center border-b py-4">
              <img
                src={item.product?.image || "/placeholder.svg?height=100&width=100"}
                alt={item.product?.name}
                className="w-24 h-24 object-contain mr-4"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {item.product?.name || "Sản phẩm không xác định"}
                </h3>
                <p className="text-gray-500">
                  Màu: {item.color || "N/A"} | Kích thước: {item.size || "N/A"}
                </p>
                <p className="text-red-500 font-semibold">
                  {formatPrice(item.product?.price || 0)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(String(item.id), item.quantity - 1)}
                  className="p-1 bg-gray-200 rounded"
                  disabled={item.quantity <= 1}
                >
                  <FaMinus />
                </button>
                <span className="px-4">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(String(item.id), item.quantity + 1)}
                  className="p-1 bg-gray-200 rounded"
                >
                  <FaPlus />
                </button>
              </div>
              <button
                onClick={() => removeItem(String(item.id))}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Tổng cộng</h2>
          <div className="flex justify-between mb-2">
            <span>Tạm tính:</span>
            <span>{formatPrice(calculateTotal())}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Phí vận chuyển:</span>
            <span>Miễn phí</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Tổng:</span>
            <span>{formatPrice(calculateTotal())}</span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-red-500 text-white py-3 mt-6 rounded-md hover:bg-red-600"
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;