import React from "react";
import { UserCircle, LogOut } from "lucide-react";
import { logout } from "../../api/Logout/index";
import { useNavigate } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(navigate);
  };

  const goToCategories = () => {
    navigate("/admin/categories");
  };

  return (
    <aside className="w-60 bg-white p-6 border-r hidden md:flex flex-col justify-between h-screen">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <UserCircle size={32} />
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-2 text-gray-700">
          <span className="font-semibold text-blue-600">Dashboard</span>
          <span className="bg-gray-200 px-2 py-1 rounded">Users</span>
          <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
            Products
          </span>
          <span
            onClick={goToCategories}
            className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
          >
            Categories
          </span>
          <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
            Reports
          </span>
          <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
            Settings
          </span>
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
