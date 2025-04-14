"use client"

import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Descriptions, Avatar, Button, Spin, message } from "antd"
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons"
import axios from "axios"

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

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user data
  const fetchUser = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`http://localhost:4000/users/${id}`)
      setUser(response.data)
    } catch (error) {
      console.error("Error fetching user:", error)
      message.error("Không thể tải thông tin người dùng")
      navigate("/dashboard/user")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [id])

  // Generate color for avatar
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

  // Get initial for avatar
  const getInitial = (name: string) => name.charAt(0).toUpperCase()

  if (loading) {
    return (
      <div className="p-6 bg-white h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 bg-white h-screen">
        <p className="text-red-500">Không tìm thấy người dùng</p>
        <Button type="primary" onClick={() => navigate("/dashboard/user")} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white h-screen overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Thông tin chi tiết người dùng</h2>
        <div>
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard/user")}
            className="mr-2"
          >
            Quay lại
          </Button>
          {/* <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/dashboard/user/edit/${user.id}`)}
            className="bg-blue-500"
          >
            Chỉnh sửa
          </Button> */}
        </div>
      </div>

      <Card>
        <div className="flex items-center mb-6">
          {user.avatar ? (
            <Avatar src={user.avatar} size={64} className="mr-4" />
          ) : (
            <Avatar
              size={64}
              style={{ backgroundColor: stringToColor(user.name), fontSize: 24 }}
              className="mr-4"
            >
              {getInitial(user.name)}
            </Avatar>
          )}
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <Descriptions bordered column={1} labelStyle={{ width: 200 }}>
          <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Họ tên">{user.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{user.phone || "Chưa cập nhật"}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <span
              className={`px-2 py-1 rounded-full text-xs ${user.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                }`}
            >
              {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{user.address || "Chưa cập nhật"}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(user.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {new Date(user.updatedAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Avatar">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: 100, height: 100 }} />
            ) : (
              <span>Chưa cập nhật</span>
            )}
          </Descriptions.Item>


        </Descriptions>
      </Card>
    </div>
  )
}

export default UserDetail