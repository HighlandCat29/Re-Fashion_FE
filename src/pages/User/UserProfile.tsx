import React, { useEffect, useState } from "react";
import { getUserById, UserResponse } from "../../api/Users/index";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/Logout";
import { useAppSelector } from "../../hooks";
import { getProductsBySellerId, Product } from "../../api/Products/adminIndex";
import { formatPrice } from "../../utils/formatPrice";

interface UserForm {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
}

const UserProfile = () => {
  // ─── Safe‐parse localStorage "user" ───
  // Using Redux state for user info now
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const currentUserId = loggedInUser?.id ?? null;

  const [user, setUser] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<UserForm | null>(null);
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
            email: data.email,
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
    if (!form) return;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !user) return;
    setLoadingProfile(true);
    try {
      // TODO: Implement updateUser function in API
      // await updateUser(user.id, form);
      toast.success("Profile updated!");
      setEditing(false);
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

  if (!user || !form)
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
          <h3 className="text-xl font-semibold mb-4 text-black">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Removed Account Info from form as username/email might not be editable here */}
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
            <div className="md:col-span-2">
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
          </div>
        </section>

        {/* Removed System Info section as it's display only */}
        {/* Display Account and System Info outside the form */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold mb-2 text-black">
            Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
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
                disabled={loadingProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingProfile ? "Saving..." : "Save Changes"}
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

      {/* My Listed Products Section */}
      <section className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-black">
            Current's Selling Product
          </h3>
          <button
            onClick={() => navigate("/sell-product-list")}
            className="text-primary hover:text-primary-dark font-medium"
          >
            View All Products →
          </button>
        </div>
        {loadingProducts ? (
          <p>Loading products...</p>
        ) : userProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              You haven't listed any products yet.
            </p>
            <button
              onClick={() => navigate("/sell-product")}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              List a Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userProducts.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={product.imageUrls[0] || "/default-product.png"}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-1">
                    {product.title}
                  </h4>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                  <p className="text-md font-bold text-primary mt-2">
                    {formatPrice(product.price)}
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
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
