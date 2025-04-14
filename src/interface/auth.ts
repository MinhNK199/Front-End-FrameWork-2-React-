// Interface cho dữ liệu đăng nhập
export interface LoginFormData {
  email: string
  password: string
}

// Interface cho dữ liệu đăng ký
export interface RegisterFormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

// Interface cho người dùng đã đăng nhập
export interface IAuthUser {
  id: number
  name: string
  email: string
  role: string
}

// Interface cho dữ liệu người dùng đầy đủ từ API
export interface IUserData {
  id: number
  name: string
  email: string
  password: string
  role: "admin" | "customer"
  phone: string | null
  address: string | null
  avatar: string | null
  createdAt: string
  updatedAt: string
}

// Interface cho response khi đăng nhập/đăng ký
export interface AuthResponse {
  success: boolean
  message: string
  user?: IAuthUser
}
