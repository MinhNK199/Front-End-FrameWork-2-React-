import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import ClientLayout from './layout/client';
import AdminLayout from './layout/admin';
import Home from './components/client/home';
import Login from './components/client/login';
import Category from './components/client/category';
import ProductDetail from './components/client/productDetail';
import NotFound from './components/client/notFoundClient';
import CategoryAdd from './components/admin/category/categoryAdd';
import ProductList from './components/admin/product/productList';
import ProductAdd from './components/admin/product/productAdd';
import CategoryList from './components/admin/category/category';
import NotFoundAdmin from './components/admin/notFoundAdmin';
import CategoryEdit from './components/admin/category/categoryEdit';
import ProductEdit from './components/admin/product/productEdit';
import SearchResults from './components/client/searchResult';

type Props = {};

const App = (props: Props) => {
  const routes = useRoutes([
    {
      path: '/',
      element: <ClientLayout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/login', element: <Login /> },
        { path: '/category/:categoryId', element: <Category /> }, // Thêm :categoryId để hỗ trợ danh mục động
        { path: '/productdetail/:productId', element: <ProductDetail /> }, // Thêm :productId để hỗ trợ sản phẩm động
        { path: 'notFound', element: <NotFound /> }, // Explicit NotFound page route
        { path: 'search', element: <SearchResults /> }, // Thêm route cho trang tìm kiếm
        { path: '*', element: <Navigate to="/notFound" /> }, // Chuyển hướng các route không hợp lệ
      ],
    },
    {
      path: '/dashboard',
      element: <AdminLayout />,
      children: [
        { path: 'category', element: <CategoryList /> },
        { path: 'category/add', element: <CategoryAdd /> },
        { path: 'category/edit/:id', element: <CategoryEdit /> },
        { path: 'product', element: <ProductList /> },
        { path: 'product/add', element: <ProductAdd /> },
        { path: 'product/edit/:id', element: <ProductEdit /> },
        { path: 'notFoundAdmin', element: <NotFoundAdmin /> }, // Explicit NotFound page route
        { path: '*', element: <Navigate to="/dashboard/notFoundAdmin" /> }, // Chuyển hướng các route không hợp lệ trong dashboard
      ],
    },
  ]);

  return routes;
};

export default App;