// src/pages/Admin/AdminDashboard.tsx
import React from "react";
import Sidebar from "../../components/Admin/Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminManager() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex text-sm">
      <Sidebar />

      <main className="flex-1 p-6">
        <Outlet />
      </main>

      <div className="p-4">
        {/* You can keep your UserCircle icon or move it into Sidebar */}
      </div>
    </div>
  );
}
