import { DashboardFilled, DatabaseOutlined, FileTextFilled, HighlightFilled, ProductFilled, ReconciliationOutlined } from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();

  const items: MenuItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardFilled /> },
    {
      key: 'productmanage',
      label: 'Quản lý danh mục',
      icon: <DatabaseOutlined />,
      children: [
        { key: 'categorylist', label: 'Danh sách Danh mục' },
        { key: 'categoryadd', label: 'Thêm Danh mục' },
      ],
    },
    {
      key: 'productmanage',
      label: 'Quản lý sản phẩm',
      icon: <ReconciliationOutlined />,
      children: [
        { key: 'productlist', label: 'Danh sách Sản phẩm' },
        { key: 'productadd', label: 'Thêm Sản phẩm' },
      ],
    },
    // Các mục khác giữ nguyên
  ];

  const onClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'categorylist':
        navigate('/dashboard/category');
        break;
      case 'categoryadd':
        navigate('/dashboard/category/add');
        break;
      case 'productlist':
        navigate('/dashboard/product');
        break;
      case 'productadd':
        navigate('/dashboard/product/add');
        break;
      // Thêm các case khác nếu cần
      default:
        break;
    }
  };

  return (
    <div className="w-1/5 h-screen bg-white">
      <Menu
        onClick={onClick}
        style={{ width: '100%' }}
        defaultSelectedKeys={['dashboard']}
        mode="inline"
        items={items}
      />
    </div>
  );
};

export default AdminSidebar;