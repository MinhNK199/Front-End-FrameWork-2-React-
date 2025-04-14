import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { Product, Category } from '../../../interface/product';

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Danh sách màu để hiển thị tên màu thay vì mã màu
  const colorOptions = [
    { label: 'Đen', value: 'black' },
    { label: 'Trắng', value: 'white' },
    { label: 'Xanh dương', value: 'blue' },
    { label: 'Xanh lá', value: 'green' },
    { label: 'Đỏ', value: 'red' },
    { label: 'Vàng', value: 'yellow' },
    { label: 'Xám', value: 'gray' },
    { label: 'Hồng', value: 'pink' },
    { label: 'Tím', value: 'purple' },
    { label: 'Cam', value: 'orange' },
    { label: 'Nâu', value: 'brown' },
    { label: 'Be', value: 'beige' },
    { label: 'Xanh ngọc', value: 'turquoise' },
    { label: 'Xanh oliu', value: 'olive' },
    { label: 'Đồng', value: 'bronze' },
    { label: 'Bạc', value: 'silver' },
    { label: 'Vàng ánh kim', value: 'gold' },
    { label: 'Xanh navy', value: 'navy' },
    { label: 'Hồng phấn', value: 'lightpink' },
    { label: 'Xám đậm', value: 'darkgray' },
  ];

  const columns: ColumnsType<Product> = [
    { title: 'ID', dataIndex: 'id', key: 'id', fixed: 'left', render: (id) => id ?? 'N/A' },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Giá gốc (VND)',
      dataIndex: 'oldPrice',
      key: 'oldPrice',
      render: (price) => price?.toLocaleString('vi-VN') ?? 'N/A'
    },
    {
      title: 'Giá sau sale (VND)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price?.toLocaleString('vi-VN') ?? 'N/A'
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: number | undefined) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : 'N/A';
      },
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => {
        const selectedColor = colorOptions.find((opt) => opt.value === color);
        return (
          <Space>
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: color,
                border: color === 'white' ? '1px solid #ccc' : 'none',
              }}
            />
            {selectedColor ? selectedColor.label : color || 'N/A'}
          </Space>
        );
      },
    },
    {
      title: 'Tình trạng',
      dataIndex: 'stockStatus',
      key: 'stockStatus',
      render: (stockStatus: boolean) => (stockStatus ? 'Còn hàng' : 'Hết hàng'),
    },
    { title: 'Đánh giá', dataIndex: 'rating', key: 'rating', render: (rating) => rating ?? '0' },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (
        <img src={image || '/placeholder.svg'} alt="product" style={{ width: '100px', height: 'auto' }} />
      ),
    },
    { title: 'Mã SKU', dataIndex: 'sku', key: 'sku', render: (sku) => sku ?? 'N/A' },
    { title: 'Thương hiệu', dataIndex: 'brand', key: 'brand', render: (brand) => brand ?? 'N/A' },
    {
      title: 'Trọng lượng (g)',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => weight?.toLocaleString('vi-VN') ?? 'N/A'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => desc?.substring(0, 50) + (desc?.length > 50 ? '...' : '') || 'N/A'
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right', // Cố định cột "Hành động" ở bên phải
      width: 150, // Đặt chiều rộng cố định để nút hiển thị đẹp
      render: (_: any, record: Product) => (
        <Space direction="vertical" size="small">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            disabled={!record.id} // Vô hiệu hóa nếu id là null
            onClick={() => confirmDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/products');
      console.log('Danh sách sản phẩm:', response.data); // Debug
      setProducts(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      message.error('Không thể tải danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:4000/categories');
      console.log('Danh sách danh mục:', response.data); // Debug
      setCategories(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      message.error('Không thể tải danh sách danh mục');
      setCategories([]);
    }
  };

  const handleEdit = (id: number | undefined) => {
    if (id) {
      navigate(`/dashboard/product/edit/${id}`);
    } else {
      message.error('Sản phẩm không có ID hợp lệ');
    }
  };

  const confirmDelete = (id: number | undefined) => {
    if (!id) {
      message.error('Không thể xóa: Sản phẩm không có ID');
      return;
    }
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      onOk: () => handleDelete(id),
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`http://localhost:4000/products/${id}`);
      console.log('Phản hồi DELETE:', response.status, response.data); // Debug
      if (response.status === 200 || response.status === 204) {
        message.success('Xóa sản phẩm thành công');
        await fetchProducts(); // Làm mới danh sách
      }
    } catch (error: any) {
      console.error('Lỗi khi xóa sản phẩm:', error.response?.data || error.message);
      message.error('Không thể xóa sản phẩm');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories(); // Lấy danh mục trước
      await fetchProducts();  // Sau đó lấy sản phẩm
    };
    loadData();
  }, []);

  return (
    <div className="p-6 bg-white h-screen">
      <h2 className="text-2xl font-bold mb-4">Danh sách sản phẩm</h2>
      <Button
        type="primary"
        onClick={() => navigate('/dashboard/product/add')}
        className="mb-4"
      >
        Thêm sản phẩm
      </Button>
      <Table<Product>
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1500 }} // Đảm bảo cuộn ngang hoạt động
        locale={{ emptyText: 'Không có dữ liệu' }}
      />
    </div>
  );
};

export default ProductList;