// src/components/Header.tsx

import {
  HiBars3,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SidebarMenu from "./SidebarMenu";
import RefashionIcon from "../assets/Refashion_icon.png";
import { logout } from "../api/Logout";
import { useWishlist } from "./WishlistContext";
import { useAppSelector } from "../hooks";
import { getUserWishlists } from "../api/Whishlists";
import { isAuthenticated } from "../utils/auth";
import { toast } from "react-hot-toast";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { wishlist: localWishlist } = useWishlist();
  const { user } = useAppSelector((state) => state.auth);
  const { productsInCart } = useAppSelector((state) => state.cart);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate total items in cart
  const cartItemCount = productsInCart.length;

  // Update wishlist count when local wishlist changes or user logs in/out
  useEffect(() => {
    const updateWishlistCount = async () => {
      if (user?.id) {
        try {
          const response = await getUserWishlists(user.id);
          if (response?.result) {
            setWishlistCount(response.result.length);
          }
        } catch (error) {
          console.error("Failed to fetch wishlist count:", error);
          // Reset wishlist count if token is expired
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(localWishlist.length);
      }
    };

    updateWishlistCount();
  }, [user?.id, localWishlist]);

  // Listen for custom event when wishlist is updated
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (user?.id) {
        getUserWishlists(user.id)
          .then((response) => {
            if (response?.result) {
              setWishlistCount(response.result.length);
            }
          })
          .catch((error) => {
            console.error("Failed to fetch wishlist count:", error);
            // Reset wishlist count if token is expired
            setWishlistCount(0);
          });
      } else {
        setWishlistCount(localWishlist.length);
      }
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, [user?.id, localWishlist]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update login state & close dropdown on route change
  useEffect(() => {
    const user = localStorage.getItem("user");
    const isUserLoggedIn = !!user;
    setIsLoggedIn(isUserLoggedIn);
    setShowProfileDropdown(false);

    // Reset wishlist count when user logs in/out
    if (!isUserLoggedIn) {
      setWishlistCount(0);
    }
  }, [location]);

  // Add token expiration check
  useEffect(() => {
    const checkTokenExpiration = () => {
      const user = localStorage.getItem("user");
      if (!user) {
        setWishlistCount(0);
        return;
      }

      try {
        const userData = JSON.parse(user);
        if (userData.token) {
          const tokenExpiration = new Date(userData.tokenExpiration).getTime();
          const currentTime = new Date().getTime();

          if (currentTime >= tokenExpiration) {
            // Token expired, reset wishlist count
            setWishlistCount(0);
            localStorage.removeItem("user");
            setIsLoggedIn(false);
            toast.error("Your session has expired. Please login again.");
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Error checking token expiration:", error);
        setWishlistCount(0);
      }
    };

    // Check token expiration every minute
    const intervalId = setInterval(checkTokenExpiration, 60000);
    checkTokenExpiration(); // Initial check

    return () => clearInterval(intervalId);
  }, [navigate]);

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

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (
      !isAuthenticated() &&
      path !== "/login" &&
      path !== "/register" &&
      path !== "/search" &&
      path !== "/shop" &&
      path !== "/news"
    ) {
      e.preventDefault();
      navigate("/login");
      toast.error("Please login to access this feature");
    }
  };

  // Don't render header on /admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        className={`
          fixed top-0 inset-x-0 z-50
          transition-colors duration-300 ease-in-out
          ${
            isScrolled
              ? "bg-white/90 backdrop-blur-md shadow-lg"
              : "bg-transparent"
          }
        `}
      >
        <div className="container mx-auto px-4">
          <div className="relative flex h-24 items-center justify-between">
            {/* ───── Sidebar Toggle (Left) ───── */}
            <button
              aria-label="Toggle Sidebar"
              className="
                text-3xl text-gray-800 hover:text-sky-500
                transition-colors duration-200
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
                    <span className="text-sky-500 font-bold text-5xl">Re</span>
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
            <div className="flex items-center gap-6">
              {/* Search Icon */}
              <Link
                to="/shop"
                className="group relative"
                aria-label="Shop"
                onClick={(e) => handleNavigation(e, "/shop")}
              >
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

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="group relative"
                aria-label="Wishlist"
                onClick={(e) => handleNavigation(e, "/wishlist")}
              >
                <div className="relative">
                  <HiOutlineHeart
                    className={`
                      text-3xl transition-all duration-300
                      ${
                        location.pathname === "/wishlist"
                          ? "text-red-500 animate-pulse"
                          : "text-gray-800 hover:text-sky-500"
                      }
                    `}
                  />
                  {wishlistCount > 0 && (
                    <span
                      className="
                      absolute -top-2 -right-2
                      bg-red-500 text-white text-xs
                      rounded-full w-5 h-5
                      flex items-center justify-center
                    "
                    >
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span
                  className="
                    absolute left-1/2 -bottom-8 hidden rounded bg-gray-800 px-2 py-1
                    text-xs text-white group-hover:block
                    -translate-x-1/2
                  "
                >
                  Wishlist
                </span>
              </Link>

              {/* Cart Icon */}
              <Link
                to="/cart"
                className="group relative"
                aria-label="Cart"
                onClick={(e) => handleNavigation(e, "/cart")}
              >
                <div className="relative">
                  <HiOutlineShoppingBag
                    className={`
                      text-3xl transition-all duration-300
                      ${
                        location.pathname === "/cart"
                          ? "text-purple-500 animate-bounce"
                          : "text-gray-800 hover:text-sky-500"
                      }
                    `}
                  />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
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

              {/* Message Icon */}
              <Link
                to="/messages"
                className="group relative"
                aria-label="Messages"
                onClick={(e) => handleNavigation(e, "/messages")}
              >
                <HiOutlineChatBubbleLeftRight
                  className={`
                    text-3xl transition-all duration-300
                    ${
                      location.pathname === "/messages"
                        ? "text-sky-500 animate-pulse"
                        : "text-gray-800 hover:text-sky-500"
                    }
                  `}
                />
                <span
                  className="
                    absolute left-1/2 -bottom-8 hidden rounded bg-gray-800 px-2 py-1
                    text-xs text-white group-hover:block
                    -translate-x-1/2
                  "
                >
                  Messages
                </span>
              </Link>

              {/* Sell Product Button */}
              <Link
                to="sell-product-list"
                className="hidden lg:block px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-300"
                onClick={(e) => handleNavigation(e, "/sell-product")}
              >
                Sell Product
              </Link>

              {/* User Icon & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                {isLoggedIn ? (
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
                      Profile
                    </span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="group relative"
                    aria-label="Login"
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
                      Login
                    </span>
                  </Link>
                )}

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
