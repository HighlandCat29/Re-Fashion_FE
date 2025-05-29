import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiXMark } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { setLoginStatus } from "../features/auth/authSlice";
import { store } from "../store";

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

  const logout = () => {
    toast.success("Logged out successfully", { duration: 2000 });
    localStorage.removeItem("user");
    store.dispatch(setLoginStatus(false));
    setIsSidebarOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    if (isSidebarOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  return (
    <>
      {(isSidebarOpen || isAnimating) && (
        <>
          {/* Backdrop Overlay */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <div
            className={`fixed top-0 left-0 w-72 max-sm:w-64 z-50 h-full bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                aria-label="Close Sidebar"
                className="text-3xl text-gray-600 hover:text-sky-500 transition-colors duration-200"
                onClick={() => setIsSidebarOpen(false)}
              >
                <HiXMark />
              </button>
            </div>

            {/* Logo */}
            <div className="flex justify-center mt-2">
              <Link
                to="/"
                className="text-4xl font-light tracking-wide max-sm:text-3xl max-[400px]:text-2xl"
                aria-label="Refashion Home"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-sky-500 font-bold">Re</span>
                <span className="text-orange-400 font-bold">fa</span>
                <span className="text-lime-400 font-bold">shion</span>
              </Link>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col items-center gap-2 mt-8 px-4">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/search", label: "Search" },
                { to: "/user-profile", label: "User Profile" },
                ...(loginStatus
                  ? [{ to: null, label: "Logout", action: logout }]
                  : [
                      { to: "/login", label: "Sign in" },
                      { to: "/register", label: "Sign up" },
                    ]),
                { to: "/cart", label: "Cart" },
                { to: "/wishlist", label: "Wishlist" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="w-full border-y border-amber-200 py-2 transition-colors duration-200 hover:bg-sky-50"
                >
                  {item.action ? (
                    <button
                      onClick={item.action}
                      className="w-full text-center text-gray-700 font-medium hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                      aria-label={item.label}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      to={item.to!}
                      className="block w-full text-center text-gray-700 font-medium hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                      onClick={() => setIsSidebarOpen(false)}
                      aria-label={item.label}
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
