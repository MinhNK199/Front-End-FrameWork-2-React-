"use client";
import { useState, useEffect } from "react";
import { FaStar, FaRegHeart, FaApple } from "react-icons/fa"; // Giữ FaStar và FaRegHeart nếu cần
import { Button } from "antd"; // Sử dụng Button từ Ant Design
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HomeOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  PhoneOutlined,
  LaptopOutlined,
  TabletOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  SettingOutlined,
  ToolOutlined,
  CarOutlined,
  HeartOutlined,
  StarOutlined,
  GiftOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  CreditCardOutlined,
  BankOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  ShareAltOutlined,
  ArrowRightOutlined, // Thay thế FaChevronRight
  TruckOutlined, // Thay thế 🚚
  PhoneOutlined as PhoneSupportOutlined, // Thay thế 📞
  DollarCircleOutlined as MoneyBackOutlined, // Thay thế 💰
} from "@ant-design/icons";

// Định nghĩa interface cho sản phẩm
interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  rating?: number; // Tùy chọn, mặc định nếu API không trả về
  oldPrice?: number; // Tùy chọn cho giá cũ
}

// Định nghĩa interface cho danh mục
interface Category {
  id: number;
  name: string;
  icon?: string; // Thêm trường icon từ API
}

// Định nghĩa interface cho categoryIcons
interface CategoryIcon {
  id: number;
  name: string;
  icon: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIcons, setCategoryIcons] = useState<CategoryIcon[]>([]);
  const [loading, setLoading] = useState(true);

  // Hàm ánh xạ icon từ API hoặc mặc định
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      HomeOutlined: <HomeOutlined />,
      UserOutlined: <UserOutlined />,
      ShoppingCartOutlined: <ShoppingCartOutlined />,
      TagOutlined: <TagOutlined />,
      PhoneOutlined: <PhoneOutlined />,
      LaptopOutlined: <LaptopOutlined />,
      TabletOutlined: <TabletOutlined />,
      CameraOutlined: <CameraOutlined />,
      VideoCameraOutlined: <VideoCameraOutlined />,
      AudioOutlined: <AudioOutlined />,
      SettingOutlined: <SettingOutlined />,
      ToolOutlined: <ToolOutlined />,
      CarOutlined: <CarOutlined />,
      HeartOutlined: <HeartOutlined />,
      StarOutlined: <StarOutlined />,
      GiftOutlined: <GiftOutlined />,
      BulbOutlined: <BulbOutlined />,
      ThunderboltOutlined: <ThunderboltOutlined />,
      CloudOutlined: <CloudOutlined />,
      LockOutlined: <LockOutlined />,
      UnlockOutlined: <UnlockOutlined />,
      MailOutlined: <MailOutlined />,
      BellOutlined: <BellOutlined />,
      CalendarOutlined: <CalendarOutlined />,
      ClockCircleOutlined: <ClockCircleOutlined />,
      DollarCircleOutlined: <DollarCircleOutlined />,
      CreditCardOutlined: <CreditCardOutlined />,
      BankOutlined: <BankOutlined />,
      ShoppingOutlined: <ShoppingOutlined />,
      BarChartOutlined: <BarChartOutlined />,
      LineChartOutlined: <LineChartOutlined />,
      PieChartOutlined: <PieChartOutlined />,
      DownloadOutlined: <DownloadOutlined />,
      UploadOutlined: <UploadOutlined />,
      DeleteOutlined: <DeleteOutlined />,
      EditOutlined: <EditOutlined />,
      CopyOutlined: <CopyOutlined />,
      ShareAltOutlined: <ShareAltOutlined />,
      ArrowRightOutlined: <ArrowRightOutlined />, // Thay FaChevronRight
      TruckOutlined: <TruckOutlined />, // Thay 🚚
      PhoneSupportOutlined: <PhoneSupportOutlined />, // Thay 📞
      MoneyBackOutlined: <MoneyBackOutlined />, // Thay 💰
    };
    return iconMap[iconName] || <HomeOutlined />; // Mặc định HomeOutlined nếu không khớp
  };

  // Gọi API để lấy dữ liệu khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi API cho sản phẩm
        const productResponse = await axios.get("http://localhost:4000/products");
        const fetchedProducts = productResponse.data.map((product: Product) => ({
          ...product,
          rating: product.rating || 4, // Mặc định rating là 4 nếu không có
        }));
        setProducts(fetchedProducts);

        // Gọi API cho danh mục
        const categoryResponse = await axios.get("http://localhost:4000/categories");
        const fetchedCategories = categoryResponse.data.map((category: any) => ({
          id: category.id,
          name: category.name,
          icon: category.icon || "HomeOutlined", // Mặc định là HomeOutlined nếu không có
        }));
        setCategories(categoryResponse.data);
        setCategoryIcons(fetchedCategories);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hiển thị trạng thái loading
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Nếu không có dữ liệu
  if (!products.length && !categories.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Hiện tại đang không có Danh mục hay sản phẩm nào. Hãy thêm một vài thứ đi nào...
      </div>
    );
  }

  // Lấy 4 sản phẩm đầu tiên cho Best Selling Products
  const bestSellingProducts = products.slice(0, 4);
  // Lấy tất cả sản phẩm cho Explore Our Products
  const exploreProducts = products;

  return (
    <main className="max-w-7xl mx-auto">
      {/* Hero Banner */}
      <section className="py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="lg:w-1/4 bg-white p-4 rounded-l-lg shadow-md">
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-red-500 transition-colors duration-200 flex items-center justify-between"
                  >
                    <span>{category.name}</span>
                    <ArrowRightOutlined className="w-4 h-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-3/4 flex items-center bg-black text-white rounded-r-lg overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center w-full">
              <div className="lg:w-1/2 space-y-6 p-8">
                <h1 className="text-3xl lg:text-xl font-bold leading-tight flex items-center">
                  <FaApple className="mr-3 text-4xl lg:text-5xl" />
                  iPhone 14 Series
                </h1>
                <h2 className="text-2xl lg:text-4xl font-semibold">
                  Up to 10% <br />
                  off Voucher
                </h2>
                <Button
                  className="bg-white text-black px-6 py-3 rounded-md font-semibold text-sm flex items-center space-x-2 hover:bg-gray-200 transition-colors duration-200"
                >
                  <span>Shop Now</span>
                  <ArrowRightOutlined className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="lg:w-1/2 p-0">
                <img
                  src="/src/assets/Iphone 14.jpg"
                  alt="iPhone 14"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center space-x-2 mt-6">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`w-3 h-3 rounded-full ${index === 0 ? "bg-gray-800" : "bg-gray-300"}`}
            ></span>
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-12 lg:py-16">
        <div className="relative">
          <h3 className="text-lg font-bold mb-4 text-red-500">
            <span className="inline-block w-2 h-6 bg-red-500 mr-2"></span>
            Categories
          </h3>
          <h2 className="text-2xl lg:text-3xl font-bold mb-8 px-4 lg:px-0">
            Browse by Category
          </h2>
          <div className="flex overflow-x-auto space-x-8 px-8 lg:px-0 scrollbar-hide">
            {categoryIcons.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0 w-60 h-60 border border-gray-200 rounded-md flex flex-col items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors duration-200"
                onClick={() => navigate(`/category/${category.id}`)} // Chuyển hướng đến trang Category với categoryId
              >
                <span className="text-5xl mb-4">
                  {getIconComponent(category.icon)}
                </span>
                <span className="text-xl font-semibold">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Selling Products */}
      <section className="py-12 lg:py-16">
        <div className="relative">
          <h3 className="text-lg font-bold mb-4 text-red-500">
            <span className="inline-block w-2 h-6 bg-red-500 mr-2"></span>
            This Month
          </h3>
          <div className="flex justify-between items-center mb-8 px-4 lg:px-0">
            <h2 className="text-2xl lg:text-3xl font-bold">Best Selling Products</h2>
            <Button
              className="bg-red-500 text-white px-6 py-2 rounded-md font-semibold text-sm hover:bg-red-600 transition-colors duration-200"
              onClick={() => navigate("/category")}
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 lg:px-0">
            {bestSellingProducts &&
              bestSellingProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-md shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer relative group"
                  onClick={() => navigate(`/productdetail/${product.id}`)}
                >
                  <div className="relative w-full h-48 bg-gray-200 rounded-t-md overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
                      <FaRegHeart className="w-5 h-5" />
                    </button>
                    {/* Nút Xem Thông tin với transform */}
                    <button className="absolute bottom-0 left-0 right-0 bg-black text-white py-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      Xem Thông Tin
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-red-500">
                        {product.price.toLocaleString()} VND
                      </span>
                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {product.oldPrice.toLocaleString()} VND
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-4 h-4 ${i < (product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="text-sm text-gray-500">({product.rating || 0})</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Enhance Your Music Experience */}
      <section className="py-12 lg:py-16 bg-gray-900 text-white rounded-lg">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 space-y-6 p-8">
            <h3 className="text-lg font-bold mb-4 text-green-500">Categories</h3>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
              Enhance Your <br /> Music Experience
            </h2>
            <div className="flex space-x-4">
              {["23 Hours", "06 Days", "59 Min", "55 Sec"].map((time, index) => {
                const [value, unit] = time.split(" ");
                return (
                  <div
                    key={index}
                    className="bg-white text-black rounded-full w-16 h-16 flex flex-col items-center justify-center"
                  >
                    <span className="text-lg font-semibold">{value}</span>
                    <span className="text-xs">{unit}</span>
                  </div>
                );
              })}
            </div>
            <Button
              className="bg-green-500 text-white px-6 py-3 rounded-md font-semibold text-sm hover:bg-green-600 transition-colors duration-200"
            >
              Buy Now!
            </Button>
          </div>
          <div className="lg:w-1/2 p-8">
            <img
              src="/src/assets/Frame 694.png"
              alt="Speaker"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Explore Our Products */}
      <section className="py-12 lg:py-16">
        <div className="relative">
          <h3 className="text-lg font-bold mb-4 text-red-500">
            <span className="inline-block w-2 h-6 bg-red-500 mr-2"></span>
            Our Products
          </h3>
          <div className="flex justify-between items-center mb-8 px-4 lg:px-0">
            <h2 className="text-2xl lg:text-3xl font-bold">Explore Our Products</h2>
            <Button
              className="bg-red-500 text-white px-6 py-2 rounded-md font-semibold text-sm hover:bg-red-600 transition-colors duration-200"
              onClick={() => navigate("/category")}
            >
              View All Products
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 lg:px-0">
            {exploreProducts &&
              exploreProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-md shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer relative group"
                  onClick={() => navigate(`/productdetail/${product.id}`)}
                >
                  <div className="relative w-full h-60 bg-gray-200 rounded-t-md overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
                      <FaRegHeart className="w-5 h-5" />
                    </button>
                    {/* Nút Xem Thông tin với transform */}
                    <button className="absolute bottom-0 left-0 right-0 bg-black text-white py-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      Xem Thông Tin
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-red-500">
                        {product.price.toLocaleString()} VND
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-4 h-4 ${i < (product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="text-sm text-gray-500">({product.rating || 0})</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* New Arrival */}
      <section className="py-12 lg:py-16">
        <div className="relative">
          <h3 className="text-lg font-bold mb-4 text-red-500">
            <span className="inline-block w-2 h-6 bg-red-500 mr-2"></span>
            Featured
          </h3>
          <h2 className="text-2xl lg:text-3xl font-bold mb-8 px-4 lg:px-0">New Arrival</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-0">
            <div
              className="relative bg-gray-900 text-white rounded-md overflow-hidden"
              style={{ height: "500px" }}
            >
              <img
                src="/src/assets/PS 5.png"
                alt="PlayStation 5"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute bottom-6 left-6 space-y-2">
                <h3 className="text-2xl font-bold">PlayStation 5</h3>
                <p className="text-gray-300">Black and White version of the PS5</p>
                <Button
                  className="bg-white text-black px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-200 transition-colors duration-200"
                >
                  Shop Now
                </Button>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-1 gap-6">
                {[
                  {
                    title: "Women's Collections",
                    subtitle: "Featured woman collections that",
                    image: "/src/assets/Woman Col.png",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="relative bg-gray-900 text-white rounded-md overflow-hidden"
                    style={{ height: "225px" }}
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute bottom-4 left-4 space-y-2">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <p className="text-gray-300">{item.subtitle}</p>
                      <Button
                        className="bg-white text-black px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-200 transition-colors duration-200"
                      >
                        Shop Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-6 mt-6">
                {[
                  {
                    title: "Speakers",
                    subtitle: "Amazon wireless speakers",
                    image: "/src/assets/Speaker.png",
                  },
                  {
                    title: "Perfume",
                    subtitle: "GUCCI INTENSE OUD EDP",
                    image: "/src/assets/Perfume.png",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="relative bg-gray-900 text-white rounded-md overflow-hidden"
                    style={{ height: "250px" }}
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute bottom-4 left-4 space-y-2">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <p className="text-gray-300">{item.subtitle}</p>
                      <Button
                        className="bg-white text-black px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-200 transition-colors duration-200"
                      >
                        Shop Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-0">
          {[
            {
              icon: "TruckOutlined",
              title: "FREE AND FAST DELIVERY",
              subtitle: "Free delivery for all orders $140",
            },
            {
              icon: "PhoneSupportOutlined",
              title: "24/7 CUSTOMER SERVICE",
              subtitle: "Friendly 24/7 customer support",
            },
            {
              icon: "MoneyBackOutlined",
              title: "MONEY BACK GUARANTEE",
              subtitle: "We return money within 30 days",
            },
          ].map((service, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                <span className="text-2xl">{getIconComponent(service.icon)}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;