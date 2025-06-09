import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppSelector } from "../../../hooks";
import { getUserById, UserResponse } from "../../../api/Users";
import { createOrder, OrderItem, Order } from "../../../api/Orders";
import { getCartByUserId, Cart, removeCartItem } from "../../../api/Cart";
import { getProductById } from "../../../api/Products";
import { formatPrice } from "../../../utils/formatPrice";

const Checkout = () => {
  const navigate = useNavigate();
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [cart, setCart] = useState<Cart | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [confirmedAddress, setConfirmedAddress] = useState("");

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

  useEffect(() => {
    const prepareOrderPreview = async () => {
      if (user && cart && confirmedAddress) {
        const shippingAddress = confirmedAddress;

        let firstSellerId: string = "";
        let firstSellerName: string = "N/A";

        if (cart.items.length > 0) {
          const product = await getProductById(cart.items[0].productId);
          if (product) {
            firstSellerId = product.sellerId;
            firstSellerName = product.sellerUsername || "N/A";
          }
        }

        setOrderDetails({
          id: "Not placed yet",
          buyerId: user.id,
          sellerId: firstSellerId,
          totalAmount: cart.total,
          shippingAddress: shippingAddress,
          status: "PENDING",
          paymentStatus: "PENDING",
          deliveryTrackingNumber: "",
          createdAt: new Date().toISOString(),
          buyerName: user.fullName,
          sellerName: firstSellerName,
        });
      }
    };
    prepareOrderPreview();
  }, [user, cart, confirmedAddress]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser?.id || !user || !cart || !confirmedAddress) return;

    const shippingAddressToSend = confirmedAddress;

    try {
      // Fetch sellerId for each item to include in orderItems and for the overall order
      const productPromises = cart.items.map((item) =>
        getProductById(item.productId)
      );
      const products = await Promise.all(productPromises);

      let firstSellerId: string = "";
      let actualSellerName: string = "N/A";
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
            actualSellerName = product.sellerUsername || "N/A";
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
        navigate;
        return;
      }

      const orderData = {
        buyerId: loggedInUser.id,
        sellerId: firstSellerId,
        shippingAddress: shippingAddressToSend,
        items: orderItems,
      };

      const order = await createOrder(orderData);
      if (order) {
        setOrderDetails({
          ...order,
          sellerName: actualSellerName,
          buyerName: user.fullName,
          items: orderItems,
        });
        setIsOrderPlaced(true);
        // Clear the cart after successful order
        await clearCart();
        toast.success("Order placed successfully!");
        navigate("/payment", {
          state: { order: { ...order, items: orderItems } },
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.productImage}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                </div>
              </div>
              <p className="font-medium">{formatPrice(item.price)}</p>
            </div>
          ))}
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Preview / Actual Order Details */}
      {orderDetails && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="grid grid-cols-2 gap-4">
            {isOrderPlaced && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{orderDetails.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">{orderDetails.status}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm text-gray-600">Buyer</p>
              <p className="font-medium">
                {orderDetails.buyerName || orderDetails.buyerId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Seller</p>
              <p className="font-medium">
                {orderDetails.sellerName || orderDetails.sellerId || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium">
                {formatPrice(orderDetails.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-medium">
                {new Date(orderDetails.createdAt).toLocaleString()}
              </p>
            </div>
            {/* Delivery Tracking */}
            {orderDetails && (
              <div className="col-span-2 mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Delivery Tracking</p>
                    <p className="font-medium">
                      {orderDetails.deliveryTrackingNumber ||
                        "Not assigned yet"}
                    </p>
                  </div>
                  {orderDetails.deliveryTrackingNumber && (
                    <button
                      onClick={() => {
                        if (orderDetails.deliveryTrackingNumber) {
                          navigator.clipboard.writeText(
                            orderDetails.deliveryTrackingNumber
                          );
                          toast.success("Tracking number copied to clipboard!");
                        }
                      }}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Shipping Address</p>
              <p className="font-medium">{orderDetails.shippingAddress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="font-medium">{orderDetails.paymentStatus}</p>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        <div>
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!useNewAddress}
                onChange={() => {
                  setUseNewAddress(false);
                  setNewAddress(user?.address || "");
                }}
                className="form-checkbox"
              />
              <span>Use my saved address</span>
            </label>
            {!useNewAddress && (
              <p className="mt-2 text-gray-600">{user?.address}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useNewAddress}
                onChange={() => setUseNewAddress(true)}
                className="form-checkbox"
              />
              <span>Use a new address</span>
            </label>
            {useNewAddress && (
              <input
                type="text"
                value={newAddress}
                onChange={handleAddressChange}
                placeholder="Enter new shipping address"
                className="mt-2 w-full p-2 border rounded"
                required
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleConfirmAddress}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Confirm Address
          </button>
        </div>
      </div>

      {/* Place Order Button - Moved to bottom */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!confirmedAddress || isOrderPlaced}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;
