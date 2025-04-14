"use client";

import type React from "react";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { FaGlobe, FaHeart, FaSearch, FaShoppingCart, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";

import type { CartItem } from "../../interface/cart";
import { useAuth } from "../context/authContext";
import CartService from "./services/cart-service";

interface Product {
    id: number;
    name: string;
    categoryId: number;
    oldPrice: number;
    price: number;
    color: string;
    stockStatus: boolean;
    rating: number;
    image: string;
    sku: string;
    brand: string;
    weight: number;
    description: string;
    type: string;
    parent: number;
}

interface Category {
    id: number;
    name: string;
    icon: string;
    description: string;
}

interface Database {
    products: Product[];
    categories: Category[];
    carts: any[];
    users: any[];
}

const ClientHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    const searchRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/db.json");
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data: Database = await response.json();
                setAllProducts(data.products || []);
                setCategories(data.categories || []);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchCart = async () => {
            if (isAuthenticated && user) {
                try {
                    const items = await CartService.getUserCart(user.id);
                    console.log("Header cart items:", items);
                    setCartItems(items);
                    setCartCount(items.length);
                    setWishlistCount(Math.floor(Math.random() * 5));
                } catch (error) {
                    console.error("Error fetching cart:", error);
                    setCartItems([]);
                    setCartCount(0);
                }
            } else {
                setCartItems([]);
                setCartCount(0);
                setWishlistCount(0);
            }
        };

        fetchCart();
        const intervalId = setInterval(fetchCart, 30000);
        return () => clearInterval(intervalId);
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(() => {
            const filteredResults = allProducts.filter((product) =>
                product.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(filteredResults);
            setShowResults(true);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, allProducts]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
            if (userRef.current && !userRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
            if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
                setShowCartDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        if (!location.pathname.includes("/search")) {
            const isFromSearch = sessionStorage.getItem("lastSearchTerm");
            const isProductDetail = location.pathname.includes("/productdetail");
            if (!(isProductDetail && isFromSearch)) {
                setSearchTerm("");
            }
        } else {
            const searchParams = new URLSearchParams(location.search);
            const query = searchParams.get("q") || "";
            setSearchTerm(query);
            if (query) {
                sessionStorage.setItem("lastSearchTerm", query);
            }
        }
        setShowResults(false);
    }, [location]);

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setShowResults(false);
            sessionStorage.setItem("lastSearchTerm", searchTerm);
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleResultClick = (productId: number) => {
        setShowResults(false);
        sessionStorage.setItem("lastSearchTerm", searchTerm);
        navigate(`/productdetail/${productId}`);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setSearchResults([]);
        setShowResults(false);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    };

    const getCategoryName = (categoryId: number) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "";
    };

    const handleLogout = () => {
        logout();
        setShowUserDropdown(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const calculateCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.product ? item.product.price : 0;
            return total + price * item.quantity;
        }, 0);
    };

    const handleRemoveFromCart = async (itemId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await CartService.removeFromCart(itemId);
            const items = await CartService.getUserCart(user!.id);
            setCartItems(items);
            setCartCount(items.length);
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };

    return (
        <header className="bg-white text-black">
            <div className="bg-black text-white py-2 text-sm relative">
                <div className="flex justify-between items-center px-4 lg:px-8">
                    <p className="text-center flex-1">
                        SUMMER SALE FOR ALL SWIM SUITS AND FREE EXPRESS DELIVERY - OFF 50%!{" "}
                        <a href="#" className="underline hover:text-gray-300 transition-colors duration-200">
                            SHOP NOW
                        </a>
                    </p>
                    <div className="relative group">
                        <button className="flex items-center space-x-1 hover:text-gray-300 transition-colors duration-200">
                            <FaGlobe className="w-4 h-4" />
                            <span>English</span>
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50">
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                English
                            </a>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                Tiếng Việt
                            </a>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                French
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 lg:px-0">
                <div className="text-2xl font-bold">
                    <Link to="/" className="hover:text-gray-600 transition-colors duration-200">
                        EXCLUSIVE
                    </Link>
                </div>

                <nav className="hidden lg:flex space-x-8">
                    <Link
                        to="/"
                        className={`text-base font-medium hover:text-gray-600 hover:underline hover:underline-offset-4 transition-all duration-200 ${location.pathname === "/" ? "text-red-500 underline underline-offset-4" : ""
                            }`}
                    >
                        Home
                    </Link>
                    <a
                        href="#"
                        className="text-base font-medium hover:text-gray-600 hover:underline hover:underline-offset-4 transition-all duration-200"
                    >
                        Contact
                    </a>
                    <a
                        href="#"
                        className="text-base font-medium hover:text-gray-600 hover:underline hover:underline-offset-4 transition-all duration-200"
                    >
                        About
                    </a>
                    {!isAuthenticated && (
                        <Link
                            to="/login"
                            className={`text-base font-medium hover:text-gray-600 hover:underline hover:underline-offset-4 transition-all duration-200 ${location.pathname === "/login" ? "text-red-500 underline underline-offset-4" : ""
                                }`}
                        >
                            Sign Up
                        </Link>
                    )}
                </nav>

                <div className="flex items-center space-x-4">
                    <div className="relative" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit}>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Bạn tìm gì hôm nay?"
                                    className="bg-gray-100 text-black px-4 py-2 rounded-md outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 w-48 lg:w-64"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onFocus={() => {
                                        if (searchResults.length > 0) {
                                            setShowResults(true);
                                        }
                                    }}
                                />
                                {searchTerm ? (
                                    <button
                                        type="button"
                                        className="absolute right-10 top-1/2 transform -translate-y-1/2 hover:text-gray-600 transition-colors duration-200"
                                        onClick={clearSearch}
                                    >
                                        <FaTimes className="w-4 h-4 text-gray-500" />
                                    </button>
                                ) : null}
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <FaSearch className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </form>

                        {showResults && (
                            <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-50 max-h-96 overflow-auto">
                                {loading ? (
                                    <div className="p-4 text-center text-gray-500">Đang tìm kiếm...</div>
                                ) : searchResults.length > 0 ? (
                                    <>
                                        <div className="p-2">
                                            {searchResults.slice(0, 3).map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                                                    onClick={() => handleResultClick(product.id)}
                                                >
                                                    <img
                                                        src={product.image || "/placeholder.svg"}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded-md mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{product.name}</p>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-red-500 text-sm font-semibold">{formatPrice(product.price)}</p>
                                                            <p className="text-xs text-gray-500">{getCategoryName(product.categoryId)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-2 border-t border-gray-200">
                                            <Link
                                                to={`/search?q=${encodeURIComponent(searchTerm)}`}
                                                className="block text-center py-2 text-red-500 hover:text-red-600 font-medium"
                                                onClick={() => setShowResults(false)}
                                            >
                                                Xem tất cả {searchResults.length} kết quả
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm nào</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Link
                            to={isAuthenticated ? "/wishlist" : "/login"}
                            className="hover:text-gray-600 transition-colors duration-200"
                        >
                            <FaHeart className="w-5 h-5" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="relative" ref={cartRef}>
                        <button
                            className="hover:text-gray-600 transition-colors duration-200 relative"
                            onClick={() => (isAuthenticated ? setShowCartDropdown(!showCartDropdown) : navigate("/login"))}
                        >
                            <FaShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {showCartDropdown && isAuthenticated && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
                                <div className="p-4">
                                    <h3 className="font-medium text-lg mb-2">Giỏ hàng của bạn</h3>
                                    {cartItems.length === 0 ? (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500">Giỏ hàng trống</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="max-h-60 overflow-auto">
                                                {cartItems.map((item) => (
                                                    <div key={item.id} className="flex items-center py-2 border-b border-gray-100">
                                                        <img
                                                            src={item.product?.image || "/placeholder.svg"}
                                                            alt={item.product?.name}
                                                            className="w-12 h-12 object-cover rounded-md mr-3"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{item.product?.name || "Sản phẩm không xác định"}</p>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs text-gray-500">
                                                                    {item.quantity} x {formatPrice(item.product?.price || 0)}
                                                                </p>
                                                                <button
                                                                    className="text-red-500 hover:text-red-700"
                                                                    onClick={(e) => handleRemoveFromCart(item.id, e)}
                                                                >
                                                                    <FaTimes className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-2 border-t border-gray-200">
                                                <div className="flex justify-between mb-4">
                                                    <span className="font-medium">Tổng cộng:</span>
                                                    <span className="font-bold text-red-500">{formatPrice(calculateCartTotal())}</span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Link
                                                        to="/carts"
                                                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-center hover:bg-gray-300 transition-colors"
                                                        onClick={() => setShowCartDropdown(false)}
                                                    >
                                                        Xem giỏ hàng
                                                    </Link>
                                                    <Link
                                                        to="/checkout"
                                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md text-center hover:bg-red-600 transition-colors"
                                                        onClick={() => setShowCartDropdown(false)}
                                                    >
                                                        Thanh toán
                                                    </Link>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={userRef}>
                        <button
                            className="hover:text-gray-600 transition-colors duration-200 flex items-center"
                            onMouseEnter={() => setShowUserDropdown(true)}
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                        >
                            {user ? (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                                    {getInitials(user.name)}
                                </div>
                            ) : (
                                <FaUser className="w-5 h-5" />
                            )}
                        </button>

                        {showUserDropdown && (
                            <div
                                className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50"
                                onMouseLeave={() => setShowUserDropdown(false)}
                            >
                                {user ? (
                                    <div className="p-4">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-700 mr-3">
                                                {getInitials(user.name)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                                            onClick={() => setShowUserDropdown(false)}
                                        >
                                            Trang cá nhân
                                        </Link>
                                        <Link
                                            to="/orders"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                                            onClick={() => setShowUserDropdown(false)}
                                        >
                                            Đơn hàng của tôi
                                        </Link>
                                        <Link
                                            to="/wishlist"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                                            onClick={() => setShowUserDropdown(false)}
                                        >
                                            Sản phẩm yêu thích
                                        </Link>
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 rounded-md flex items-center"
                                            onClick={handleLogout}
                                        >
                                            <FaSignOutAlt className="mr-2" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <p className="text-sm text-gray-500 mb-2">Vui lòng đăng nhập để tiếp tục</p>
                                        <Link
                                            to="/login"
                                            className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 rounded-md"
                                            onClick={() => setShowUserDropdown(false)}
                                        >
                                            Đăng nhập
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                                            onClick={() => setShowUserDropdown(false)}
                                        >
                                            Đăng ký
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ClientHeader;