// src/components/Header.tsx

import {
  HiBars3,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SidebarMenu from "./SidebarMenu";
import RefashionIcon from "../assets/Refashion_icon.png";
import { logout } from "../api/Logout";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If we're already on "/", scroll to top
    if (location.pathname === "/") {
      e.preventDefault(); // prevent re‐navigation
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Otherwise, navigate to "/" normally
      navigate("/");
    }
  };
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update login state & close dropdown on route change
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
    setShowProfileDropdown(false);
  }, [location]);

  // Track scroll, toggle background glow
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    setShowProfileDropdown(false);
    logout(navigate);
  };

  // Don’t render header on /admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        className={`
          fixed top-0 inset-x-0 z-50
          transition-colors duration-300 ease-in-out
          ${isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-lg"
            : "bg-transparent"
          }
        `}
      >
        <div className="mx-auto max-w-screen-2xl px-6">
          <div className="relative flex h-24 items-center">
            {/* ───── Sidebar Toggle (Left) ───── */}
            <button
              aria-label="Toggle Sidebar"
              className="
                text-3xl text-gray-800 hover:text-sky-500
                transition-colors duration-200
                mr-8
              "
              onClick={() => setIsSidebarOpen(true)}
            >
              <HiBars3 />
            </button>

            {/* ───── Centered Logo ───── */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link
                to="/"
                onClick={handleLogoClick}
                className="flex items-center gap-2 group"
                aria-label="Refashion Home"
              >
                <img
                  src={RefashionIcon}
                  alt="Refashion Logo"
                  className="h-15 w-15 object-contain transition-transform duration-200 group-hover:scale-110"
                />
                <div className="flex flex-col items-start leading-tight">
                  <div className="flex -space-x-0">
                    <span className="text-sky-500 font-bold text-5xl">
                      Re
                    </span>
                    <span className="text-orange-400 font-bold text-5xl">
                      fa
                    </span>
                    <span className="text-lime-400 font-bold text-5xl">
                      shion
                    </span>
                  </div>
                  <p className="text-sm font-medium text-amber-900 -mt-1">
                    From student for student
                  </p>
                </div>
              </Link>
            </div>

            {/* ───── Right Icons ───── */}
            <div className="ml-auto flex items-center space-x-8">
              {/* Search Icon */}
              <Link to="/search" className="group relative" aria-label="Search">
                <HiOutlineMagnifyingGlass
                  className="
                    text-4xl text-gray-800 hover:text-sky-500
                    transition-colors duration-200
                  "
                />
                <span
                  className="
                    absolute left-1/2 -bottom-8 hidden rounded bg-gray-800 px-2 py-1
                    text-xs text-white group-hover:block
                    -translate-x-1/2
                  "
                >
                  Search
                </span>
              </Link>

              {/* Cart Icon */}
              <Link to="/cart" className="group relative" aria-label="Cart">
                <HiOutlineShoppingBag
                  className="
                    text-3xl text-gray-800 hover:text-sky-500
                    transition-colors duration-200
                  "
                />
                <span
                  className="
                    absolute left-1/2 -bottom-8 hidden rounded bg-gray-800 px-2 py-1
                    text-xs text-white group-hover:block
                    -translate-x-1/2
                  "
                >
                  Cart
                </span>
              </Link>

              {/* User Icon & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="group relative"
                  aria-label="User Menu"
                  onClick={() => setShowProfileDropdown((prev) => !prev)}
                >
                  <HiOutlineUser
                    className="
                      text-3xl text-gray-800 hover:text-sky-500
                      transition-colors duration-200
                    "
                  />
                  <span
                    className="
                      absolute left-1/2 -bottom-8 hidden rounded bg-gray-800 px-2 py-1
                      text-xs text-white group-hover:block
                      -translate-x-1/2
                    "
                  >
                    {isLoggedIn ? "Profile" : "Login"}
                  </span>
                </button>

                {/* Dropdown (logged in) */}
                {isLoggedIn && showProfileDropdown && (
                  <div
                    className="
                      absolute right-0 mt-2 w-48 rounded-md
                      bg-white border border-gray-200 shadow-lg z-50
                    "
                  >
                    <Link
                      to="/user-profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-sky-50"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}

                {/* If not logged in, clicking user → /login */}
                {!isLoggedIn && (
                  <Link
                    to="/login"
                    className="absolute inset-0"
                    aria-label="Login"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SidebarMenu stays here, it will slide over content */}
      <SidebarMenu
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </>
  );
};

export default Header;
