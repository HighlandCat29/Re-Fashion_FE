import { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { logout } from "../api/Logout/index";
import { isAuthenticated } from "../utils/auth";
import { toast } from "react-hot-toast";

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
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/user-profile", label: "User Profile" },
    { to: "/cart", label: "Cart" },
    { to: "/wishlist", label: "Wishlist" },

    ...(loginStatus
      ? [{ to: null, label: "Logout", action: handleLogoutClick }]
      : [{ to: "/login", label: "Login" }]),
  ];

  return (
    <>
      {(isSidebarOpen || isAnimating) && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div
            className={`fixed top-0 left-0 w-72 max-sm:w-64 z-50 h-full bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
            <nav className="flex flex-col items-center gap-2 mt-8 px-4">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="w-full border-y border-amber-200 py-2 transition hover:bg-sky-50"
                >
                  {item.action ? (
                    <button
                      onClick={item.action}
                      className="w-full text-center text-gray-700 font-medium hover:text-sky-500"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      to={item.to!}
                      onClick={(e) => handleNavigation(e, item.to!)}
                      className="block w-full text-center text-gray-700 font-medium hover:text-sky-500"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default SidebarMenu;
