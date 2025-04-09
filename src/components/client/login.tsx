import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-4xl w-full flex flex-col lg:flex-row items-center bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left: Image Section */}
        <div className="lg:w-1/2 w-full h-64 lg:h-auto bg-blue-100 flex items-center justify-center">
          <img
            src="./src/assets/Side Image Login.png"
            alt="Smartphone and Shopping Cart"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right: Login Form Section */}
        <div className="lg:w-1/2 w-full p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Log in to Exclusive</h2>
          <p className="text-gray-600 mb-8">Enter your details below</p>

          <form className="space-y-6">
            {/* Email or Phone Number Input */}
            <div>
              <input
                type="text"
                placeholder="Email or Phone Number"
                className="w-full p-3 border-b border-gray-300 focus:border-gray-500 outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border-b border-gray-300 focus:border-gray-500 outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Log In Button and Forget Password Link */}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-red-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-600 transition-colors duration-200"
              >
                Log In
              </button>
              <a
                href="#"
                className="text-red-500 hover:underline"
              >
                Forget Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;