import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getOrderById,
  Order,
  OrderItem,
  shipConfirm,
  updateOrderStatus,
} from "../../api/Orders";
import { getUserById } from "../../api/Users";
import { toast } from "react-hot-toast";
import { useAppSelector } from "../../hooks";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../../config/cloudinary";
import { Message } from "../../api/Message";
import { HiArrowLeft } from "react-icons/hi2";

const ADMIN_USER_ID = "0e274421-7d98-4864-97e7-20dc05852138";

const SellerOrderStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [buyerName, setBuyerName] = React.useState<string>("");
  const [packageImage, setPackageImage] = React.useState<string>("");
  const [uploading, setUploading] = React.useState(false);
  const [shipLoading, setShipLoading] = React.useState(false);
  const [showAdminRefundModal, setShowAdminRefundModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(Date.now());
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const prevMessagesLength = React.useRef<number>(0);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    localStorage.setItem("lastOrderPage", window.location.pathname);
  }, []);

  React.useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !loggedInUser?.id) return;
      try {
        // Fetch the order directly by ID, as the seller needs to see any order they are involved in.
        const currentOrder = await getOrderById(orderId);

        // Verify that the logged-in user is indeed the seller for this order
        if (currentOrder && currentOrder.sellerId === loggedInUser.id) {
          setOrder(currentOrder);
          // Fetch buyer name if buyerId exists
          if (currentOrder.buyerId) {
            const buyer = await getUserById(currentOrder.buyerId);
            if (buyer) {
              setBuyerName(buyer.fullName);
            }
          }
        } else if (currentOrder && currentOrder.sellerId !== loggedInUser.id) {
          toast.error("You are not authorized to view this order.");
          navigate("/user-profile");
        } else {
          toast.error("Order not found");
          navigate("/user-profile");
        }
      } catch (error) {
        toast.error("Failed to fetch order details");
        navigate("/user-profile");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, loggedInUser?.id, navigate]);

  const statusSteps = [
    { id: "CANCELLED", label: "Cancelled" },
    { id: "PENDING", label: "Order Placed" },
    { id: "PROCESSING", label: "Processing" },
    { id: "SHIPPED", label: "Shipped" },
    { id: "DELIVERED", label: "Delivered" },
  ];

  // Helper to get status color (matches OrdersManagement)
  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Handler for package image upload
  const handlePackageImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
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
      if (!data.secure_url) throw new Error("Failed to upload image");
      setPackageImage(data.secure_url);
      toast.success("Package image uploaded!");
    } catch (err) {
      toast.error("Failed to upload package image");
      setPackageImage("");
    } finally {
      setUploading(false);
    }
  };

  // Handler for confirming shipment
  const handleShipConfirm = async () => {
    if (!orderId || !loggedInUser?.id || !packageImage) {
      toast.error("Missing information for shipping confirmation");
      return;
    }
    setShipLoading(true);
    try {
      const shippedOrder = await shipConfirm(
        orderId,
        [packageImage],
        loggedInUser.id
      );
      if (shippedOrder) {
        await updateOrderStatus(orderId, "SHIPPED");
        toast.success("Order marked as shipped!");
        // Refresh order state
        const refreshedOrder = await getOrderById(orderId);
        setOrder(refreshedOrder);
      }
    } catch (err) {
      toast.error("Failed to confirm shipment");
    } finally {
      setShipLoading(false);
    }
  };

  // Typing indicator logic using localStorage
  React.useEffect(() => {
    if (!showChat || !loggedInUser?.id) return;
    const typingKey = `typing-${loggedInUser.id}-to-${ADMIN_USER_ID}`;
    if (input) {
      localStorage.setItem(typingKey, "true");
      setIsTyping(false); // Don't show for self
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        localStorage.setItem(typingKey, "false");
      }, 1500);
    } else {
      localStorage.setItem(typingKey, "false");
      setIsTyping(false);
    }
  }, [input, showChat, loggedInUser?.id]);

  // Polling for messages and typing
  const fetchMessages = React.useCallback(() => {
    if (!loggedInUser?.id) return;
    import("../../api/Message").then(({ getConversation }) => {
      getConversation(loggedInUser.id, ADMIN_USER_ID).then((msgs) => {
        if (msgs) {
          setMessages(msgs);
          // Unread badge logic
          if (
            !showChat &&
            msgs.length > 0 &&
            new Date(msgs[msgs.length - 1].sentAt).getTime() > lastSeen
          ) {
            setUnread(true);
          }
        }
      });
    });
    // Typing indicator: check if admin is typing
    if (loggedInUser?.id) {
      const typingKey = `typing-${ADMIN_USER_ID}-to-${loggedInUser.id}`;
      setIsTyping(localStorage.getItem(typingKey) === "true");
    }
  }, [loggedInUser?.id, showChat, lastSeen]);

  React.useEffect(() => {
    if (showChat && loggedInUser && loggedInUser.id && ADMIN_USER_ID) {
      fetchMessages(); // Initial fetch
      intervalRef.current = setInterval(fetchMessages, 2000); // Poll every 2 seconds
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showChat, loggedInUser && loggedInUser.id, fetchMessages]);

  React.useEffect(() => {
    if (
      messages.length > prevMessagesLength.current &&
      messagesEndRef.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  // Mark as read when popup opens
  React.useEffect(() => {
    if (showChat) {
      setUnread(false);
      setLastSeen(Date.now());
    }
  }, [showChat, messages]);

  const handleSend = async () => {
    if (!input.trim() || !loggedInUser?.id) return;
    setLoading(true);
    const { sendMessage } = await import("../../api/Message");
    const msg = await sendMessage({
      senderId: loggedInUser.id,
      receiverId: ADMIN_USER_ID,
      message: input,
    });
    if (msg) {
      setMessages((prev) => [...prev, msg]);
      setInput("");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!order) {
    return <div className="text-center mt-8">Order not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-8">
      <div className="mb-6">
        <button
          onClick={() => navigate("/user-profile")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
          Return to Profile
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-8">Order Status (Seller View)</h2>

      {/* Order Status Roadmap */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">Order Progress</h3>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2"></div>
          <div className="relative flex justify-between">
            {statusSteps.map((step, index) => {
              const isActive =
                order.status === "CANCELLED"
                  ? step.id === "CANCELLED"
                  : statusSteps.findIndex((s) => s.id === order.status) >=
                      index && step.id !== "CANCELLED";
              const stepColor = isActive
                ? getStatusColor(step.id as Order["status"])
                : "bg-gray-200 text-gray-500";
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${stepColor}`}
                  >
                    {step.id === "CANCELLED" ? 0 : index}
                  </div>
                  <span
                    className={`text-sm ${
                      isActive
                        ? stepColor.replace("bg-", "text-")
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {order.status === "CANCELLED" && (
          <p className="text-sm text-red-600 mt-2 text-center">
            This order has been cancelled.
          </p>
        )}

        {/* Admin Refund Image Modal */}
        {order.adminPaymentScreenshotUrl && showAdminRefundModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            onClick={() => setShowAdminRefundModal(false)}
          >
            <div
              className="relative max-w-3xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-white text-2xl bg-black bg-opacity-50 rounded-full px-2 py-1 hover:bg-opacity-80"
                onClick={() => setShowAdminRefundModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <img
                src={order.adminPaymentScreenshotUrl}
                alt="Admin Refund Payment Screenshot Full"
                className="w-full max-h-[80vh] object-contain rounded shadow-lg"
              />
              <p className="mt-2 text-white text-center text-sm bg-black bg-opacity-40 px-4 py-2 rounded">
                This image was uploaded by the admin as proof of refund to the
                seller.
              </p>
            </div>
          </div>
        )}

        {/* Admin Refund Image under Order Progress */}
        {order.adminPaymentScreenshotUrl && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded flex items-center gap-4">
            <img
              src={order.adminPaymentScreenshotUrl}
              alt="Admin Refund Payment Screenshot"
              className="w-20 h-20 object-cover rounded-md shadow cursor-pointer hover:opacity-80"
              onClick={() => setShowAdminRefundModal(true)}
            />
            <div>
              <p className="font-medium text-green-700 mb-1">
                Admin Refund Payment Screenshot
              </p>
              <p className="text-xs text-gray-600">
                This image was uploaded by the admin as proof of refund to the
                seller. Please check your account for the refund.
              </p>
            </div>
          </div>
        )}

        {/* Status Descriptions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">
              Current Status:{" "}
              <span
                className={`px-2 py-1 rounded text-sm ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </h4>
            <p className="text-sm text-gray-600">
              {order.status === "PENDING" &&
                "The buyer has placed the order and it's awaiting your processing."}
              {order.status === "PROCESSING" &&
                "You are currently preparing and processing the order."}
              {order.status === "SHIPPED" &&
                "You have shipped the order, and it's on its way to the buyer."}
              {order.status === "DELIVERED" &&
                "The order has been successfully delivered to the buyer."}
              {order.status === "CANCELLED" && "This order has been cancelled."}
            </p>
            {/* Chat with Admin button if DELIVERED */}
            {order.status === "DELIVERED" && loggedInUser?.id && (
              <button
                className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 relative"
                onClick={() => setShowChat(true)}
              >
                Chat with Admin
                {unread && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    New
                  </span>
                )}
              </button>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Next Steps</h4>
            <p className="text-sm text-gray-600">
              {order.status === "PENDING" &&
                "Please process the order as soon as possible."}
              {order.status === "PROCESSING" &&
                'Prepare the shipment and update the order status to "SHIPPED".'}
              {order.status === "SHIPPED" &&
                "Monitor the delivery and ensure it reaches the buyer."}
              {order.status === "DELIVERED" &&
                "The order is complete. Wait for admin to refund the payment to you."}
              {order.status === "CANCELLED" &&
                "No further action required for this order."}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Status Section */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">Payment Status</h3>
        <div className="flex items-center gap-4">
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              order.paymentStatus === "UNPAID"
                ? "bg-red-100 text-red-800"
                : order.paymentStatus === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : order.paymentStatus === "PAID"
                ? "bg-green-100 text-green-800"
                : order.paymentStatus === "REFUNDED"
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {order.paymentStatus === "UNPAID"
              ? "Unpaid"
              : order.paymentStatus === "PENDING"
              ? "Awaiting Your Confirmation"
              : order.paymentStatus === "PAID"
              ? "Payment Confirmed"
              : order.paymentStatus === "REFUNDED"
              ? "Refunded"
              : "Unknown Status"}
          </div>
          {order.paymentStatus === "PENDING" && (
            <p className="text-sm text-gray-600">
              The buyer has submitted payment. Please confirm payment once
              received.
            </p>
          )}
          {order.paymentStatus === "UNPAID" && (
            <p className="text-sm text-gray-600">
              Payment is pending from the buyer.
            </p>
          )}
          {order.paymentStatus === "PAID" && (
            <p className="text-sm text-gray-600">
              Payment from the buyer has been confirmed and will be securely
              held by the admin until the order is successfully completed.
            </p>
          )}
        </div>
      </div>

      {/* Ship Packaged Section */}
      {order.status === "PROCESSING" && (
        <div className="my-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">
            Ship Packaged
          </h3>
          <p className="mb-2 text-gray-700">
            Upload a photo of the packaged order before shipping:
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handlePackageImageChange}
            disabled={uploading || shipLoading}
          />
          {packageImage && (
            <div className="mt-4">
              <img
                src={packageImage}
                alt="Package Preview"
                className="w-40 h-40 object-cover rounded shadow"
              />
            </div>
          )}
          <button
            className="mt-4 px-6 py-2 bg-black text-white rounded disabled:opacity-50"
            onClick={handleShipConfirm}
            disabled={!packageImage || uploading || shipLoading}
          >
            {shipLoading ? "Confirming..." : "Confirm Shipped"}
          </button>
        </div>
      )}

      {/* Order Details Card */}
      <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-lg">Order ID: {order.orderId}</h3>
            <p className="text-gray-600">
              Buyer: {buyerName || order.buyerName || "Unknown Buyer"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Order Date</p>
            <p className="font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Amount</p>
            <p className="font-medium text-primary">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Shipping Address</p>
            <p className="font-medium">{order.shippingAddress}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-3">Order Items</h4>
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="p-3 text-left">Product Name</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Product</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: OrderItem, index: number) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleProductClick(item.productId)}
                >
                  <td className="p-3">{item.productName}</td>
                  <td className="p-3">{formatPrice(item.price)}</td>
                  <td className="p-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Screenshot, Shipped Package Image, and Delivery Confirmation Image */}
        <div className="mt-6 flex flex-wrap gap-8 items-start">
          {order.paymentScreenshotUrl && (
            <div>
              <p className="text-gray-600 mb-2">Payment Screenshot:</p>
              <img
                src={order.paymentScreenshotUrl}
                alt="Payment Screenshot"
                className="w-32 h-32 object-cover rounded-md shadow"
              />
            </div>
          )}
          {order.sellerPackageImageUrl && (
            <div>
              <p className="text-gray-600 mb-2">Shipped Package Image:</p>
              <img
                src={order.sellerPackageImageUrl}
                alt="Shipped Package"
                className="w-32 h-32 object-cover rounded-md shadow"
              />
            </div>
          )}
          {order.buyerPackageImageUrl && (
            <div>
              <p className="text-gray-600 mb-2">Delivery Confirmation Image:</p>
              <img
                src={order.buyerPackageImageUrl}
                alt="Delivery Confirmation"
                className="w-32 h-32 object-cover rounded-md shadow"
              />
            </div>
          )}
          {order.adminPaymentScreenshotUrl && (
            <div>
              <p className="text-gray-600 mb-2">
                Admin Refund Payment Screenshot:
              </p>
              <img
                src={order.adminPaymentScreenshotUrl}
                alt="Admin Refund Payment Screenshot"
                className="w-32 h-32 object-cover rounded-md shadow cursor-pointer hover:opacity-80"
                onClick={() => setShowAdminRefundModal(true)}
              />
              <p className="text-xs text-gray-500 mt-1">
                This image was uploaded by the admin as proof of refund to the
                seller.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat with Admin Popup */}
      {showChat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowChat(false)}
        >
          <div
            className="bg-white rounded shadow-lg w-full max-w-md p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowChat(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2">Chat with Admin</h2>
            <div className="h-64 overflow-y-auto border rounded p-2 mb-2 bg-gray-50">
              {messages.length === 0 ? (
                <p className="text-gray-400">No messages yet.</p>
              ) : (
                messages.map((msg, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`mb-2 flex ${
                        loggedInUser && msg.senderId === loggedInUser.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                          loggedInUser && msg.senderId === loggedInUser.id
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.message}
                        <div className="text-[10px] text-gray-400 mt-0.5 text-right">
                          {msg.sentAt
                            ? new Date(msg.sentAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Typing indicator */}
            {isTyping && (
              <div className="text-xs text-gray-500 mb-2">
                Admin is typing...
              </div>
            )}
            <div className="flex gap-2 items-center">
              <input
                className="flex-1 border rounded px-2 py-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onFocus={() => setUnread(false)}
              />
              <button
                className="bg-black text-white px-4 py-1 rounded disabled:opacity-50"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrderStatus;
