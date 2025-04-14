"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Tabs, Form, Input, Button, Upload, message, Avatar, Divider } from "antd"
import { UserOutlined, UploadOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const { TabPane } = Tabs

interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  address: string | null
  avatar: string | null
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    // Kiểm tra đăng nhập
    const userJson = localStorage.getItem("user")
    if (!userJson) {
      message.error("Vui lòng đăng nhập để truy cập trang này")
      navigate("/login")
      return
    }

    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(userJson)
        const response = await axios.get(`http://localhost:4000/users/${userData.id}`)
        setUser(response.data)
        setAvatarUrl(response.data.avatar)

        // Cập nhật form với dữ liệu người dùng
        profileForm.setFieldsValue({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || "",
          address: response.data.address || "",
        })
      } catch (error) {
        console.error("Error fetching user data:", error)
        message.error("Không thể tải thông tin người dùng")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate, profileForm])

  const handleProfileUpdate = async (values: any) => {
    if (!user) return

    try {
      await axios.patch(`http://localhost:4000/users/${user.id}`, {
        ...values,
        updatedAt: new Date().toISOString(),
      })

      message.success("Cập nhật thông tin thành công")

      // Cập nhật thông tin người dùng trong localStorage
      const userJson = localStorage.getItem("user")
      if (userJson) {
        const userData = JSON.parse(userJson)
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...userData,
            name: values.name,
          }),
        )
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      message.error("Có lỗi xảy ra khi cập nhật thông tin")
    }
  }

  const handlePasswordChange = async (values: any) => {
    if (!user) return

    try {
      // Kiểm tra mật khẩu cũ
      const response = await axios.get(`http://localhost:4000/users/${user.id}`)
      if (response.data.password !== values.currentPassword) {
        message.error("Mật khẩu hiện tại không chính xác")
        return
      }

      // Cập nhật mật khẩu mới
      await axios.patch(`http://localhost:4000/users/${user.id}`, {
        password: values.newPassword,
        updatedAt: new Date().toISOString(),
      })

      message.success("Đổi mật khẩu thành công")
      passwordForm.resetFields()
    } catch (error) {
      console.error("Error changing password:", error)
      message.error("Có lỗi xảy ra khi đổi mật khẩu")
    }
  }

  const handleAvatarChange = async (info: any) => {
    if (info.file.status === "done") {
      // Trong thực tế, bạn sẽ upload ảnh lên server và nhận về URL
      // Ở đây chúng ta giả lập bằng cách sử dụng URL từ file
      const imageUrl = URL.createObjectURL(info.file.originFileObj)
      setAvatarUrl(imageUrl)

      if (user) {
        try {
          await axios.patch(`http://localhost:4000/users/${user.id}`, {
            avatar: imageUrl,
            updatedAt: new Date().toISOString(),
          })
          message.success("Cập nhật ảnh đại diện thành công")
        } catch (error) {
          console.error("Error updating avatar:", error)
          message.error("Có lỗi xảy ra khi cập nhật ảnh đại diện")
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tài khoản của tôi</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center">
              <Avatar size={100} src={avatarUrl} icon={<UserOutlined />} className="mb-2" />
              <Upload
                showUploadList={false}
                customRequest={({ onSuccess }: any) => setTimeout(() => onSuccess("ok"), 0)}
                onChange={handleAvatarChange}
              >
                <Button icon={<UploadOutlined />}>Thay đổi ảnh</Button>
              </Upload>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <div className="flex flex-col mt-2 text-gray-600">
                <span className="flex items-center gap-2 mb-1">
                  <MailOutlined /> {user?.email}
                </span>
                <span className="flex items-center gap-2 mb-1">
                  <PhoneOutlined /> {user?.phone || "Chưa cập nhật số điện thoại"}
                </span>
                <span className="flex items-center gap-2">
                  <EnvironmentOutlined /> {user?.address || "Chưa cập nhật địa chỉ"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultActiveKey="1" className="p-6">
          <TabPane tab="Thông tin cá nhân" key="1">
            <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdate} className="max-w-2xl">
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
                <Input placeholder="Nhập email" disabled />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea placeholder="Nhập địa chỉ" rows={3} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="bg-red-500">
                  Cập nhật thông tin
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Đổi mật khẩu" key="2">
            <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange} className="max-w-2xl">
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
              >
                <Input.Password placeholder="Nhập mật khẩu hiện tại" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error("Mật khẩu xác nhận không khớp"))
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu mới" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="bg-red-500">
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Địa chỉ giao hàng" key="3">
            <div className="bg-gray-50 p-6 rounded-md mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Địa chỉ mặc định</h3>
                  <p className="text-gray-600 mt-1">{user?.address || "Chưa cập nhật địa chỉ"}</p>
                </div>
                <Button type="primary" className="bg-red-500">
                  Chỉnh sửa
                </Button>
              </div>
              <Divider className="my-4" />
              <Button type="dashed" block icon={<UploadOutlined />}>
                Thêm địa chỉ mới
              </Button>
            </div>
          </TabPane>

          <TabPane tab="Lịch sử đơn hàng" key="4">
            <div className="text-center py-12 bg-gray-50 rounded-md">
              <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào trong lịch sử mua sắm</p>
              <Button type="primary" className="bg-red-500" onClick={() => navigate("/")}>
                Tiếp tục mua sắm
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}

export default UserProfile
