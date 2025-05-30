import React, { useState } from "react";
import Button from "../../components/Button";
import { Input } from "../../components/Input";
import { Search, Trash2, Bookmark, Flag, UserCircle } from "lucide-react";

const initialUsers = [
  {
    id: "#SE178",
    role: "Client",
    date: "20/05/2004",
    modified: "1 sec ago",
    size: "1Tb",
    status: "Active",
  },
  {
    id: "#SA201",
    role: "Seller",
    date: "29/05/2015",
    modified: "1 hr ago",
    size: "25Mb",
    status: "Inactive",
  },
  {
    id: "#SE121",
    role: "Seller",
    date: "12/12/2012",
    modified: "30 min ago",
    size: "25Mb",
    status: "Active",
  },
  {
    id: "#SE176",
    role: "Client",
    date: "23/12/2019",
    modified: "3 days ago",
    size: "25Mb",
    status: "Inactive",
  },
  {
    id: "#SE162",
    role: "Seller",
    date: "21/11/2020",
    modified: "5 weeks ago",
    size: "25Mb",
    status: "Active",
  },
  {
    id: "#SA154",
    role: "Seller",
    date: "22/08/2019",
    modified: "1 year ago",
    size: "25Mb",
    status: "Active",
  },
  {
    id: "#SA612",
    role: "Client",
    date: "11/03/2023",
    modified: "5 year ago",
    size: "25Mb",
    status: "Active",
  },
  {
    id: "#SE999",
    role: "Seller",
    date: "09/09/1999",
    modified: "0.99 sec ago",
    size: "25Mb",
    status: "Inactive",
  },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(initialUsers);

  const filteredUsers = users.filter(
    (user) =>
      user.id.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex text-sm">
      <aside className="w-64 bg-white p-4 border-r shadow-sm">
        <div className="space-y-2 text-sm">
          <div className="font-bold text-blue-600 text-lg">DashBoard</div>
          <nav className="space-y-1 mt-2">
            <div className="bg-gray-200 px-3 py-2 rounded-md">Users</div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              Products
            </div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              Favourites
            </div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              Messenger
            </div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              Order Lists
            </div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              E-commerce
            </div>
            <div className="text-gray-500 mt-4">PAGES</div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              File Manager
            </div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              Calendar
            </div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              Feed
            </div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              To-Do
            </div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              Contact
            </div>
            <div className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer">
              Invoice
            </div>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">User Accounts</h2>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search by ID or Role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 border-gray-300"
            />
            <Button mode="white" text="Newest" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="px-4">Roles</th>
                <th className="px-4">Created</th>
                <th className="px-4">Modified</th>
                <th className="px-4">Size</th>
                <th className="px-4">Status</th>
                <th className="px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium">{user.id}</td>
                    <td className="px-4">{user.role}</td>
                    <td className="px-4">{user.date}</td>
                    <td className="px-4">{user.modified}</td>
                    <td className="px-4">{user.size}</td>
                    <td className="px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium text-white ${
                          user.status === "Active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 flex gap-2">
                      <Bookmark
                        size={16}
                        className="cursor-pointer hover:text-blue-500"
                      />
                      <Flag
                        size={16}
                        className="cursor-pointer hover:text-yellow-500"
                      />
                      <Trash2
                        size={16}
                        className="cursor-pointer text-red-500 hover:text-red-600"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between p-4 border-t bg-gray-50 text-xs text-gray-600">
            <div>Showing data 1 to 8 of 256K entries</div>
            <div className="flex gap-1">
              <Button mode="white" text="<" />
              {[1, 2, 3, 4].map((p) => (
                <Button key={p} mode="transparent" text={p.toString()} />
              ))}
              <span className="px-2">...</span>
              <Button mode="transparent" text="40" />
              <Button mode="white" text=">" />
            </div>
          </div>
        </div>
      </main>

      <div className="p-4">
        <UserCircle size={28} className="text-gray-700" />
      </div>
    </div>
  );
}
