import React, { useState, useEffect } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  Order,
  deleteOrder,
  adminRefund,
} from "../../../api/Orders";
import { toast } from "react-hot-toast";
import { getUserById } from "../../../api/Users";
import { getProductById } from "../../../api/Products/index";
import {
  CLOUDINARY_UPLOAD_URL,
  UPLOAD_PRESET,
} from "../../../config/cloudinary";
import { Message } from "../../../api/Message";

// Helper to upload a single image to Cloudinary
const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
  try {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", UPLOAD_PRESET);
    cloudinaryFormData.append("cloud_name", "dnrxylpid");
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: cloudinaryFormData,
    });
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error(data.error?.message || "Failed to upload image");
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    toast.error("Failed to upload image to Cloudinary.");
    return null;
  }
};

// RefundImageUploadCell: For DELIVERED orders, allow admin to upload refund images and call adminRefund
const RefundImageUploadCell = ({ order }: { order: Order }) => {
  const [uploading, setUploading] = useState(false);
  // TODO: Fetch and display actual refund images from backend if available
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      // Upload all images to Cloudinary
      const urls = (
        await Promise.all(Array.from(files).map(uploadImageToCloudinary))
      ).filter((url): url is string => !!url);
      if (urls.length === 0) throw new Error("No images uploaded");
      // Call adminRefund API
      const result = await adminRefund(order.orderId, urls);
      if (result) {
        setUploadedImages((prev) => [...prev, ...urls]);
        toast.success("Refund image(s) uploaded!");
      }
    } catch (err) {
      toast.error("Failed to upload refund image(s)");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        className="mb-2"
      />
      <div className="flex flex-wrap gap-2 mt-1">
        {uploadedImages.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt="Refund"
            className="w-10 h-10 object-cover rounded border cursor-pointer"
            onClick={() => window.open(url, "_blank")}
          />
        ))}
      </div>
      {uploading && (
        <div className="text-xs text-gray-400 mt-1">Uploading...</div>
      )}
    </div>
  );
};

// MessagePopup: simple chat popup for admin to chat with seller
const MessagePopup = ({
  open,
  onClose,
  senderId,
  receiverId,
}: {
  open: boolean;
  onClose: () => void;
  senderId: string;
  receiverId: string;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(Date.now());
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const prevMessagesLength = React.useRef<number>(0);

  // Typing indicator logic using localStorage
  React.useEffect(() => {
    if (!open) return;
    const typingKey = `typing-${senderId}-to-${receiverId}`;
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
  }, [input, open, senderId, receiverId]);

  // Polling for messages and typing
  const fetchMessages = React.useCallback(() => {
    import("../../../api/Message").then(({ getConversation }) => {
      getConversation(senderId, receiverId).then((msgs) => {
        if (msgs) {
          setMessages(msgs);
          // Unread badge logic
          if (
            !open &&
            msgs.length > 0 &&
            new Date(msgs[msgs.length - 1].sentAt).getTime() > lastSeen
          ) {
            setUnread(true);
          }
        }
      });
    });
    // Typing indicator: check if seller is typing
    const typingKey = `typing-${receiverId}-to-${senderId}`;
    setIsTyping(localStorage.getItem(typingKey) === "true");
  }, [senderId, receiverId, open, lastSeen]);

  React.useEffect(() => {
    if (open && senderId && receiverId) {
      fetchMessages(); // Initial fetch
      intervalRef.current = setInterval(fetchMessages, 2000); // Poll every 2 seconds
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, senderId, receiverId, fetchMessages]);

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
    if (open) {
      setUnread(false);
      setLastSeen(Date.now());
    }
  }, [open, messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const { sendMessage } = await import("../../../api/Message");
    const msg = await sendMessage({ senderId, receiverId, message: input });
    if (msg) {
      setMessages((prev) => [...prev, msg]);
      setInput("");
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded shadow-lg w-full max-w-md p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-2">Chat with Seller</h2>
        <div className="h-64 overflow-y-auto border rounded p-2 mb-2 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-400">No messages yet.</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 flex ${
                  msg.senderId === senderId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                    msg.senderId === senderId
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {/* If message is an image url, show image */}
                  {msg.message.match(/^https?:\/\//) &&
                  msg.message.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <img
                      src={msg.message}
                      alt="attachment"
                      className="max-w-[180px] max-h-[180px] rounded mb-1"
                    />
                  ) : msg.message.match(/^https?:\/\//) ? (
                    <a
                      href={msg.message}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-black"
                    >
                      {msg.message}
                    </a>
                  ) : (
                    msg.message
                  )}
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
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Typing indicator */}
        {isTyping && (
          <div className="text-xs text-gray-500 mb-2">Seller is typing...</div>
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
  );
};

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Order["status"] | "ALL">(
    "ALL"
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<
    Order["paymentStatus"] | "ALL"
  >("ALL");
  const [userType, setUserType] = useState<"ALL" | "BUYER" | "SELLER">("ALL");
  const [userId, setUserId] = useState("");
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState<
    string | null
  >(null);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []); // Only fetch on component mount

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      console.log("Raw API response data:", data);

      if (data && Array.isArray(data)) {
        const ordersWithNames = await Promise.all(
          data.map(async (order) => {
            const buyer = order.buyerId
              ? await getUserById(order.buyerId)
              : null;
            const seller = order.sellerId
              ? await getUserById(order.sellerId)
              : null;

            // Fetch full product details for each productId
            const items = await Promise.all(
              (order.productIds || []).map(async (productId) => {
                const product = await getProductById(productId);
                if (product) {
                  return {
                    productId: product.id,
                    quantity: 1, // Assuming quantity is 1 for now, adjust if your backend provides it
                    price: product.price,
                    productName: product.title,
                    productImage: product.imageUrls?.[0] || "",
                  };
                }
                return null; // Handle cases where product might not be found
              })
            );

            return {
              ...order,
              buyerName: buyer?.fullName || order.buyerId,
              sellerName: seller?.fullName || order.sellerId,
              items: items.filter((item) => item !== null) as Order["items"], // Filter out nulls
            };
          })
        );
        console.log("Setting orders with names and items:", ordersWithNames);
        setOrders(
          ordersWithNames.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } else {
        console.error("Invalid orders data received:", data);
        setOrders([]);
        toast.error("No valid orders data received");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    if (!orderId || !newStatus) {
      toast.error("Invalid order or status");
      return;
    }

    setUpdatingStatus(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      if (updatedOrder) {
        setOrders(
          orders.map((order) =>
            order.orderId === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success("Order status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePaymentStatusChange = async (
    orderId: string,
    newPaymentStatus: "UNPAID" | "PENDING" | "PAID" | "REFUNDED"
  ) => {
    console.log("Updating payment status:", { orderId, newPaymentStatus });

    if (!orderId) {
      toast.error("Order ID is required");
      return;
    }

    if (!newPaymentStatus) {
      toast.error("Payment status is required");
      return;
    }

    setUpdatingPaymentStatus(orderId);
    try {
      const updatedOrder = await updatePaymentStatus(orderId, newPaymentStatus);
      if (updatedOrder) {
        // If payment is confirmed, update order status to PROCESSING first
        if (newPaymentStatus === "PAID") {
          const order = orders.find((o) => o.orderId === orderId);
          if (order && order.status === "PENDING") {
            const statusUpdatedOrder = await updateOrderStatus(
              orderId,
              "PROCESSING"
            );
            if (statusUpdatedOrder) {
              // Update both payment status and order status in the local state
              setOrders(
                orders.map((order) =>
                  order.orderId === orderId
                    ? {
                        ...order,
                        paymentStatus: newPaymentStatus,
                        status: "PROCESSING",
                      }
                    : order
                )
              );
              toast.success("Payment confirmed and order moved to processing");
            }
          }
        } else {
          // For other payment status changes, just update the payment status
          setOrders(
            orders.map((order) =>
              order.orderId === orderId
                ? { ...order, paymentStatus: newPaymentStatus }
                : order
            )
          );
          toast.success(`Payment status updated to ${newPaymentStatus}`);
        }
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setUpdatingPaymentStatus(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      const success = await deleteOrder(orderId);
      if (success) {
        setOrders(orders.filter((order) => order.orderId !== orderId));
      }
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const closeOrderDetailsModal = () => {
    setShowOrderDetailsModal(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      REFUND: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Filter orders based on status, user type, and ID
  const filteredOrders =
    orders?.filter((order) => {
      if (!order) return false;

      // Filter by selected status
      if (selectedStatus !== "ALL" && order.status !== selectedStatus) {
        return false;
      }

      // Filter by selected payment status
      if (
        selectedPaymentStatus !== "ALL" &&
        order.paymentStatus !== selectedPaymentStatus
      ) {
        return false;
      }

      // Filter by user type and ID
      if (userType === "ALL") {
        return (
          order.buyerName?.toLowerCase().includes(userId.toLowerCase()) ||
          order.sellerName?.toLowerCase().includes(userId.toLowerCase())
        );
      }

      if (userType === "BUYER" && userId) {
        return order.buyerName?.toLowerCase().includes(userId.toLowerCase());
      }

      if (userType === "SELLER" && userId) {
        return order.sellerName?.toLowerCase().includes(userId.toLowerCase());
      }

      return true;
    }) || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Orders Management
        </h1>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as Order["status"] | "ALL")
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* User Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by User Type
            </label>
            <select
              value={userType}
              onChange={(e) =>
                setUserType(e.target.value as "ALL" | "BUYER" | "SELLER")
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="ALL">All Users</option>
              <option value="BUYER">Buyer</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Payment Status
            </label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) =>
                setSelectedPaymentStatus(
                  e.target.value as Order["paymentStatus"] | "ALL"
                )
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* User ID Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search {userType === "ALL" ? "User" : userType} Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={`Enter ${
                  userType === "ALL" ? "user" : userType.toLowerCase()
                } name`}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
              {userId && (
                <button
                  onClick={() => setUserId("")}
                  className="mt-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Refund
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                        {order.paymentScreenshotUrl && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">
                              Payment Screenshot:
                            </p>
                            <img
                              src={order.paymentScreenshotUrl}
                              alt="Payment Screenshot"
                              className="w-16 h-16 object-cover rounded-md cursor-pointer"
                              onClick={() =>
                                window.open(
                                  order.paymentScreenshotUrl,
                                  "_blank"
                                )
                              }
                            />
                          </div>
                        )}
                        {order.sellerPackageImageUrl && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">
                              Seller Package:
                            </p>
                            <img
                              src={order.sellerPackageImageUrl}
                              alt="Seller Package"
                              className="w-16 h-16 object-cover rounded-md cursor-pointer"
                              onClick={() =>
                                window.open(
                                  order.sellerPackageImageUrl,
                                  "_blank"
                                )
                              }
                            />
                          </div>
                        )}
                        {order.buyerPackageImageUrl && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">
                              Buyer Package:
                            </p>
                            <img
                              src={order.buyerPackageImageUrl}
                              alt="Buyer Package"
                              className="w-16 h-16 object-cover rounded-md cursor-pointer"
                              onClick={() =>
                                window.open(
                                  order.buyerPackageImageUrl,
                                  "_blank"
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.buyerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.sellerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.paymentStatus || "UNPAID"}
                        onChange={(e) => {
                          const newStatus = e.target.value as
                            | "UNPAID"
                            | "PENDING"
                            | "PAID"
                            | "REFUNDED";
                          console.log(
                            "Selected new status:",
                            newStatus,
                            "for order:",
                            order.orderId
                          );
                          if (order.orderId) {
                            handlePaymentStatusChange(order.orderId, newStatus);
                          } else {
                            toast.error("Order ID is missing");
                          }
                        }}
                        disabled={updatingPaymentStatus === order.orderId}
                        className={`px-2 py-1 rounded text-sm ${
                          order.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.paymentStatus === "UNPAID"
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        <option value="UNPAID">Unpaid</option>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                      {updatingPaymentStatus === order.orderId && (
                        <span className="ml-2 text-sm text-gray-500">
                          Updating...
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.orderId,
                            e.target.value as Order["status"]
                          )
                        }
                        disabled={updatingStatus === order.orderId}
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                          updatingStatus === order.orderId
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Payment Refund column */}
                      {order.status === "DELIVERED" ? (
                        <RefundImageUploadCell order={order} />
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteOrder(order.orderId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                      {order.sellerId && (
                        <button
                          className="ml-4 px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
                          onClick={() => setChatOrder(order)}
                        >
                          Chat with Seller
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-8 bg-white w-full max-w-4xl mx-auto rounded-lg shadow-lg">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900">
                Order Details (ID: {selectedOrder.orderId})
              </h3>
              <button
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                onClick={closeOrderDetailsModal}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-8">
              {/* Left Column - Order Information */}
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Order ID:</strong> {selectedOrder.orderId}
                </p>
                <p>
                  <strong>Buyer:</strong> {selectedOrder.buyerName}
                </p>
                <p>
                  <strong>Seller:</strong> {selectedOrder.sellerName}
                </p>
                <p>
                  <strong>Shipping Address:</strong>{" "}
                  {selectedOrder.shippingAddress}
                </p>
                <p>
                  <strong>Status:</strong> {selectedOrder.status}
                </p>
                <p className="text-gray-700">
                  <strong>Payment Status:</strong> {selectedOrder.paymentStatus}
                </p>
                <p>
                  <strong>Total Amount:</strong>{" "}
                  {selectedOrder.totalAmount?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
                {selectedOrder.deliveryTrackingNumber && (
                  <p>
                    <strong>Tracking Number:</strong>{" "}
                    {selectedOrder.deliveryTrackingNumber}
                  </p>
                )}
              </div>

              {/* Right Column - Images */}
              <div className="space-y-4">
                {selectedOrder.paymentScreenshotUrl && (
                  <div>
                    <p className="font-semibold mb-2">Payment Screenshot:</p>
                    <div className="flex justify-center">
                      <img
                        src={selectedOrder.paymentScreenshotUrl}
                        alt="Payment Screenshot"
                        className="max-w-[200px] h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() =>
                          window.open(
                            selectedOrder.paymentScreenshotUrl,
                            "_blank"
                          )
                        }
                      />
                    </div>
                  </div>
                )}
                {selectedOrder.sellerPackageImageUrl && (
                  <div>
                    <p className="font-semibold mb-2">Seller Package Image:</p>
                    <div className="flex justify-center">
                      <img
                        src={selectedOrder.sellerPackageImageUrl}
                        alt="Seller Package"
                        className="max-w-[200px] h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() =>
                          window.open(
                            selectedOrder.sellerPackageImageUrl,
                            "_blank"
                          )
                        }
                      />
                    </div>
                  </div>
                )}
                {selectedOrder.buyerPackageImageUrl && (
                  <div>
                    <p className="font-semibold mb-2">Buyer Package Image:</p>
                    <div className="flex justify-center">
                      <img
                        src={selectedOrder.buyerPackageImageUrl}
                        alt="Buyer Package"
                        className="max-w-[200px] h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() =>
                          window.open(
                            selectedOrder.buyerPackageImageUrl,
                            "_blank"
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat with Seller Popup */}
      {chatOrder && chatOrder.sellerId && (
        <MessagePopup
          open={!!chatOrder}
          onClose={() => setChatOrder(null)}
          senderId={"0e274421-7d98-4864-97e7-20dc05852138"}
          receiverId={chatOrder.sellerId}
        />
      )}
    </div>
  );
};

export default OrdersManagement;
