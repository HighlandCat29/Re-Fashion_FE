import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminUsers,
  deleteAdminUser,
  AdminUserResponse,
} from "../../../api/Users/index";
import ConfirmationModal from "../../../components/ConfirmationModal";

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(
    null
  );
  const [userToDelete, setUserToDelete] = useState<AdminUserResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const data = await getAdminUsers();
      if (data) setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteAdminUser(id);
      fetchAllUsers();
      setUserToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={() => navigate("/admin/users/add")}
            className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            + Add User
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Avatar
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <img
                        src={
                          user.profilePicture || "/images/default-avatar.png"
                        }
                        alt={user.username}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {user.role?.roleName}
                      <button
                        onClick={() =>
                          navigate("/admin/messages", {
                            state: { userId: user.id, username: user.username },
                          })
                        }
                        className="ml-3 text-purple-600 hover:underline font-medium"
                      >
                        Chat
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-green-600 hover:underline font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                        className="text-black hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Improved Modal UI */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              User Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <Detail label="ID" value={selectedUser.id} />
              <Detail label="Username" value={selectedUser.username} />
              <Detail label="Email" value={selectedUser.email} />
              <Detail label="Full Name" value={selectedUser.fullName} />
              <Detail label="Phone Number" value={selectedUser.phoneNumber} />
              <Detail label="Address" value={selectedUser.address} />
              <Detail
                label="Profile Picture"
                value={selectedUser.profilePicture}
              />
              <Detail
                label="Email Verified"
                value={selectedUser.emailVerified ? "Yes" : "No"}
              />
              <Detail
                label="Active"
                value={selectedUser.active ? "Yes" : "No"}
              />
              <Detail
                label="Created At"
                value={new Date(selectedUser.createdAt).toLocaleString()}
              />
              <Detail
                label="Verification Token"
                value={selectedUser.verificationToken}
              />
              {selectedUser.role && (
                <>
                  <Detail label="Role ID" value={selectedUser.role.roleId} />
                  <Detail
                    label="Role Name"
                    value={selectedUser.role.roleName}
                  />
                  <Detail
                    label="Role Active"
                    value={selectedUser.role.active ? "Yes" : "No"}
                  />
                  <Detail
                    label="Role Description"
                    value={selectedUser.role.description}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => handleDeleteUser(userToDelete!.id)}
        title="Confirm User Deletion"
        message={`Are you sure you want to delete the user "${userToDelete?.username}"? This will permanently remove their account.`}
      />
    </div>
  );
};

const Detail = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) => (
  <div className="flex flex-col">
    <span className="text-gray-500 font-semibold">{label}</span>
    <span className="text-gray-800 break-words">{value || "-"}</span>
  </div>
);

export default UserManagement;
