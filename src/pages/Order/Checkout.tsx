import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppSelector } from "../../hooks";
import { getUserById, UserResponse } from "../../api/Users";
import { createOrder, OrderItem } from "../../api/Orders";
import { getCartByUserId, Cart, removeCartItem } from "../../api/Cart";
import { getProductById, Product } from "../../api/Products";
import { formatPrice } from "../../utils/formatPrice";
import paymentImage from "../../assets/Payment.jpg";
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../../config/cloudinary";
import { MessagePopup } from "../../components/MessagePopup";

const Checkout = () => {
  const navigate = useNavigate();
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [cart, setCart] = useState<Cart | null>(null);
  const [productDetails, setProductDetails] = useState<Record<string, Product>>(
    {}
  );
  const [confirmedAddress, setConfirmedAddress] = useState("");
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<UserResponse | null>(null);
  const [showChat, setShowChat] = useState(false);

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
          if (cartData.items.length > 0) {
            const productIds = cartData.items.map((item) => item.productId);
            const productPromises = productIds.map((id) => getProductById(id));
            const products = await Promise.all(productPromises);

            const details: Record<string, Product> = {};
            products.forEach((product) => {
              if (product && product.id) {
                details[product.id] = product;
              }
            });
            setProductDetails(details);

            const firstValidProduct = cartData.items
              .map((item) => details[item.productId])
              .find((p) => p !== undefined);

            if (firstValidProduct && firstValidProduct.sellerId) {
              const sellerData = await getUserById(firstValidProduct.sellerId);
              setSellerProfile(sellerData);
            }
          }
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
      formData.append("cloud_name", "dnrxylpid");

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
      setPaymentScreenshotUrl("");
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
      const productPromises = cart.items.map((item) =>
        getProductById(item.productId)
      );
      const products = await Promise.all(productPromises);

      let firstSellerId: string = "";
      const orderItems: OrderItem[] = [];

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
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
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
            <div>
              <h3 className="text-lg font-medium mb-2">Items in Cart</h3>
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const product = productDetails[item.productId];
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center">
                        <img
                          src={product?.imageUrls[0] || ""}
                          alt={item.title}
                          className="w-16 h-16 rounded object-cover mr-4"
                        />
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-gray-600">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <div className="flex justify-between mt-2 items-center">
                <span className="font-medium">Shipping</span>
                <div className="text-right">
                  <span className="text-sm">
                    Shipping is according to Seller
                  </span>
                  <p className="text-xs text-gray-500">
                    Chat with Seller to determine shipping price
                  </p>
                </div>
              </div>
              {sellerProfile && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setShowChat(true)}
                    className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition"
                  >
                    Chat with Seller
                  </button>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl mt-4">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="address"
                    checked={!useNewAddress}
                    onChange={() => setUseNewAddress(false)}
                    className="mr-2"
                  />
                  Use existing address: {user?.address}
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="address"
                    checked={useNewAddress}
                    onChange={() => setUseNewAddress(true)}
                    className="mr-2"
                  />
                  Use a new address
                </label>
                {useNewAddress && (
                  <input
                    type="text"
                    value={newAddress}
                    onChange={handleAddressChange}
                    className="mt-2 w-full p-2 border rounded"
                    placeholder="Enter new address"
                  />
                )}
              </div>
              <button
                onClick={handleConfirmAddress}
                className="w-full mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Confirm Address
              </button>
              {confirmedAddress && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
                  Shipping to: <strong>{confirmedAddress}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <p className="text-gray-600 mb-4">
              Please transfer the total amount to the following account and
              upload a screenshot of your payment.
            </p>
            <div className="text-center">
              <img
                src={paymentImage}
                alt="Payment QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <div className="mt-4 text-center space-y-2">
              <p className="font-medium">Ngân hàng: VCB</p>
              <p className="font-medium">Tên tài khoản: THAI BINH DUONG</p>
              <p className="font-medium">Số tài khoản: 1031513945</p>
            </div>
            <div className="mt-4">
              <label
                htmlFor="payment-screenshot"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Payment Screenshot
              </label>
              <input
                type="file"
                id="payment-screenshot"
                accept="image/*"
                onChange={handlePaymentScreenshotChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <p className="mt-2 text-sm text-gray-500">Uploading...</p>
              )}
              {paymentScreenshotUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Screenshot Preview:</p>
                  <img
                    src={paymentScreenshotUrl}
                    alt="Payment Screenshot Preview"
                    className="mt-2 w-full h-auto rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition"
          >
            Place Order
          </button>
        </div>
      </div>
      {showChat && loggedInUser && sellerProfile && (
        <MessagePopup
          open={showChat}
          onClose={() => setShowChat(false)}
          senderId={loggedInUser.id}
          receiverId={sellerProfile.id}
          receiverName={sellerProfile.username}
        />
      )}
    </div>
  );
};

export default Checkout;
