import { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { logout } from "../api/Logout/index";
import { isAuthenticated } from "../utils/auth";
import { toast } from "react-hot-toast";
import {
  Home,
  ShoppingBag,
  UserCircle,
  ShoppingCart,
  Heart,
  LogOut,
  LogIn,
} from "lucide-react";

const SidebarMenu = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (prev: boolean) => void;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { loginStatus } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  console.log("Current loginStatus:", loginStatus); // Debug log

  useEffect(() => {
    if (isSidebarOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  const handleLogoutClick = () => {
    setIsSidebarOpen(false);
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
      setIsSidebarOpen(false);
      navigate("/login");
      toast.error("Please login to access this feature");
    }
  };

  const menuItems = [
    { to: "/", label: "Home", icon: <Home size={24} className="mr-3" /> },
    {
      to: "/shop",
      label: "Shop",
      icon: <ShoppingBag size={24} className="mr-3" />,
    },
    {
      to: "/user-profile",
      label: "User Profile",
      icon: <UserCircle size={24} className="mr-3" />,
    },
    {
      to: "/cart",
      label: "Cart",
      icon: <ShoppingCart size={24} className="mr-3" />,
    },
    {
      to: "/wishlist",
      label: "Wishlist",
      icon: <Heart size={24} className="mr-3" />,
    },
    ...(!loginStatus
      ? [
          {
            to: "/login",
            label: "Login",
            icon: <LogIn size={24} className="mr-3" />,
          },
        ]
      : []),
  ];

  return (
    <>
      {(isSidebarOpen || isAnimating) && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div
            className={`fixed top-0 left-0 w-72 max-sm:w-64 z-50 h-full bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                className="text-3xl text-gray-600 hover:text-sky-500 transition"
                onClick={() => setIsSidebarOpen(false)}
              >
                <HiXMark />
              </button>
            </div>

            {/* Logo */}
            <div className="flex justify-center mt-2">
              <Link
                to="/"
                className="text-4xl font-light tracking-wide"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-sky-500 font-bold">Re</span>
                <span className="text-orange-400 font-bold">fa</span>
                <span className="text-lime-400 font-bold">shion</span>
              </Link>
            </div>

            {/* Menu */}
            <nav className="flex flex-col gap-1 mt-8 px-4 flex-1">
              {menuItems.map((item, index) => (
                <div key={index} className="w-full">
                  <Link
                    to={item.to!}
                    onClick={(e) => handleNavigation(e, item.to!)}
                    className="w-full flex items-center px-3 py-3 rounded transition font-semibold text-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>
            {/* Logout button at the bottom */}
            {loginStatus && (
              <div className="absolute bottom-0 left-0 w-full px-4 pb-6">
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center px-3 py-3 rounded transition font-semibold text-lg text-red-600 hover:bg-red-50 hover:text-red-800"
                >
                  <LogOut size={24} className="mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default SidebarMenu;
