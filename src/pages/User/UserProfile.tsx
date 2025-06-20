import React, { useEffect, useState } from "react";
import {
  getUserById,
  UserResponse,
  updateUser,
  AdminUser,
} from "../../api/Users/index";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../../api/Logout";
import { useAppSelector } from "../../hooks";
import { getProductsBySellerId, Product } from "../../api/Products/adminIndex";
import { formatPrice } from "../../utils/formatPrice";
import {
  getOrdersByBuyerID,
  Order,
  getOrdersBySellerId,
} from "../../api/Orders/index";
import { formatDate } from "../../utils/formatDate";
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../../config/cloudinary";
import { getMyFeaturedPayments, FeaturedPayment } from "../../api/Feature";
import { getProductById } from "../../api/Products";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [featuredPayments, setFeaturedPayments] = useState<FeaturedPayment[]>(
    []
  );
  const [loadingFeaturedPayments, setLoadingFeaturedPayments] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<
    Record<string, Product>
  >({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
          setPreviewUrl(data.profilePicture || null); // Set initial preview
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

  // Handle file selection and preview for profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(user?.profilePicture || null);
    }
  };

  const uploadImageToCloudinary = async (
    file: File
  ): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", UPLOAD_PRESET);
      cloudinaryFormData.append("cloud_name", "dnrxylpid"); // Replace with your Cloudinary cloud name

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: cloudinaryFormData,
      });

      const data = await response.json();

      if (data.secure_url) {
        toast.success("Image uploaded successfully!");
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      toast.error("Failed to upload image to Cloudinary.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

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

  // Fetch User's Orders (both buying and selling)
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!currentUserId) {
        setOrders([]);
        return;
      }

      setLoadingOrders(true);
      try {
        const buyingOrders = await getOrdersByBuyerID(currentUserId);
        const sellingOrders = await getOrdersBySellerId(currentUserId);

        const combinedOrders = [
          ...(buyingOrders || []),
          ...(sellingOrders || []),
        ];

        // Remove duplicates if an order appears in both (e.g., if buyer is also seller)
        const uniqueOrders = Array.from(
          new Map(
            combinedOrders.map((order) => [order.orderId, order])
          ).values()
        );

        setOrders(uniqueOrders);
      } catch (err) {
        console.error("Failed to load user orders:", err);
        toast.error("Failed to load your order history.");
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [currentUserId]);

  // Fetch User's Featured Payments
  useEffect(() => {
    if (!currentUserId) {
      setFeaturedPayments([]);
      return;
    }

    let isMounted = true;

    const fetchFeaturedPayments = async () => {
      try {
        const payments = await getMyFeaturedPayments(currentUserId);
        if (isMounted && payments) {
          setFeaturedPayments(payments);
          const productPromises = payments.map((p) =>
            getProductById(p.productId)
          );
          const products = await Promise.all(productPromises);
          const productsMap = products.reduce((acc, product) => {
            if (product) {
              acc[product.id as string] = product;
            }
            return acc;
          }, {} as Record<string, Product>);
          setFeaturedProducts(productsMap);
        }
      } catch (err) {
        console.error("Failed to load featured payments:", err);
      }
    };

    const initialFetch = async () => {
      setLoadingFeaturedPayments(true);
      await fetchFeaturedPayments();
      if (isMounted) {
        setLoadingFeaturedPayments(false);
      }
    };

    initialFetch();

    const intervalId = setInterval(fetchFeaturedPayments, 10000); // Poll every 10 seconds

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentUserId]);

  // Debugging useEffect for orders state
  useEffect(() => {
    console.log("Orders state changed:", orders);
  }, [orders]);

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
    let imageUrl = user.profilePicture || "";

    if (selectedFile) {
      const uploadedUrl = await uploadImageToCloudinary(selectedFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        toast.error("Failed to upload profile picture. Please try again.");
        setLoadingProfile(false);
        return; // Stop the form submission if image upload fails
      }
    }

    // Log the form data before sending to the API
    console.log("Form data before update:", form);

    try {
      const updatePayload: Partial<AdminUser> = {
        username: form.username,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        address: form.address,
        roleId: user.role.roleId,
        email: user.email,
        active: user.active,
        profilePicture: imageUrl, // Use the potentially new imageUrl
      };

      if (form.password) {
        updatePayload.password = form.password;
        updatePayload.confirmPassword = form.confirmPassword; // Include confirmPassword if password is being updated, though backend might ignore
      }

      await updateUser(user.id, updatePayload as AdminUser);
      toast.success("Profile updated successfully!");
      setEditing(false);
      // Reset password fields
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      // Refresh user data to show updated profile picture
      // This can be done by refetching user data or updating the user state directly
      setUser((prevUser) =>
        prevUser ? { ...prevUser, profilePicture: imageUrl } : null
      );
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Filter orders for the "Current Buying Orders" section
  const filteredBuyingOrders = orders.filter(
    (order) => order.buyerId === currentUserId
  );

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PAID: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loadingProfile)
    // Show loading for profile data
    return <p className="text-center mt-10">Loading profile...</p>;

  if (!user)
    // Show message if no user data after loading
    return (
      <p className="text-center mt-10">Profile not found or not logged in.</p>
    );

  // console.log("Orders state before rendering:", orders); // Removed debugging log

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-8">
      {/* Profile Info Section */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={previewUrl || user.profilePicture || "/default-avatar.png"}
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
              onClick={() => {
                setEditing(!editing);
                if (editing) {
                  // If cancelling, reset file selection and preview
                  setSelectedFile(null);
                  setPreviewUrl(user?.profilePicture || null);
                }
              }}
              className="text-black hover:text-gray-800 font-medium"
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
                  <label
                    htmlFor="profilePicture"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <p className="text-blue-500 text-sm mt-1">
                      Uploading image...
                    </p>
                  )}
                  {previewUrl && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="Profile Preview"
                        className="w-24 h-24 object-cover rounded-full"
                      />
                    </div>
                  )}
                </div>
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

        {/* Current Feature's Product */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Current Feature's Product
          </h3>
          {loadingFeaturedPayments ? (
            <p>Loading featured products...</p>
          ) : featuredPayments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPayments.map((payment) => {
                const product = featuredProducts[payment.productId];
                if (!product) return null;

                const paymentDate = new Date(payment.paymentDate);
                const expiryDate = new Date(
                  paymentDate.getTime() +
                    payment.durationDays * 24 * 60 * 60 * 1000
                );

                return (
                  <div
                    key={payment.id}
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={product.imageUrls?.[0] || "/default-image.jpg"}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-lg text-gray-900 truncate">
                        {product.title}
                      </h4>
                      <p className="text-gray-700 mt-1">
                        {formatPrice(product.price)}
                      </p>
                      <div className="mt-2 text-sm text-gray-600">
                        Status:{" "}
                        <span
                          className={`font-medium px-2 py-1 rounded-full text-xs ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Duration: {payment.durationDays} days</p>
                        <p>Payment Date: {formatDate(payment.paymentDate)}</p>
                        {payment.status === "PAID" && (
                          <p>
                            Ended Day: {formatDate(expiryDate.toISOString())}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">You have no featured products yet.</p>
          )}
        </div>

        {editing && (
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={loadingProfile || uploadingImage}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="text-black hover:text-gray-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Current Selling Orders Section */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold text-black mb-4">
          Current Selling Orders
        </h3>
        {loadingOrders ? (
          <p className="text-center py-4">Loading orders...</p>
        ) : orders.filter((order) => order.sellerId === currentUserId)
            .length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            No current selling orders.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders
              .filter((order) => order.sellerId === currentUserId)
              .map((order) => (
                <div
                  key={order.orderId}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-lg mb-2">
                    Order ID: {order.orderId}
                  </h4>
                  <p className="text-gray-600 mb-2">
                    Buyer: {order.buyerName || "Unknown Buyer"}
                  </p>
                  <p className="text-primary font-semibold mb-2">
                    Total: {formatPrice(order.totalAmount)}
                  </p>
                  <p className="text-gray-600 mb-2">
                    Order Date: {formatDate(order.createdAt)}
                  </p>
                  <p className="text-gray-600 mb-2">
                    Shipping Address: {order.shippingAddress}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-sm ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.paymentStatus || "N/A"}
                    </span>
                  </div>
                  <h4 className="mt-3 text-md font-semibold">Items:</h4>
                  <ul className="list-disc list-inside ml-4 text-gray-700">
                    {order.items?.map((item, index) => (
                      <li key={index}>
                        {item.productName} (x{item.quantity}) -{" "}
                        {formatPrice(item.price)}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2">
                    {order.paymentScreenshotUrl && (
                      <p className="text-gray-600 text-sm mb-1">
                        Payment Screenshot:
                      </p>
                    )}
                    {order.paymentScreenshotUrl && (
                      <img
                        src={order.paymentScreenshotUrl}
                        alt="Payment Screenshot"
                        className="w-32 h-32 object-cover rounded-md shadow"
                      />
                    )}
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/seller-order/${order.orderId}/status`}
                      className="text-black hover:text-gray-800 text-sm font-medium flex items-center gap-1"
                    >
                      <span>View Order Status</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
      {/* Current Buying Orders Section */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold text-black mb-4">
          Current Buying Orders
        </h3>
        {loadingOrders ? (
          <p className="text-center py-4">Loading your orders...</p>
        ) : filteredBuyingOrders.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            No current buying orders.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuyingOrders.map((order) => (
              <div
                key={order.orderId}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-lg mb-2">
                  Order ID: {order.orderId}
                </h4>
                <p className="text-gray-600 mb-2">Seller: {order.sellerName}</p>
                <p className="text-primary font-semibold mb-2">
                  Total: {formatPrice(order.totalAmount)}
                </p>
                <p className="text-gray-600 mb-2">
                  Order Date: {formatDate(order.createdAt)}
                </p>
                <p className="text-gray-600 mb-2">
                  Shipping Address: {order.shippingAddress}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-sm ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.paymentStatus || "N/A"}
                  </span>
                </div>
                <h4 className="mt-3 text-md font-semibold">Items:</h4>
                <ul className="list-disc list-inside ml-4 text-gray-700">
                  {order.items?.map((item, index) => (
                    <li key={index}>
                      {item.productName} (x{item.quantity}) -{" "}
                      {formatPrice(item.price)}
                    </li>
                  ))}
                </ul>
                <div className="mt-2">
                  {order.paymentScreenshotUrl && (
                    <p className="text-gray-600 text-sm mb-1">
                      Payment Screenshot:
                    </p>
                  )}
                  {order.paymentScreenshotUrl && (
                    <img
                      src={order.paymentScreenshotUrl}
                      alt="Payment Screenshot"
                      className="w-32 h-32 object-cover rounded-md shadow"
                    />
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    to={`/order/${order.orderId}/status`}
                    className="text-black hover:text-gray-800 text-sm font-medium flex items-center gap-1"
                  >
                    <span>View Order Status</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
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
