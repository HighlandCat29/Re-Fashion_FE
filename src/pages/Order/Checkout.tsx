import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppSelector } from "../../hooks";
import { getUserById, UserResponse } from "../../api/Users";
import { createOrder, OrderItem } from "../../api/Orders";
import { getCartByUserId, Cart, removeCartItem } from "../../api/Cart";
import { getProductById } from "../../api/Products";
import { formatPrice } from "../../utils/formatPrice";
import paymentImage from "../../assets/Payment.jpg";
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../../config/cloudinary";

const Checkout = () => {
  const navigate = useNavigate();
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [cart, setCart] = useState<Cart | null>(null);
  const [confirmedAddress, setConfirmedAddress] = useState("");
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!loggedInUser?.id) {
        toast.error("Please log in to proceed with checkout");
        navigate("/login");
        return;
      }

      try {
        const [userData, cartData] = await Promise.all([
          getUserById(loggedInUser.id),
          getCartByUserId(loggedInUser.id),
        ]);

        if (userData) {
          setUser(userData);
          setUseNewAddress(false);
          setNewAddress(userData.address);
          setConfirmedAddress(userData.address);
        }

        if (cartData) {
          setCart(cartData);
        }
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInUser, navigate]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress(e.target.value);
  };

  const handleConfirmAddress = () => {
    const addressToConfirm = useNewAddress ? newAddress : user?.address || "";
    if (addressToConfirm) {
      setConfirmedAddress(addressToConfirm);
      toast.success("Shipping address confirmed!");
    } else {
      toast.error("Please enter a shipping address.");
    }
  };

  const clearCart = async () => {
    if (!loggedInUser?.id || !cart) return;

    try {
      // Remove each item from the cart
      for (const item of cart.items) {
        await removeCartItem(loggedInUser.id, item.productId);
      }
      setCart(null);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const handlePaymentScreenshotChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("cloud_name", "dnrxylpid"); // Replace with your actual Cloudinary cloud name if different

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!data.secure_url) {
        throw new Error(data.error?.message || "Failed to upload image");
      }
      setPaymentScreenshotUrl(data.secure_url);
      toast.success("Payment screenshot uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload payment screenshot.");
      setPaymentScreenshotUrl(""); // Clear URL on error
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser?.id || !user || !cart || !confirmedAddress) {
      toast.error("Please complete all required information");
      return;
    }
    if (!paymentScreenshotUrl) {
      toast.error("Please upload payment screenshot");
      return;
    }

    const shippingAddressToSend = confirmedAddress;

    try {
      // Fetch sellerId for each item to include in orderItems and for the overall order
      const productPromises = cart.items.map((item) =>
        getProductById(item.productId)
      );
      const products = await Promise.all(productPromises);

      let firstSellerId: string = "";
      const orderItems: OrderItem[] = [];

      // Filter out null products and process valid ones
      const validProducts = products.filter(
        (product): product is NonNullable<typeof product> => product !== null
      );

      if (validProducts.length === 0) {
        toast.error("No valid products found in cart. Please try again.");
        return;
      }

      for (let i = 0; i < cart.items.length; i++) {
        const cartItem = cart.items[i];
        const product = products[i];

        if (product) {
          orderItems.push({
            productId: cartItem.productId,
            quantity: 1,
            price: cartItem.price,
            productName: cartItem.title,
            productImage: product.imageUrls[0] || "",
          });
          if (!firstSellerId) {
            firstSellerId = product.sellerId ?? "";
          }
        }
      }

      if (!firstSellerId) {
        toast.error(
          "Could not determine seller information. Please try again."
        );
        return;
      }

      if (orderItems.length === 0) {
        toast.error("No valid items in cart to place order");
        return;
      }

      const orderData = {
        buyerId: loggedInUser.id,
        sellerId: firstSellerId,
        shippingAddress: shippingAddressToSend,
        items: orderItems,
        paymentImageUrls: [paymentScreenshotUrl],
      };

      const order = await createOrder(orderData);
      if (order) {
        // Clear the cart after successful order
        await clearCart();
        toast.success("Order placed successfully!");
        navigate("/order-confirmation", {
          state: {
            order: {
              ...order,
              items: orderItems,
              buyerName: user.fullName,
              sellerName: order.sellerName || "N/A",
              paymentScreenshotUrl: paymentScreenshotUrl,
            },
          },
        });
      }
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!user || !cart) {
    return <div className="text-center mt-10">Data not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Summary and Address */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Summary Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Buyer Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Buyer Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p>
                  <span className="font-medium">Name:</span> {user?.fullName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {user?.phoneNumber}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p>{confirmedAddress || "No address confirmed yet"}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Order Items</h3>
              <div className="space-y-4">
                {cart?.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-md"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.productImage}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <p className="font-medium">{item.title}</p>
                      </div>
                    </div>
                    <p className="font-medium">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Payment Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatPrice(cart?.total || 0)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatPrice(cart?.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Confirmation Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use New Address
              </label>
              <input
                type="checkbox"
                checked={useNewAddress}
                onChange={(e) => setUseNewAddress(e.target.checked)}
                className="h-4 w-4 text-black focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {useNewAddress ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Shipping Address
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your new shipping address"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Address
                </label>
                <p className="text-gray-600">{user?.address}</p>
              </div>
            )}

            <button
              onClick={handleConfirmAddress}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Confirm Address
            </button>
          </div>
        </div>

        {/* Right Column - Payment Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="mb-6">
              <img
                src={paymentImage}
                alt="Payment Instructions"
                className="w-full rounded-lg shadow-md mb-4"
              />
              <div className="space-y-2 text-center mb-4">
                <p className="font-medium">Ngân hàng: VCB</p>
                <p className="font-medium">Tên tài khoản: THAI BINH DUONG</p>
                <p className="font-medium">Số tài khoản: 1031513945</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePaymentScreenshotChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <p className="mt-2 text-sm text-blue-500">Uploading image...</p>
              )}
            </div>

            {/* Payment Screenshot Preview */}
            {paymentScreenshotUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  Payment Confirmation
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <img
                    src={paymentScreenshotUrl}
                    alt="Payment Screenshot"
                    className="w-full rounded-md"
                  />
                </div>
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handleSubmit}
              disabled={!confirmedAddress || !paymentScreenshotUrl}
              className={`w-full px-6 py-3 rounded-md text-white font-medium ${
                !confirmedAddress || !paymentScreenshotUrl
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              }`}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
