// Định nghĩa kiểu dữ liệu cho sản phẩm
export interface Product {
  id?: number
  name: string
  categoryId: number
  oldPrice: number
  price: number
  color: string
  quantity: number
  feedback: string
  availableColors?: string[] // Thêm mảng các màu có sẵn
  availableSizes?: string[] // Thêm mảng các kích thước có sẵn
  stockStatus: boolean
  rating: number
  image: string
  images?: string[] // Thêm mảng images để lưu trữ nhiều ảnh
  sku: string
  brand: string
  weight: number
  description: string
  type?: string
  parent?: number
}

// Định nghĩa kiểu dữ liệu cho danh mục
export interface Category {
  id: number
  name: string
  icon: string
  description: string
}

