"use client";

import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { FaStar, FaFilter, FaSearch } from "react-icons/fa";

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

interface Filters {
  category: number | null;
  priceRange: [number, number];
  brand: string | null;
  inStock: boolean | null;
  sortBy: "price_asc" | "price_desc" | "rating" | "newest";
}

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q") || "";

  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [maxPrice, setMaxPrice] = useState(100000000);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    category: null,
    priceRange: [0, 100000000],
    brand: null,
    inStock: null,
    sortBy: "newest",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "";
  };

  const calculateDiscount = (oldPrice: number, price: number) => {
    if (oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="w-4 h-4 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative w-4 h-4">
            <FaStar className="w-4 h-4 text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <FaStar className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <FaStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-500">({rating})</span>
      </div>
    );
  };

  const updateFilters = (filterName: keyof Filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  useEffect(() => {
    if (searchResults.length === 0) return;

    let results = [...searchResults];

    if (filters.category !== null) {
      results = results.filter((product) => product.categoryId === filters.category);
    }

    results = results.filter(
      (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1],
    );

    if (filters.brand !== null) {
      results = results.filter((product) => product.brand === filters.brand);
    }

    if (filters.inStock !== null) {
      results = results.filter((product) => product.stockStatus === filters.inStock);
    }

    switch (filters.sortBy) {
      case "price_asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        results.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredResults(results);
  }, [filters, searchResults]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch("/db.json");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data: Database = await response.json();

        setCategories(data.categories || []);

        if (!query || query.trim().length < 2) {
          setSearchResults([]);
          setFilteredResults([]);
          setLoading(false);
          return;
        }

        const term = query.toLowerCase();
        const results = data.products.filter((product) => {
          const name = product.name?.toLowerCase() || "";
          const description = product.description?.toLowerCase() || "";
          const brand = product.brand?.toLowerCase() || "";
          return name.includes(term) || description.includes(term) || brand.includes(term);
        });

        console.log("Search Query:", query);
        console.log("Search Results:", results);

        setSearchResults(results);
        setFilteredResults(results);

        const uniqueBrands = Array.from(new Set(results.map((product) => product.brand)));
        setBrands(uniqueBrands);

        if (results.length > 0) {
          const highestPrice = Math.max(...results.map((product) => product.price));
          setMaxPrice(highestPrice);
          setPriceRange([0, highestPrice]);
          setFilters((prev) => ({
            ...prev,
            priceRange: [0, highestPrice],
          }));
        }
      } catch (error) {
        console.error("Error loading search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-red-500">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Kết quả tìm kiếm</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kết quả tìm kiếm cho: "{query}"</h1>
        <div className="flex items-center space-x-4">
          <button
            className="md:hidden flex items-center space-x-2 text-gray-700 hover:text-red-500"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            <span>Lọc</span>
          </button>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-gray-500">Sắp xếp theo:</span>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              value={filters.sortBy}
              onChange={(e) => updateFilters("sortBy", e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {showFilters && (
          <div className="md:hidden fixed inset-0 bg-white z-50 p-4 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bộ lọc</h2>
              <button className="text-gray-500 hover:text-red-500" onClick={() => setShowFilters(false)}>
                ×
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Danh mục</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cat-all-mobile"
                      name="category-mobile"
                      checked={filters.category === null}
                      onChange={() => updateFilters("category", null)}
                      className="mr-2"
                    />
                    <label htmlFor="cat-all-mobile">Tất cả</label>
                  </div>
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        id={`cat-${category.id}-mobile`}
                        name="category-mobile"
                        checked={filters.category === category.id}
                        onChange={() => updateFilters("category", category.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`cat-${category.id}-mobile`}>{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Khoảng giá</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      updateFilters("priceRange", [
                        filters.priceRange[0],
                        Number.parseInt(e.target.value),
                      ])
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Thương hiệu</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="brand-all-mobile"
                      name="brand-mobile"
                      checked={filters.brand === null}
                      onChange={() => updateFilters("brand", null)}
                      className="mr-2"
                    />
                    <label htmlFor="brand-all-mobile">Tất cả</label>
                  </div>
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center">
                      <input
                        type="radio"
                        id={`brand-${brand}-mobile`}
                        name="brand-mobile"
                        checked={filters.brand === brand}
                        onChange={() => updateFilters("brand", brand)}
                        className="mr-2"
                      />
                      <label htmlFor={`brand-${brand}-mobile`}>{brand}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Tình trạng</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-all-mobile"
                      name="stock-mobile"
                      checked={filters.inStock === null}
                      onChange={() => updateFilters("inStock", null)}
                      className="mr-2"
                    />
                    <label htmlFor="stock-all-mobile">Tất cả</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-in-mobile"
                      name="stock-mobile"
                      checked={filters.inStock === true}
                      onChange={() => updateFilters("inStock", true)}
                      className="mr-2"
                    />
                    <label htmlFor="stock-in-mobile">Còn hàng</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-out-mobile"
                      name="stock-mobile"
                      checked={filters.inStock === false}
                      onChange={() => updateFilters("inStock", false)}
                      className="mr-2"
                    />
                    <label htmlFor="stock-out-mobile">Hết hàng</label>
                  </div>
                </div>
              </div>
              <button
                className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                onClick={() => setShowFilters(false)}
              >
                Áp dụng
              </button>
            </div>
          </div>
        )}
        <div className="hidden md:block w-64 space-y-6">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h2 className="text-lg font-bold mb-4">Bộ lọc</h2>
            <div className="mb-6">
              <h3 className="font-medium mb-3">Danh mục</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cat-all"
                    name="category"
                    checked={filters.category === null}
                    onChange={() => updateFilters("category", null)}
                    className="mr-2"
                  />
                  <label htmlFor="cat-all">Tất cả</label>
                </div>
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`cat-${category.id}`}
                      name="category"
                      checked={filters.category === category.id}
                      onChange={() => updateFilters("category", category.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`cat-${category.id}`}>{category.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-medium mb-3">Khoảng giá</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{formatPrice(filters.priceRange[0])}</span>
                  <span>{formatPrice(filters.priceRange[1])}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    updateFilters("priceRange", [
                      filters.priceRange[0],
                      Number.parseInt(e.target.value),
                    ])
                  }
                  className="w-full"
                />
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-medium mb-3">Thương hiệu</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="brand-all"
                    name="brand"
                    checked={filters.brand === null}
                    onChange={() => updateFilters("brand", null)}
                    className="mr-2"
                  />
                  <label htmlFor="brand-all">Tất cả</label>
                </div>
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="radio"
                      id={`brand-${brand}`}
                      name="brand"
                      checked={filters.brand === brand}
                      onChange={() => updateFilters("brand", brand)}
                      className="mr-2"
                    />
                    <label htmlFor={`brand-${brand}`}>{brand}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">Tình trạng</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="stock-all"
                    name="stock"
                    checked={filters.inStock === null}
                    onChange={() => updateFilters("inStock", null)}
                    className="mr-2"
                  />
                  <label htmlFor="stock-all">Tất cả</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="stock-in"
                    name="stock"
                    checked={filters.inStock === true}
                    onChange={() => updateFilters("inStock", true)}
                    className="mr-2"
                  />
                  <label htmlFor="stock-in">Còn hàng</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="stock-out"
                    name="stock"
                    checked={filters.inStock === false}
                    onChange={() => updateFilters("inStock", false)}
                    className="mr-2"
                  />
                  <label htmlFor="stock-out">Hết hàng</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : filteredResults.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-500">Hiển thị {filteredResults.length} kết quả</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((product) => (
                  <Link
                    to={`/productdetail/${product.id}`}
                    key={product.id}
                    className="bg-white rounded-md shadow-sm hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="relative w-full h-48 bg-gray-200 rounded-t-md overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.oldPrice > product.price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          -{calculateDiscount(product.oldPrice, product.price)}%
                        </div>
                      )}
                      {!product.stockStatus && (
                        <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                          Hết hàng
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{product.brand}</span>
                        <span className="text-xs text-gray-500">{getCategoryName(product.categoryId)}</span>
                      </div>
                      <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-red-500">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>
                      {renderRatingStars(product.rating)}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-md shadow-sm">
              <FaSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-2">Không tìm thấy sản phẩm nào phù hợp</p>
              <p className="text-gray-500 mb-6">Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc</p>
              <Link
                to="/"
                className="inline-block bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                Quay lại trang chủ
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;