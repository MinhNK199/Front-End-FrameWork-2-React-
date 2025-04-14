
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Product {
  id: number;
  name: string;
  categoryId: number;
  price: number;
}

interface Category {
  id: number;
  name: string;
}

interface OrderItem {
  productId: Product;
  quantity: number;
  price: number;
  productName: string;
}

interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

const RevenueStatistics = () => {
  const [data, setData] = useState<{
    orders: Order[];
    products: Product[];
    categories: Category[];
  }>({ orders: [], products: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersResponse = await fetch('http://localhost:4000/orders');
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders');
        }
        const orders: Order[] = await ordersResponse.json();

        // Derive products from orders
        const productsMap = new Map<number, Product>();
        orders.forEach(order => {
          order.items.forEach(item => {
            const product = item.productId;
            if (!productsMap.has(product.id)) {
              productsMap.set(product.id, {
                id: product.id,
                name: product.name,
                categoryId: product.categoryId,
                price: product.price,
              });
            }
          });
        });
        const products = Array.from(productsMap.values());

        // Static categories (adjust if fetching from API)
        const categories: Category[] = [
          { id: 1, name: 'Điện Thoại Di Động' },
          { id: 2, name: 'Laptop' },
        ];

        // Optional: Fetch categories if needed
        /*
        const categoriesResponse = await fetch('http://localhost:4000/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categories: Category[] = await categoriesResponse.json();
        */

        setData({ orders, products, categories });
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  // Calculate summary metrics
  const totalRevenue = data.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = data.orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by date (for line chart)
  const revenueByDate = data.orders.reduce((acc: Record<string, number>, order) => {
    const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
    acc[date] = (acc[date] || 0) + order.totalAmount;
    return acc;
  }, {});
  const revenueData = Object.keys(revenueByDate).map(date => ({
    date,
    revenue: revenueByDate[date],
  }));

  // Revenue by product (for bar chart)
  const productRevenue = data.orders.reduce((acc: Record<string, number>, order) => {
    order.items.forEach(item => {
      const productName = item.productName;
      acc[productName] = (acc[productName] || 0) + item.quantity * item.price;
    });
    return acc;
  }, {});
  const productData = Object.keys(productRevenue)
    .map(name => ({
      name,
      revenue: productRevenue[name],
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Revenue by category (for pie chart)
  const categoryRevenue = data.orders.reduce((acc: Record<string, number>, order) => {
    order.items.forEach(item => {
      const category = data.categories.find(cat => cat.id === item.productId.categoryId)?.name || 'Unknown';
      acc[category] = (acc[category] || 0) + item.quantity * item.price;
    });
    return acc;
  }, {});
  const categoryData = Object.keys(categoryRevenue).map(name => ({
    name,
    value: categoryRevenue[name],
  }));

  // Interesting fact: Check if iPhone 16 dominates sales
  const topProduct = productData[0];
  const totalProductRevenue = productData.reduce((sum, item) => sum + item.revenue, 0);
  const topProductPercentage = topProduct ? (topProduct.revenue / totalProductRevenue * 100).toFixed(1) : 0;

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Format number as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Thống Kê Doanh Thu</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">Tổng Doanh Thu</h2>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">Số Đơn Hàng</h2>
          <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">Giá Trị Đơn Hàng Trung Bình</h2>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(avgOrderValue)}</p>
        </div>
      </div>

      {/* Interesting Fact */}
      {topProduct && (
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold text-blue-800">Thông Tin Thú Vị</h3>
          <p className="text-gray-700">
            Sản phẩm "{topProduct.name}" chiếm {topProductPercentage}% tổng doanh thu, cho thấy nhu cầu mạnh mẽ đối với dòng sản phẩm này!
          </p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-600">Doanh Thu Theo Thời Gian</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <XAxis dataKey="date" style={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)} M`}
                style={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Doanh Thu" stroke="#0088FE" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-600">Sản Phẩm Bán Chạy</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productData}>
              <XAxis dataKey="name" style={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)} M`}
                style={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" name="Doanh Thu" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-600">Doanh Thu Theo Danh Mục</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueStatistics;
