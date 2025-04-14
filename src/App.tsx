import { useRoutes, Navigate } from "react-router-dom"
import ClientLayout from "./layout/client"
import AdminLayout from "./layout/admin"

import Category from "./components/client/category"
import ProductDetail from "./components/client/productDetail"
import NotFound from "./components/client/notFoundClient"
import CategoryAdd from "./components/admin/category/categoryAdd"
import ProductList from "./components/admin/product/productList"
import ProductAdd from "./components/admin/product/productAdd"
import CategoryList from "./components/admin/category/category"
import NotFoundAdmin from "./components/admin/notFoundAdmin"
import CategoryEdit from "./components/admin/category/categoryEdit"
import ProductEdit from "./components/admin/product/productEdit"
import SearchResults from "./components/client/searchResult"
import UserManagement from "./components/admin/user/userManagement"
import { withAuth } from "./components/context/authContext"
import UserProfile from "./components/client/user/userProfile"
import Home from "./components/client/home"
import UserDetail from "./components/admin/user/userDetail"
import Register from "./components/register"
import Cart from "./components/client/cart"
import Checkout from "./components/client/checkout"
import OrderHistory from "./components/client/orderHistory"
import Login from "./components/login"
import RevenueStatistics from "./components/admin/revenueStatistics/RevenueStatisticst"

// Bảo vệ các route admin
const ProtectedUserManagement = withAuth(UserManagement, true)
const ProtectedUserDetail = withAuth(UserDetail, true) // Protect UserDetail
const ProtectedProductList = withAuth(ProductList, true)
const ProtectedProductAdd = withAuth(ProductAdd, true)
const ProtectedProductEdit = withAuth(ProductEdit, true)
const ProtectedCategoryList = withAuth(CategoryList, true)
const ProtectedCategoryAdd = withAuth(CategoryAdd, true)
const ProtectedCategoryEdit = withAuth(CategoryEdit, true)
const ProtectedCart = withAuth(Cart)
const ProtectedCheckout = withAuth(Checkout)
const ProtectedOrderHistory = withAuth(OrderHistory)
const ProtectedStatistics = withAuth(RevenueStatistics, true) // Bảo vệ route thống kê doanh thu


// Bảo vệ các route client cần đăng nhập
const ProtectedUserProfile = withAuth(UserProfile)

const App = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: <ClientLayout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/category/:categoryId", element: <Category /> },
        { path: "/productdetail/:productId", element: <ProductDetail /> },
        { path: "/search", element: <SearchResults /> },
        { path: "/profile", element: <ProtectedUserProfile /> },
        { path: "/carts", element: <ProtectedCart /> },
        { path: "/checkout", element: <ProtectedCheckout /> },
        { path: "/orders", element: <ProtectedOrderHistory /> },
        { path: "/notFound", element: <NotFound /> },
        { path: "*", element: <Navigate to="/notFound" /> },
      ],
    },
    {
      path: "/dashboard",
      element: <AdminLayout />,
      children: [
        { path: "", element: <Navigate to="/dashboard/product" /> },
        { path: "category", element: <ProtectedCategoryList /> },
        { path: "category/add", element: <ProtectedCategoryAdd /> },
        { path: "category/edit/:id", element: <ProtectedCategoryEdit /> },
        { path: "user", element: <ProtectedUserManagement /> },
        { path: "user/:id", element: <ProtectedUserDetail /> }, // Add UserDetail route
        { path: "product", element: <ProtectedProductList /> },
        { path: "product/add", element: <ProtectedProductAdd /> },
        { path: "product/edit/:id", element: <ProtectedProductEdit /> },
        { path: "statistics", element: <ProtectedStatistics /> },
        { path: "notFoundAdmin", element: <NotFoundAdmin /> },
        { path: "*", element: <Navigate to="/dashboard/notFoundAdmin" /> },
      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "*", element: <Navigate to="/notFound" /> },
  ])

  return routes
}

export default App