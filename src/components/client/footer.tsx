import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGooglePlay, FaApple, FaPaperPlane } from 'react-icons/fa';

const ClientFooter = () => {
  return (
    <footer className="bg-black text-white">
      {/* Main Footer Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 lg:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Logo and Subscribe */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">EXCLUSIVE</h2>
            <h3 className="text-xl font-semibold">Subscribe</h3>
            <p className="text-sm">Get 10% off your first order</p>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border border-white text-white px-4 py-2 rounded-md outline-none focus:border-gray-300 transition-all duration-200 w-full pr-12"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200">
                <FaPaperPlane className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Column 2: Support */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>111 Bijoy sarani, Dhaka, DH 1515, Bangladesh</li>
              <li>
                <a href="mailto:exclusive@gmail.com" className="hover:text-gray-300 transition-colors duration-200">
                  exclusive@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+88015888889999" className="hover:text-gray-300 transition-colors duration-200">
                  +88015-88888-9999
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Account */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Account</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                  My Account
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                  Login / Register
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                  Cart
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                  Wishlist
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                  Shop
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Link */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Quick Link</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                  Terms Of Use
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Download App */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Download App</h3>
            <p className="text-sm">Save $3 with App New User Only</p>
            <div className="flex space-x-1">
              <div className=" bg-white rounded-md">
                <img
                  src="./src/assets/qrcode_187593644_7eaf5a1b1f6c06cd3ad76486c1354213.png"
                  alt="QR Code"
                  className="w-50 h-50 rounded-md"
                />
              </div>
              <div className="space-y-3">
                <a href="#" className="flex items-center space-x-2 bg-black border border-white text-white px-3 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 w-36">
                  <FaGooglePlay className="w-6 h-6" />
                  <span className="text-xs">Google Play</span>
                </a>
                <a href="#" className="flex items-center space-x-2 bg-black border border-white text-white px-3 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 w-36">
                  <FaApple className="w-6 h-6" />
                  <span className="text-xs">App Store</span>
                </a>
              </div>
            </div>
            {/* Social Media Icons (Moved Here) */}
            <div className="flex space-x-6 pt-4">
              <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                <FaFacebookF className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                <FaTwitter className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                <FaLinkedinIn className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Copyright */}
      <div className="border-t border-gray-700 py-6 text-center text-sm">
        <p>© Copyright Rimel 2022. All right reserved</p>
      </div>
    </footer>
  );
};

export default ClientFooter;