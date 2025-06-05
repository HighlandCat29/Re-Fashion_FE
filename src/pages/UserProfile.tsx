import React, { useEffect, useState } from "react";
import { getUserById, UserResponse } from "../api/Users/index";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/Logout";

interface UserForm {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
}

const UserProfile = () => {
  // ─── Safe‐parse localStorage "user" ───
  let parsedUser: { id?: string } | null = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw && raw !== "undefined") {
      parsedUser = JSON.parse(raw);
    }
  } catch {
    parsedUser = null;
  }
  const currentUserId = parsedUser?.id ?? null;

  const [user, setUser] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<UserForm | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUserId) {
        toast.error("Please log in to view your profile");
        return;
      }

      try {
        const data = await getUserById(currentUserId);
        if (data) {
          setUser(data);
          setForm({
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            address: data.address,
          });
        }
      } catch (err) {
        toast.error("Failed to load profile.");
      }
    };

    fetchProfile();
  }, [currentUserId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (!form) return;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !user) return;
    setLoading(true);
    try {
      // TODO: Implement updateUser function in API
      // await updateUser(user.id, form);
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !form)
    return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={user.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div>
            <h2 className="text-2xl font-semibold">{user.fullName}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2 text-blue-700">
            Account Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg p-2 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg p-2 disabled:bg-gray-100"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2 text-blue-700">
            Contact Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg p-2 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg p-2 disabled:bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border rounded-lg p-2 disabled:bg-gray-100"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2 text-blue-700">
            System Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <p>
              <strong>Role:</strong> {user.role.roleName}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(user.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Email Verified:</strong>{" "}
              {user.emailVerified ? "Yes" : "No"}
            </p>
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-4">
          {editing ? (
            <>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
