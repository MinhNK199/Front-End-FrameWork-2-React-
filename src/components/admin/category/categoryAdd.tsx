import React, { useState } from 'react';
import { Form, Input, Button, message, Modal, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  // Công nghệ và thiết bị điện tử
  PhoneOutlined,
  LaptopOutlined,
  TabletOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  DesktopOutlined,
  PrinterOutlined,
  RobotOutlined,

  // Thời trang và phụ kiện
  SkinOutlined,
  WomanOutlined,
  ManOutlined,
  GiftOutlined,
  CrownOutlined,
  EyeOutlined,

  // Đồ gia dụng và nội thất
  HomeOutlined,
  CarOutlined,
  ToolOutlined,
  BulbOutlined,
  CoffeeOutlined,
  ShopOutlined,

  // Thực phẩm và đồ uống
  AppleOutlined,
  CoffeeOutlined as DrinkOutlined,
  ShoppingOutlined,

  // Sách và văn phòng phẩm
  BookOutlined,
  FileTextOutlined,

  // Sức khỏe và làm đẹp
  HeartOutlined,
  SmileOutlined,

  // Thể thao và giải trí
  PlayCircleOutlined,
  TrophyOutlined,
  RocketOutlined,

  // Các danh mục khác
  TagOutlined,
  GiftOutlined as GiftPromoOutlined,
} from '@ant-design/icons';

interface CategoryForm {
  name: string;
  description: string;
  icon?: string;
}

const CategoryAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Danh sách icon tinh chỉnh cho danh mục sản phẩm
  const iconOptions = [
    // Công nghệ và thiết bị điện tử
    { label: <PhoneOutlined />, value: 'PhoneOutlined' },
    { label: <LaptopOutlined />, value: 'LaptopOutlined' },
    { label: <TabletOutlined />, value: 'TabletOutlined' },
    { label: <CameraOutlined />, value: 'CameraOutlined' },
    { label: <VideoCameraOutlined />, value: 'VideoCameraOutlined' },
    { label: <AudioOutlined />, value: 'AudioOutlined' },
    { label: <DesktopOutlined />, value: 'DesktopOutlined' },
    { label: <PrinterOutlined />, value: 'PrinterOutlined' },
    { label: <RobotOutlined />, value: 'RobotOutlined' },

    // Thời trang và phụ kiện
    { label: <SkinOutlined />, value: 'SkinOutlined' },
    { label: <WomanOutlined />, value: 'WomanOutlined' },
    { label: <ManOutlined />, value: 'ManOutlined' },
    { label: <GiftOutlined />, value: 'GiftOutlined' },
    { label: <CrownOutlined />, value: 'CrownOutlined' },
    { label: <EyeOutlined />, value: 'EyeOutlined' },

    // Đồ gia dụng và nội thất
    { label: <HomeOutlined />, value: 'HomeOutlined' },
    { label: <CarOutlined />, value: 'CarOutlined' },
    { label: <ToolOutlined />, value: 'ToolOutlined' },
    { label: <BulbOutlined />, value: 'BulbOutlined' },
    { label: <CoffeeOutlined />, value: 'CoffeeOutlined' },
    { label: <ShopOutlined />, value: 'ShopOutlined' },

    // Thực phẩm và đồ uống
    { label: <AppleOutlined />, value: 'AppleOutlined' },
    { label: <DrinkOutlined />, value: 'DrinkOutlined' },
    { label: <ShoppingOutlined />, value: 'ShoppingOutlined' },

    // Sách và văn phòng phẩm
    { label: <BookOutlined />, value: 'BookOutlined' },
    { label: <FileTextOutlined />, value: 'FileTextOutlined' },

    // Sức khỏe và làm đẹp
    { label: <HeartOutlined />, value: 'HeartOutlined' },
    { label: <SmileOutlined />, value: 'SmileOutlined' },

    // Thể thao và giải trí
    { label: <PlayCircleOutlined />, value: 'PlayCircleOutlined' },
    { label: <TrophyOutlined />, value: 'TrophyOutlined' },
    { label: <RocketOutlined />, value: 'RocketOutlined' },

    // Các danh mục khác
    { label: <TagOutlined />, value: 'TagOutlined' },
    { label: <GiftPromoOutlined />, value: 'GiftPromoOutlined' },
  ];

  const onFinish = async (values: CategoryForm) => {
    try {
      await axios.post('http://localhost:4000/categories', {
        ...values,
        icon: values.icon || null,
      });
      message.success('Thêm danh mục thành công');
      navigate('/dashboard/category');
    } catch (error) {
      message.error('Lỗi khi thêm danh mục');
      console.error(error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = (selectedIcon: string) => {
    form.setFieldsValue({ icon: selectedIcon });
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="p-6 bg-white h-screen">
      <h2 className="text-2xl font-bold mb-4">Thêm danh mục</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: 'Tên danh mục không được để trống' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Icon"
          name="icon"
          rules={[{ required: false }]}
        >
          <Input
            readOnly
            placeholder="Chọn icon"
            value={form.getFieldValue('icon')}
            onClick={showModal}
            addonAfter={<Button onClick={showModal}>Chọn</Button>}
          />
        </Form.Item>
        <Form.Item label="Mô tả" name="description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm
          </Button>
          <Button onClick={() => navigate('/dashboard/category')} className="ml-2">
            Hủy
          </Button>
        </Form.Item>
      </Form>

      {/* Modal chọn icon */}
      <Modal
        title="Chọn Icon"
        visible={isModalVisible}
        onOk={() => handleOk(form.getFieldValue('icon') || '')}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]}>
          {iconOptions.map((option) => (
            <Col span={6} key={option.value}>
              <div
                style={{
                  cursor: 'pointer',
                  padding: '8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  background: form.getFieldValue('icon') === option.value ? '#e6f7ff' : 'transparent',
                }}
                onClick={() => {
                  form.setFieldsValue({ icon: option.value });
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e6f7ff')}
                onMouseLeave={(e) => {
                  if (form.getFieldValue('icon') !== option.value) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {option.label}
                <p style={{ margin: 0, fontSize: '12px' }}>{option.value}</p>
              </div>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" onClick={() => handleOk(form.getFieldValue('icon') || '')} className="ml-2">
            Xác nhận
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryAdd;