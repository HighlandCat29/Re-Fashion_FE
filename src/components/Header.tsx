// src/components/Header.tsx

import {
  HiBars3,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
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
import NoticePopup from "./Notice";
import { getUserNotices, markNoticeAsRead, Notice } from "../api/Notice";
import { TERipple } from 'tw-elements-react';




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
  const [showNoticePopup, setShowNoticePopup] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const noticeRef = useRef<HTMLDivElement>(null);

  // Search input for header
  const [searchInput, setSearchInput] = useState("");

  const cartItemCount = productsInCart.length;

  useEffect(() => {
    const updateWishlistCount = async () => {
      if (user?.id) {
        try {
          const response = await getUserWishlists(user.id);
          if (response?.result) {
            setWishlistCount(response.result.length);
          }
        } catch {
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(localWishlist.length);
      }
    };
    updateWishlistCount();
  }, [user?.id, localWishlist]);

  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (user?.id) {
        getUserWishlists(user.id)
          .then((response) => {
            if (response?.result) {
              setWishlistCount(response.result.length);
            }
          })
          .catch(() => setWishlistCount(0));
      } else {
        setWishlistCount(localWishlist.length);
      }
    };
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [user?.id, localWishlist]);

  useEffect(() => {
    if (showNoticePopup && user?.id) {
      setLoadingNotices(true);
      getUserNotices(user.id)
        .then((data) => {
          setNotices(data || []);
          setUnreadCount((data || []).filter((n) => !n.read).length);
        })
        .finally(() => setLoadingNotices(false));
    }
  }, [showNoticePopup, user?.id]);

  useEffect(() => {
    setUnreadCount(notices.filter((n) => !n.read).length);
  }, [notices]);

  useEffect(() => {
    if (!showNoticePopup) return;
    const handleClick = (e: MouseEvent) => {
      if (noticeRef.current && !noticeRef.current.contains(e.target as Node)) {
        setShowNoticePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNoticePopup]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
    setShowProfileDropdown(false);
    if (!user) {
      setWishlistCount(0);
    }
  }, [location]);

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
          if (new Date().getTime() >= tokenExpiration) {
            setWishlistCount(0);
            localStorage.removeItem("user");
            setIsLoggedIn(false);
            toast.error("Your session has expired. Please login again.");
            navigate("/login");
          }
        }
      } catch {
        setWishlistCount(0);
      }
    };
    const intervalId = setInterval(checkTokenExpiration, 60000);
    checkTokenExpiration();
    return () => clearInterval(intervalId);
  }, [navigate]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
      !["/login", "/register", "/search", "/shop", "/news"].includes(path)
    ) {
      e.preventDefault();
      navigate("/login");
      toast.error("Please login to access this feature");
    }
  };

  const handleNoticeIconClick = () => {
    setShowNoticePopup((prev) => !prev);
  };

  const handleMarkAsRead = async (noticeId: string) => {
    const notice = notices.find((n) => n.id === noticeId);
    if (notice && !notice.read) {
      const success = await markNoticeAsRead(noticeId);
      if (success) {
        setNotices((prev) =>
          prev.map((n) => (n.id === noticeId ? { ...n, read: true } : n))
        );
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(`/shop?search=${encodeURIComponent(searchInput)}`);
    }
  };

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ease-in-out ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-lg" : "bg-transparent"
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="relative flex h-24 items-center">

            {/* Left: Sidebar + Logo */}
            <div className="flex items-center gap-4">
              <button
                aria-label="Toggle Sidebar"
                className="text-3xl text-gray-800 hover:text-sky-500"
                onClick={() => setIsSidebarOpen(true)}
              >
                <HiBars3 />
              </button>
              <Link
                to="/"
                onClick={handleLogoClick}
                className="flex items-center gap-2 group transform transition-transform max-[416px]:scale-[0.8]"
                aria-label="Refashion Home"
              >
                <img
                  src={RefashionIcon}
                  alt="Refashion Logo"
                  className="h-14 w-14 object-contain group-hover:scale-110 transition-transform duration-200"
                />

                <div className="flex flex-col items-start leading-tight">
                  <div className="flex -space-x-0">
                    <span className="text-sky-500 font-bold text-4xl">Re</span>
                    <span className="text-orange-400 font-bold text-4xl">fa</span>
                    <span className="text-lime-400 font-bold text-4xl">shion</span>
                  </div>
                  <p className="text-sm font-medium text-amber-900 -mt-1">
                    From student for student
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: Search */}
            <div className="hidden xl:flex flex-1 justify-center mt-3">
              <div className="relative mb-4 flex w-full max-w-4xl flex-wrap items-stretch">
                <input
                  type="search"
                  className="
        relative m-0 -mr-0.5 block w-[1px] min-w-0 flex-auto 
        rounded-l border border-neutral-300 bg-white 
        px-3 h-[42px]
        text-base font-normal leading-[1.6] 
        text-neutral-700 outline-none transition duration-200 
        ease-in-out focus:z-[3] focus:border-sky-400 
        focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(56,189,248)]
      "
                  placeholder="Search"
                  aria-label="Search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <TERipple>
                  <button
                    className="
          relative z-[2] rounded-r bg-orange-500 px-5 
          h-[42px]
          text-white text-xl hover:bg-orange-600 transition-colors duration-200 
          flex items-center justify-center
        "
                    type="button"
                    onClick={() => navigate(`/shop?search=${encodeURIComponent(searchInput)}`)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                      />
                    </svg>
                  </button>
                </TERipple>
              </div>
            </div>




            {/* Right: Icons */}
            <div className="flex items-center gap-6 invisible xl:visible">

              <Link to="/wishlist" className="group relative" onClick={(e) => handleNavigation(e, "/wishlist")}>
                <HiOutlineHeart className={`text-3xl ${location.pathname === "/wishlist" ? "text-red-500 animate-pulse" : "text-gray-800 hover:text-sky-500"}`} />
                {wishlistCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistCount}</span>}
              </Link>
              <Link to="/cart" className="group relative" onClick={(e) => handleNavigation(e, "/cart")}>
                <HiOutlineShoppingBag className={`text-3xl ${location.pathname === "/cart" ? "text-purple-500 animate-bounce" : "text-gray-800 hover:text-sky-500"}`} />
                {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartItemCount}</span>}
              </Link>
              <Link to="/messages" className="group relative" onClick={(e) => handleNavigation(e, "/messages")}>
                <HiOutlineChatBubbleLeftRight className={`text-3xl ${location.pathname === "/messages" ? "text-sky-500 animate-pulse" : "text-gray-800 hover:text-sky-500"}`} />
              </Link>
              <div className="relative" ref={noticeRef}>
                <button className="group relative" onClick={handleNoticeIconClick}>
                  <HiOutlineBell className="text-3xl text-gray-800 hover:text-blue-500" />
                  {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>}
                </button>
                {showNoticePopup && <NoticePopup notices={notices} loading={loadingNotices} onMarkAsRead={handleMarkAsRead} onClose={() => setShowNoticePopup(false)} />}
              </div>
              <div className="relative" ref={dropdownRef}>
                {isLoggedIn ? (
                  <button className="group relative" onClick={() => setShowProfileDropdown((prev) => !prev)}>
                    <HiOutlineUser className="text-3xl text-gray-800 hover:text-sky-500" />
                  </button>
                ) : (
                  <Link to="/login" className="group relative"><HiOutlineUser className="text-3xl text-gray-800 hover:text-sky-500" /></Link>
                )}
                {isLoggedIn && showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white border border-gray-200 shadow-lg z-50">
                    <Link to="/user-profile" onClick={() => setShowProfileDropdown(false)} className="block px-4 py-2 text-sm text-gray-800 hover:bg-sky-50">My Profile</Link>
                    <Link to="/manage-selling-buying" onClick={() => setShowProfileDropdown(false)} className="block px-4 py-2 text-sm text-green-700 hover:bg-green-50">Manage Selling/Buying Product</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      <SidebarMenu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
    </>
  );
};

export default Header;
