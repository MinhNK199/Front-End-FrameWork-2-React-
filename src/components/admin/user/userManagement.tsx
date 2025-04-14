"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm } from "antd"
import { EditOutlined, DeleteOutlined, UserAddOutlined, SearchOutlined, EyeFilled } from "@ant-design/icons"
import axios from "axios"
import type { ColumnsType } from "antd/es/table"
import { useNavigate } from "react-router-dom"

interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: "admin" | "customer"
  createdAt: string
  updatedAt: string
  address: string | null
  avatar: string | null
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState("")
  const navigate = useNavigate()
  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get("http://localhost:4000/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      message.error("Không thể tải danh sách người dùng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle add/edit user
  const showModal = (user?: User) => {
    setEditingUser(user || null)
    form.resetFields()
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        address: user.address || "",
      })
    }
    setModalVisible(true)
  }

  const handleCancel = () => {
    setModalVisible(false)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingUser) {
        // Update user
        await axios.patch(`http://localhost:4000/users/${editingUser.id}`, {
          ...values,
          updatedAt: new Date().toISOString(),
        })
        message.success("Cập nhật người dùng thành công")
      } else {
        // Add new user
        const newUser = {
          ...values,
          password: "123456", // Default password
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: null,
        }
        await axios.post("http://localhost:4000/users", newUser)
        message.success("Thêm người dùng thành công")
      }

      setModalVisible(false)
      fetchUsers()
    } catch (error) {
      console.error("Error saving user:", error)
      message.error("Có lỗi xảy ra khi lưu thông tin người dùng")
    }
  }

  // // Handle delete user
  // const handleDelete = async (id: number) => {
  //   try {
  //     await axios.delete(`http://localhost:4000/users/${id}`)
  //     message.success("Xóa người dùng thành công")
  //     fetchUsers()
  //   } catch (error) {
  //     console.error("Error deleting user:", error)
  //     message.error("Có lỗi xảy ra khi xóa người dùng")
  //   }
  // }

  // Filter users based on search text
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.phone && user.phone.includes(searchText)),
  )

  // Table columns
  // Trong UserManagement.tsx
  const columns: ColumnsType<User> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <div
            className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: stringToColor(record.name) }}
          >
            {record.name.charAt(0).toUpperCase()}
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${role === "admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
        >
          {role === "admin" ? "Quản trị viên" : "Khách hàng"}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)} className="bg-blue-500">
            Sửa
          </Button>
          <Button type="default" icon={<EyeFilled />} onClick={() => navigate(`/dashboard/user/${record.id}`)}>
            Xem
          </Button>
        </Space>
      ),
    },
  ]
  // Generate color from string
  const stringToColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    let color = "#"
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      color += ("00" + value.toString(16)).substr(-2)
    }
    return color
  }

  return (
    <div className="p-6 bg-white h-screen overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => showModal()} className="bg-green-500">
          Thêm người dùng
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Tìm kiếm theo tên, email hoặc số điện thoại"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full md:w-1/3"
        />
      </div>

      {/* Users Table */}
      <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? "Sửa thông tin người dùng" : "Thêm người dùng mới"}
        open={modalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingUser ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập email" disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
            <Select placeholder="Chọn vai trò">
              <Select.Option value="admin">Quản trị viên</Select.Option>
              <Select.Option value="customer">Khách hàng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea placeholder="Nhập địa chỉ" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
