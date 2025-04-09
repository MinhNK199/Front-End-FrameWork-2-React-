import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { Category } from '../../../interface/product';

// Dynamic import of icons from @ant-design/icons
import {
  // Công nghệ và thiết bị điện tử
  PhoneOutlined, // Điện thoại
  LaptopOutlined, // Máy tính xách tay
  TabletOutlined, // Máy tính bảng
  CameraOutlined, // Máy ảnh
  VideoCameraOutlined, // Máy quay phim
  AudioOutlined, // Thiết bị âm thanh (tai nghe, loa)
  DesktopOutlined, // Máy tính để bàn
  PrinterOutlined, // Máy in
  RobotOutlined, // Thiết bị thông minh (robot, nhà thông minh)

  // Thời trang và phụ kiện
  SkinOutlined, // Quần áo
  WomanOutlined, // Thời trang nữ
  ManOutlined, // Thời trang nam
  GiftOutlined, // Phụ kiện (quà tặng, trang sức)
  CrownOutlined, // Trang sức cao cấp
  EyeOutlined, // Kính mắt

  // Đồ gia dụng và nội thất
  HomeOutlined, // Đồ gia dụng, nội thất
  CarOutlined, // Ô tô, phụ kiện xe
  ToolOutlined, // Dụng cụ sửa chữa
  BulbOutlined, // Đèn, thiết bị chiếu sáng
  CoffeeOutlined, // Đồ dùng nhà bếp (cốc, ly)
  ShopOutlined, // Cửa hàng (đồ gia dụng nói chung)

  // Thực phẩm và đồ uống
  AppleOutlined, // Thực phẩm (trái cây)
  CoffeeOutlined as DrinkOutlined, // Đồ uống (cà phê, nước giải khát)
  ShoppingOutlined, // Giỏ hàng (thực phẩm nói chung)

  // Sách và văn phòng phẩm
  BookOutlined, // Sách
  FileTextOutlined, // Văn phòng phẩm

  // Sức khỏe và làm đẹp
  HeartOutlined, // Sản phẩm sức khỏe
  SmileOutlined, // Mỹ phẩm, làm đẹp

  // Thể thao và giải trí
  PlayCircleOutlined, // Thiết bị giải trí (video, âm nhạc)
  TrophyOutlined, // Dụng cụ thể thao
  RocketOutlined, // Đồ chơi, giải trí

  // Các danh mục khác
  TagOutlined, // Khuyến mãi, giảm giá
  GiftOutlined as GiftPromoOutlined, // Quà tặng khuyến mãi
} from '@ant-design/icons';

// Mapping icon names to icon components
const iconMap: { [key: string]: React.ReactNode } = {
  // Công nghệ và thiết bị điện tử
  PhoneOutlined: <PhoneOutlined />,
  LaptopOutlined: <LaptopOutlined />,
  TabletOutlined: <TabletOutlined />,
  CameraOutlined: <CameraOutlined />,
  VideoCameraOutlined: <VideoCameraOutlined />,
  AudioOutlined: <AudioOutlined />,
  DesktopOutlined: <DesktopOutlined />,
  PrinterOutlined: <PrinterOutlined />,
  RobotOutlined: <RobotOutlined />,

  // Thời trang và phụ kiện
  SkinOutlined: <SkinOutlined />,
  WomanOutlined: <WomanOutlined />,
  ManOutlined: <ManOutlined />,
  GiftOutlined: <GiftOutlined />,
  CrownOutlined: <CrownOutlined />,
  EyeOutlined: <EyeOutlined />,

  // Đồ gia dụng và nội thất
  HomeOutlined: <HomeOutlined />,
  CarOutlined: <CarOutlined />,
  ToolOutlined: <ToolOutlined />,
  BulbOutlined: <BulbOutlined />,
  CoffeeOutlined: <CoffeeOutlined />,
  ShopOutlined: <ShopOutlined />,

  // Thực phẩm và đồ uống
  AppleOutlined: <AppleOutlined />,
  DrinkOutlined: <DrinkOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,

  // Sách và văn phòng phẩm
  BookOutlined: <BookOutlined />,
  FileTextOutlined: <FileTextOutlined />,

  // Sức khỏe và làm đẹp
  HeartOutlined: <HeartOutlined />,
  SmileOutlined: <SmileOutlined />,

  // Thể thao và giải trí
  PlayCircleOutlined: <PlayCircleOutlined />,
  TrophyOutlined: <TrophyOutlined />,
  RocketOutlined: <RocketOutlined />,

  // Các danh mục khác
  TagOutlined: <TagOutlined />,
  GiftPromoOutlined: <GiftPromoOutlined />,
};

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const columns: ColumnsType<Category> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
      render: (icon: string) => {
        // Render icon dựa trên tên icon từ API
        return icon && iconMap[icon] ? (
          <span style={{ fontSize: '20px', marginRight: '8px' }}>{iconMap[icon]}</span>
        ) : (
          'N/A'
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/categories');
      console.log('Danh sách danh mục:', response.data); // Debug dữ liệu
      setCategories(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      message.error('Không thể tải danh sách danh mục');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/dashboard/category/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:4000/categories/${id}`);
      console.log('Phản hồi DELETE:', response.status, response.data); // Debug
      if (response.status === 200 || response.status === 204) {
        message.success('Xóa danh mục thành công!');
        await fetchCategories(); // Làm mới dữ liệu từ server
      } else {
        throw new Error('Xóa không thành công');
      }
    } catch (error: any) {
      console.error('Lỗi khi xóa:', error.response?.data || error.message);
      message.error('Không thể xóa danh mục');
      await fetchCategories(); // Làm mới để đồng bộ
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6 bg-white h-screen">
      <h2 className="text-2xl font-bold mb-4">Danh sách danh mục</h2>
      <Button
        type="primary"
        onClick={() => navigate('/dashboard/category/add')}
        className="mb-4"
      >
        Thêm danh mục
      </Button>
      <Table<Category>
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: 'Không có dữ liệu' }}
      />
    </div>
  );
};

export default CategoryList;