"use client";

import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook } from "react-icons/fa";
import { RegisterFormData } from "../interface/auth";
import { api } from "../config/axios";


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Họ tên không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Kiểm tra email đã tồn tại
      const checkEmailResponse = await api.get("/users", {
        params: {
          email: formData.email,
        },
      });

      if (checkEmailResponse.data.exists) {
        setErrors({
          email: "Email đã tồn tại trong hệ thống",
        });
        setLoading(false);
        return;
      }

      // Tạo dữ liệu người dùng
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        password: formData.password,
        role: "customer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        address: null,
        avatar: null,
      };

      // Gửi yêu cầu đăng ký
      await api.post("/users", userData);

      alert("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrors({
        email:
          error.response?.data?.message || "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex flex-col lg:flex-row items-center bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="lg:w-1/2 w-full h-64 lg:h-auto bg-blue-100 flex items-center justify-center">
          <img
            src="./src/assets/Side Image Login.png"
            alt="Shopping Illustration"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="lg:w-1/2 w-full p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create an Account</h2>
          <p className="text-gray-600 mb-8">Enter your details below</p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="name"
                placeholder="Họ tên"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 border-b ${errors.name ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 outline-none text-gray-700 placeholder-gray-400`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border-b ${errors.email ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 outline-none text-gray-700 placeholder-gray-400`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Số điện thoại (tùy chọn)"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-3 border-b ${errors.phone ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 outline-none text-gray-700 placeholder-gray-400`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 border-b ${errors.password ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 outline-none text-gray-700 placeholder-gray-400`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-3 border-b ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 outline-none text-gray-700 placeholder-gray-400`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-600 transition-colors duration-200 disabled:bg-red-300"
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc đăng ký với</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
                  Google
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FaFacebook className="h-5 w-5 text-blue-600 mr-2" />
                  Facebook
                </button>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-red-500 hover:underline font-medium">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;