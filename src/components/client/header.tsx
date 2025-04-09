"use client"

import type React from "react"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { FaGlobe, FaHeart, FaSearch, FaShoppingCart, FaTimes } from "react-icons/fa"
import { Link, useNavigate, useLocation } from "react-router-dom"

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
    sku: string
    brand: string
    weight: number
    description: string
    type: string
    parent: number
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

const ClientHeader = () => {
    const navigate = useNavigate()
    const location = useLocation() // Thêm hook useLocation
    // State để lưu trữ từ khóa tìm kiếm
    const [searchTerm, setSearchTerm] = useState("")
    // State để lưu trữ kết quả tìm kiếm
    const [searchResults, setSearchResults] = useState<Product[]>([])
    // State để kiểm soát việc hiển thị dropdown kết quả
    const [showResults, setShowResults] = useState(false)
    // State để lưu trữ tất cả sản phẩm
    const [allProducts, setAllProducts] = useState<Product[]>([])
    // State để lưu trữ tất cả danh mục
    const [categories, setCategories] = useState<Category[]>([])
    // State để theo dõi trạng thái loading
    const [loading, setLoading] = useState(false)

    // Ref để xử lý click outside
    const searchRef = useRef<HTMLDivElement>(null)

    // Tải dữ liệu sản phẩm từ db.json
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/db.json")
                if (!response.ok) {
                    throw new Error("Failed to fetch data")
                }
                const data: Database = await response.json()
                setAllProducts(data.products || [])
                setCategories(data.categories || [])
            } catch (error) {
                console.error("Error loading data:", error)
            }
        }

        fetchData()
    }, [])

    // Xử lý tìm kiếm khi người dùng nhập
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchResults([])
            setShowResults(false)
            return
        }

        setLoading(true)

        // Sử dụng setTimeout để tạo hiệu ứng debounce
        const timer = setTimeout(() => {
            const filteredResults = allProducts.filter((product) =>
                product.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(filteredResults)
            setShowResults(true)
            setLoading(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm, allProducts])

    // Xử lý click outside để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Xử lý khi người dùng nhập vào ô tìm kiếm
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    // Xử lý khi đường dẫn thay đổi
    useEffect(() => {
        // Nếu không phải trang kết quả tìm kiếm, xóa từ khóa tìm kiếm
        if (!location.pathname.includes("/search")) {
            // Kiểm tra nếu đang ở trang chi tiết sản phẩm và có từ khóa tìm kiếm trước đó
            const isFromSearch = sessionStorage.getItem("lastSearchTerm")
            const isProductDetail = location.pathname.includes("/productdetail")

            // Nếu không phải từ trang tìm kiếm đến trang chi tiết sản phẩm, xóa từ khóa
            if (!(isProductDetail && isFromSearch)) {
                setSearchTerm("")
            }
        } else {
            // Nếu đang ở trang kết quả tìm kiếm, lấy từ khóa từ URL
            const searchParams = new URLSearchParams(location.search)
            const query = searchParams.get("q") || ""
            setSearchTerm(query)

            // Lưu từ khóa tìm kiếm vào sessionStorage để biết người dùng đến từ tìm kiếm
            if (query) {
                sessionStorage.setItem("lastSearchTerm", query)
            }
        }

        // Đóng dropdown kết quả khi chuyển trang
        setShowResults(false)
    }, [location])

    // Xử lý khi người dùng submit form tìm kiếm
    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (searchTerm.trim()) {
            setShowResults(false)
            // Lưu từ khóa tìm kiếm vào sessionStorage
            sessionStorage.setItem("lastSearchTerm", searchTerm)
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
        }
    }

    // Xử lý khi người dùng click vào một kết quả tìm kiếm
    const handleResultClick = (productId: number) => {
        setShowResults(false)
        // Lưu từ khóa tìm kiếm vào sessionStorage trước khi chuyển trang
        sessionStorage.setItem("lastSearchTerm", searchTerm)
        navigate(`/productdetail/${productId}`)
    }

    // Xóa từ khóa tìm kiếm
    const clearSearch = () => {
        setSearchTerm("")
        setSearchResults([])
        setShowResults(false)
    }

    // Hàm định dạng giá tiền
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
    }

    // Hàm lấy tên danh mục từ categoryId
    const getCategoryName = (categoryId: number) => {
        const category = categories.find((cat) => cat.id === categoryId)
        return category ? category.name : ""
    }

    return (
        <header className="bg-white text-black">
            {/* Top Promotional Bar */}
            <div className="bg-black text-white py-2 text-sm relative">
                <div className="flex justify-between items-center px-4 lg:px-8">
                    {/* Promotional Text */}
                    <p className="text-center flex-1">
                        SUMMER SALE FOR ALL SWIM SUITS AND FREE EXPRESS DELIVERY - OFF 50%!{" "}
                        <a href="#" className="underline hover:text-gray-300 transition-colors duration-200">
                            SHOP NOW
                        </a>
                    </p>

                    {/* Language Dropdown */}
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
                        {/* Dropdown Menu (Hidden by Default, Visible on Hover) */}
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

            {/* Main Header */}
            <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 lg:px-0">
                {/* Logo */}
                <div className="text-2xl font-bold">
                    <Link to="/" className="hover:text-gray-600 transition-colors duration-200">
                        EXCLUSIVE
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="hidden lg:flex space-x-18">
                    {" "}
                    {/* Using custom space-x-18 (72px) */}
                    <Link
                        to="/"
                        className="text-base font-medium hover:text-gray-600 hover:underline hover:underline-offset-4 transition-all duration-200"
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
                    <Link
                        to="/login"
                        className="text-base font-medium hover:text-gray-600 hover:underline hover:underline-offset-4 transition-all duration-200"
                    >
                        Sign Up
                    </Link>
                </nav>

                {/* Right Side Icons */}
                <div className="flex items-center space-x-4">
                    {/* Search Icon with Dropdown */}
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
                                            setShowResults(true)
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

                        {/* Search Results Dropdown */}
                        {showResults && (
                            <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-50 max-h-96 overflow-auto">
                                {loading ? (
                                    <div className="p-4 text-center text-gray-500">Đang tìm kiếm...</div>
                                ) : searchResults.length > 0 ? (
                                    <>
                                        <div className="p-2">
                                            {/* Hiển thị tối đa 3 kết quả */}
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

                                        {/* Hiển thị "Xem tất cả kết quả" với số lượng kết quả */}
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

                    {/* User Heart Icon */}
                    <button className="hover:text-gray-600 transition-colors duration-200">
                        <FaHeart className="w-5 h-5" />
                    </button>

                    {/* Cart Icon */}
                    <button className="hover:text-gray-600 transition-colors duration-200">
                        <FaShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default ClientHeader

