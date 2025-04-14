"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Form, Input, Button, message, Select, Switch, InputNumber, Space, Tooltip } from "antd"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import type { Product, Category } from "../../../interface/product"
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"

const ProductAdd: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState<Category[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  // Danh sách 20 màu cố định
  const colorOptions = [
    { label: "Đen", value: "black" },
    { label: "Trắng", value: "white" },
    { label: "Xanh dương", value: "blue" },
    { label: "Xanh lá", value: "green" },
    { label: "Đỏ", value: "red" },
    { label: "Vàng", value: "yellow" },
    { label: "Xám", value: "gray" },
    { label: "Hồng", value: "pink" },
    { label: "Tím", value: "purple" },
    { label: "Cam", value: "orange" },
    { label: "Nâu", value: "brown" },
    { label: "Be", value: "beige" },
    { label: "Xanh ngọc", value: "turquoise" },
    { label: "Xanh oliu", value: "olive" },
    { label: "Đồng", value: "bronze" },
    { label: "Bạc", value: "silver" },
    { label: "Vàng ánh kim", value: "gold" },
    { label: "Xanh navy", value: "navy" },
    { label: "Hồng phấn", value: "lightpink" },
    { label: "Xám đậm", value: "darkgray" },
  ]

  // Danh sách kích thước cố định
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"]

  // Lấy danh sách danh mục từ API
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:4000/categories")
      setCategories(response.data || [])
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error)
      message.error("Không thể tải danh sách danh mục")
      setCategories([])
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const onFinish = async (values: Product & { additionalImages?: string[] }) => {
    try {
      // Xử lý dữ liệu ảnh
      const mainImage = values.image
      const additionalImages = values.additionalImages || []

      // Tạo mảng images bao gồm ảnh chính và các ảnh phụ
      const allImages = [mainImage, ...additionalImages].filter(Boolean)

      const productData = {
        ...values,
        stockStatus: values.stockStatus ?? true, // Mặc định còn hàng nếu không nhập
        rating: values.rating ?? 0, // Mặc định rating là 0 nếu không nhập
        images: allImages.length > 1 ? allImages : undefined, // Chỉ lưu mảng images nếu có nhiều hơn 1 ảnh
      }

      // Xóa trường additionalImages vì không thuộc model Product
      delete productData.additionalImages

      console.log("Dữ liệu gửi đi:", productData) // Debug
      const response = await axios.post("http://localhost:4000/products", productData)
      console.log("Phản hồi từ API:", response.data) // Debug
      message.success("Thêm sản phẩm thành công")
      navigate("/dashboard/product")
    } catch (error: any) {
      console.error("Lỗi khi thêm sản phẩm:", error.response?.data || error.message)
      message.error("Lỗi khi thêm sản phẩm")
    }
  }

  // Custom validator để so sánh price và oldPrice
  const validatePrice = async (_: any, value: number) => {
    const oldPrice = form.getFieldValue("oldPrice")
    if (value !== undefined && oldPrice !== undefined && value >= oldPrice) {
      return Promise.reject(new Error("Giá sau sale phải nhỏ hơn giá gốc!"))
    }
    return Promise.resolve()
  }

  // Custom validator cho SKU
  const validateSKU = async (_: any, value: string) => {
    if (value && !/^[A-Za-z0-9-]+$/.test(value)) {
      return Promise.reject(new Error("Mã SKU chỉ được chứa chữ cái, số và dấu gạch ngang!"))
    }
    return Promise.resolve()
  }

  // Tùy chỉnh giao diện từng tùy chọn trong Select màu
  const renderColorOption = (option: { label: string; value: string }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span
        style={{
          display: "inline-block",
          width: "20px",
          height: "20px",
          backgroundColor: option.value,
          marginRight: "8px",
          border: option.value === "white" ? "1px solid #ccc" : "none", // Viền cho màu trắng
        }}
      />
      <span style={{ color: option.value }}>{option.label}</span>
    </div>
  )

  // Xử lý thêm trường ảnh phụ
  const addImageField = () => {
    const additionalImages = form.getFieldValue("additionalImages") || []
    form.setFieldsValue({ additionalImages: [...additionalImages, ""] })
  }

  // Xử lý xóa trường ảnh phụ
  const removeImageField = (index: number) => {
    const additionalImages = form.getFieldValue("additionalImages") || []
    form.setFieldsValue({
      additionalImages: additionalImages.filter((_: any, i: number) => i !== index),
    })
  }

  // Xử lý xem trước ảnh
  const handlePreview = (url: string) => {
    setImagePreview(url)
    setPreviewVisible(true)
  }

  // Đóng xem trước ảnh
  const handleClosePreview = () => {
    setPreviewVisible(false)
  }

  return (
    <div className="p-6 bg-white h-screen overflow-auto">
      <h2 className="text-2xl font-bold mb-4">Thêm sản phẩm</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ additionalImages: [] }}>
        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[
            { required: true, message: "Tên sản phẩm không được để trống" },
            { max: 100, message: "Tên sản phẩm không được dài quá 100 ký tự" },
            { whitespace: true, message: "Tên sản phẩm không được chỉ chứa khoảng trắng" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}>
          <Select placeholder="Chọn danh mục">
            {categories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name="quantity"
          rules={[
            { required: true, message: "Đánh giá không được để trống" },
            { type: "number", min: 0, message: "Số lượng phải lớn hơn 0" },
          ]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Giá gốc (VND)"
          name="oldPrice"
          rules={[
            { required: true, message: "Giá gốc không được để trống" },
            { type: "number", min: 0, message: "Giá gốc phải lớn hơn hoặc bằng 0" },
            { type: "number", max: 1000000000, message: "Giá gốc không được vượt quá 1 tỷ" },
          ]}
        >
          <InputNumber min={0} max={1000000000} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Giá sau sale (VND)"
          name="price"
          rules={[
            { required: true, message: "Giá sau sale không được để trống" },
            { type: "number", min: 0, message: "Giá sau sale phải lớn hơn hoặc bằng 0" },
            { type: "number", max: 1000000000, message: "Giá sau sale không được vượt quá 1 tỷ" },
            { validator: validatePrice },
          ]}
        >
          <InputNumber min={0} max={1000000000} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Màu sắc" name="color" rules={[{ required: true, message: "Vui lòng chọn màu sắc" }]}>
          <Select
            placeholder="Chọn màu sắc"
            optionLabelProp="label" // Hiển thị label trong ô chọn sau khi chọn
            dropdownRender={(menu) => <div>{menu}</div>} // Tùy chỉnh dropdown nếu cần
          >
            {colorOptions.map((color) => (
              <Select.Option key={color.value} value={color.value} label={color.label}>
                {renderColorOption(color)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Các màu có sẵn"
          name="availableColors"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất một màu có sẵn" }]}
        >
          <Select mode="multiple" placeholder="Chọn các màu có sẵn" optionLabelProp="label" style={{ width: "100%" }}>
            {colorOptions.map((color) => (
              <Select.Option key={color.value} value={color.value} label={color.label}>
                {renderColorOption(color)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Các kích thước có sẵn"
          name="availableSizes"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất một kích thước có sẵn" }]}
        >
          <Select mode="multiple" placeholder="Chọn các kích thước có sẵn" style={{ width: "100%" }}>
            {sizeOptions.map((size) => (
              <Select.Option key={size} value={size}>
                {size}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tình trạng còn hàng"
          name="stockStatus"
          valuePropName="checked"
          initialValue={true}
          rules={[{ required: true, message: "Vui lòng chọn tình trạng còn hàng" }]}
        >
          <Switch checkedChildren="Còn hàng" unCheckedChildren="Hết hàng" />
        </Form.Item>

        <Form.Item
          label="Đánh giá (0-5)"
          name="rating"
          rules={[
            { required: true, message: "Đánh giá không được để trống" },
            { type: "number", min: 0, max: 5, message: "Đánh giá phải từ 0 đến 5" },
          ]}
        >
          <InputNumber min={0} max={5} step={0.1} style={{ width: "100%" }} />
        </Form.Item>

        {/* Hình ảnh chính */}
        <Form.Item
          label="Hình ảnh chính (URL)"
          name="image"
          rules={[
            { required: true, message: "Hình ảnh chính không được để trống" },
            { type: "url", message: "Vui lòng nhập URL hợp lệ" },
            { max: 500, message: "URL không được dài quá 500 ký tự" },
          ]}
        >
          <Input
            placeholder="Nhập URL hình ảnh chính"
            addonAfter={
              <Tooltip title="Xem trước">
                <EyeOutlined
                  onClick={() => {
                    const url = form.getFieldValue("image")
                    if (url) handlePreview(url)
                  }}
                />
              </Tooltip>
            }
          />
        </Form.Item>

        {/* Hình ảnh phụ (thumbnails) */}
        <Form.List name="additionalImages">
          {(fields, { add, remove }) => (
            <>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Hình ảnh phụ (Thumbnails)</label>
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Thêm ảnh
                </Button>
              </div>
              {fields.map(({ key, name, ...restField }) => (
                <Form.Item
                  key={key}
                  {...restField}
                  name={[name]}
                  rules={[
                    { type: "url", message: "Vui lòng nhập URL hợp lệ" },
                    { max: 500, message: "URL không được dài quá 500 ký tự" },
                  ]}
                >
                  <Input
                    placeholder="Nhập URL hình ảnh phụ"
                    addonAfter={
                      <Space>
                        <Tooltip title="Xem trước">
                          <EyeOutlined
                            onClick={() => {
                              const url = form.getFieldValue(["additionalImages", name])
                              if (url) handlePreview(url)
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <DeleteOutlined onClick={() => remove(name)} />
                        </Tooltip>
                      </Space>
                    }
                  />
                </Form.Item>
              ))}
            </>
          )}
        </Form.List>

        <Form.Item
          label="Mã SKU"
          name="sku"
          rules={[
            { required: true, message: "Mã SKU không được để trống" },
            { min: 3, message: "Mã SKU phải có ít nhất 3 ký tự" },
            { max: 20, message: "Mã SKU không được dài quá 20 ký tự" },
            { whitespace: true, message: "Mã SKU không được chỉ chứa khoảng trắng" },
            { validator: validateSKU },
          ]}
        >
          <Input placeholder="Ví dụ: SP001" />
        </Form.Item>

        <Form.Item
          label="Thương hiệu"
          name="brand"
          rules={[
            { required: true, message: "Thương hiệu không được để trống" },
            { max: 50, message: "Thương hiệu không được dài quá 50 ký tự" },
            { whitespace: true, message: "Thương hiệu không được chỉ chứa khoảng trắng" },
          ]}
        >
          <Input placeholder="Ví dụ: Apple, Samsung, v.v." />
        </Form.Item>

        <Form.Item
          label="Trọng lượng (gram)"
          name="weight"
          rules={[
            { required: true, message: "Trọng lượng không được để trống" },
            { type: "number", min: 0, message: "Trọng lượng phải lớn hơn hoặc bằng 0" },
            { type: "number", max: 1000000, message: "Trọng lượng không được vượt quá 1 tấn" },
          ]}
        >
          <InputNumber min={0} max={1000000} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: true, message: "Mô tả không được để trống" },
            { max: 1000, message: "Mô tả không được dài quá 1000 ký tự" },
            { whitespace: true, message: "Mô tả không được chỉ chứa khoảng trắng" },
          ]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm
          </Button>
          <Button onClick={() => navigate("/dashboard/product")} className="ml-2">
            Hủy
          </Button>
        </Form.Item>
      </Form>

      {/* Modal xem trước ảnh */}
      {previewVisible && imagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={handleClosePreview}
        >
          <div className="max-w-3xl max-h-[80vh] overflow-auto bg-white p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full max-h-[70vh] object-contain"
            />
            <div className="text-center mt-4">
              <Button onClick={handleClosePreview}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductAdd

