import React, { useState } from "react";
import { UserCircle, LogOut } from "lucide-react";
import { logout } from "../../api/Logout/index";
import { useNavigate } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string>("Dashboard");

  const handleLogout = async () => {
    await logout(navigate);
  };

  const handleNavClick = (label: string, path?: string) => {
    setActiveItem(label);
    if (path) navigate(path);
  };

  const navItems = [
    { label: "Dashboard", path: "/admin" },
    { label: "Users", path: "/admin/users" },
    { label: "Products", path: "/admin/products" },
    { label: "Categories", path: "/admin/categories" },
    { label: "Reports" },
    { label: "Settings" },
  ];

  return (
    <aside className="w-60 bg-white p-6 border-r hidden md:flex flex-col justify-between h-screen">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <UserCircle size={32} />
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-2 text-gray-700">
          {navItems.map((item) => (
            <span
              key={item.label}
              onClick={() => handleNavClick(item.label, item.path)}
              className={`px-2 py-1 rounded cursor-pointer transition ${
                activeItem === item.label
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.label}
            </span>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 flex items-center gap-2 text-red-600 hover:text-red-800 transition px-2 py-1 rounded hover:bg-red-50"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
