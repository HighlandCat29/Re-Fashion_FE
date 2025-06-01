import {
  HiBars3,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import { useState, useEffect, useRef } from "react";
import RefashionIcon from "../assets/Refashion_icon.png";
import { logout } from "../api/Logout";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
    setShowProfileDropdown(false); // close dropdown on route change
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileDropdown(false);
    logout(navigate);
  };

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-white to-gray-50 shadow-md flex justify-between items-center py-3 px-6 text-black mx-auto max-w-screen-2xl transition-all duration-300">
        {/* Menu Icon */}
        <button
          aria-label="Toggle Sidebar"
          className="text-2xl hover:text-sky-500 transition-colors duration-200 max-sm:text-xl"
          onClick={() => setIsSidebarOpen(true)}
        >
          <HiBars3 />
        </button>

        {/* Logo and Branding */}
        <Link
          to="/"
          className="flex items-center gap-3 text-5xl font-light tracking-wide max-sm:text-3xl max-[400px]:text-2xl"
          aria-label="Refashion Home"
        >
          <img
            src={RefashionIcon}
            alt="Refashion Logo"
            className="w-24 h-24 object-contain max-sm:w-14 max-sm:h-14 transition-transform duration-200 hover:scale-105"
          />
          <div className="flex flex-col items-start">
            <div className="flex">
              <span className="text-sky-500 font-bold">Re</span>
              <span className="text-orange-400 font-bold">fa</span>
              <span className="text-lime-400 font-bold">shion</span>
            </div>
            <p className="text-sm font-medium text-amber-900 max-sm:text-xs pl-1">
              From student for student
            </p>
          </div>
        </Link>

        {/* Navigation Icons */}
        <nav className="flex gap-6 items-center max-sm:gap-3 relative">
          <Link to="/search" className="group relative" aria-label="Search">
            <HiOutlineMagnifyingGlass className="text-3xl max-sm:text-2xl hover:text-sky-500 transition-colors duration-200" />
            <span className="absolute hidden group-hover:block text-xs bg-gray-800 text-white rounded px-2 py-1 -bottom-8 left-1/2 transform -translate-x-1/2">
              Search
            </span>
          </Link>

          <Link to="/cart" className="group relative" aria-label="Cart">
            <HiOutlineShoppingBag className="text-3xl max-sm:text-2xl hover:text-sky-500 transition-colors duration-200" />
            <span className="absolute hidden group-hover:block text-xs bg-gray-800 text-white rounded px-2 py-1 -bottom-8 left-1/2 transform -translate-x-1/2">
              Cart
            </span>
          </Link>
          {/* User Icon with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="group relative"
              aria-label="User Menu"
              onClick={() => setShowProfileDropdown((prev) => !prev)}
            >
              <HiOutlineUser className="text-3xl max-sm:text-2xl hover:text-sky-500 transition-colors duration-200" />
              <span className="absolute hidden group-hover:block text-xs bg-gray-800 text-white rounded px-2 py-1 -bottom-8 left-1/2 transform -translate-x-1/2">
                {isLoggedIn ? "User Profile" : "Login"}
              </span>
            </button>

            {/* Dropdown */}
            {isLoggedIn && showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-md z-50">
                <Link
                  to="/user-profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="block px-4 py-2 hover:bg-sky-50 text-sm text-gray-800"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                >
                  Logout
                </button>
              </div>
            )}

            {/* If not logged in, redirect to login */}
            {!isLoggedIn && (
              <Link
                to="/login"
                className="absolute inset-0"
                aria-label="Login"
              />
            )}
          </div>
        </nav>
      </header>

      <SidebarMenu
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </>
  );
};

export default Header;
