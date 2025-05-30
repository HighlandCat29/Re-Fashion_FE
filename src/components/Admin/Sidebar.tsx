import React from "react";
import { UserCircle } from "lucide-react";

const Sidebar: React.FC = () => (
  <aside className="w-60 bg-white p-6 border-r hidden md:block">
    <div className="flex flex-col gap-4">
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
        <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
          Orders
        </span>
        <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
          Reports
        </span>
        <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
          Settings
        </span>
      </nav>
    </div>
  </aside>
);

export default Sidebar;
