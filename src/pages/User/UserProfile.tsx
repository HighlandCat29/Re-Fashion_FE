import React, { useEffect, useState } from "react";
import { getUserById, UserResponse, updateUser } from "../../api/Users/index";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/Logout";
import { useAppSelector } from "../../hooks";
import { getProductsBySellerId, Product } from "../../api/Products/adminIndex";
import { formatPrice } from "../../utils/formatPrice";

interface UserForm {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

const UserProfile = () => {
  // ─── Safe‐parse localStorage "user" ───
  // Using Redux state for user info now
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const currentUserId = loggedInUser?.id ?? null;

  const [user, setUser] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<UserForm>({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [editing, setEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [, setUserProfile] = useState<UserResponse | null>(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
  };

  // Fetch User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUserId) {
        toast.error("Please log in to view your profile");
        // Optionally redirect to login
        // navigate('/login');
        return;
      }

      setLoadingProfile(true);
      try {
        const data = await getUserById(currentUserId);
        if (data) {
          setUser(data);
          setForm({
            username: data.username,
            password: "",
            confirmPassword: "",
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            address: data.address,
          });
          setUserProfile(data);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        toast.error("Failed to load profile.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [currentUserId]); // Depend on currentUserId

  // Fetch User's Listed Products
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!currentUserId) {
        setUserProducts([]); // Clear products if no user is logged in
        return;
      }

      setLoadingProducts(true);
      try {
        const products = await getProductsBySellerId(currentUserId);
        if (products) {
          setUserProducts(products);
        } else {
          setUserProducts([]); // Set to empty array if null is returned
        }
      } catch (err) {
        console.error("Failed to load user products:", err);
        toast.error("Failed to load your listed products.");
        setUserProducts([]); // Ensure state is clear on error
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchUserProducts();
  }, [currentUserId]); // Depend on currentUserId

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate password match
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoadingProfile(true);
    try {
      await updateUser(user.id, {
        ...form,
        roleId: user.role.roleId,
        email: user.email,
        active: user.active,
      });
      toast.success("Profile updated successfully!");
      setEditing(false);
      // Reset password fields
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  if (loadingProfile)
    // Show loading for profile data
    return <p className="text-center mt-10">Loading profile...</p>;

  if (!user)
    // Show message if no user data after loading
    return (
      <p className="text-center mt-10">Profile not found or not logged in.</p>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-8">
      {/* Profile Info Section */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={user.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {user.fullName}
            </h2>
            <p className="text-sm text-gray-500">@{user.username}</p>
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

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-black">
              Profile Information
            </h3>
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                disabled={!editing}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                disabled={!editing}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                disabled={!editing}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={!editing}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100"
              />
            </div>
            {editing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-semibold mb-2 text-black">
            Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Email Verified:</strong>{" "}
              {user.emailVerified ? "Yes" : "No"}
            </p>
          </div>
        </section>

        {editing && (
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={loadingProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>

      {/* Current's Selling Products Section */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold text-black mb-4">
          Current's Selling Products
        </h3>
        {loadingProducts ? (
          <p className="text-center py-4">Loading products...</p>
        ) : userProducts.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            No products listed yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProducts.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 mb-3">
                  <img
                    src={product.imageUrls[0] || "/placeholder-image.jpg"}
                    alt={product.title}
                    className="object-cover rounded-lg w-full h-48"
                  />
                </div>
                <h4 className="font-medium text-lg mb-2">{product.title}</h4>
                <p className="text-gray-600 mb-2">{product.brand}</p>
                <p className="text-primary font-semibold mb-2">
                  {formatPrice(product.price)}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      product.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : product.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product.status}
                  </span>
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
