import React, { useState, useEffect } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  Order,
  deleteOrder,
} from "../../../api/Orders";
import { toast } from "react-hot-toast";
import { getUserById } from "../../../api/Users";
import { getProductById } from "../../../api/Products/index";

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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteOrder(order.orderId)}
                        className="text-red-600 hover:text-red-900"
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
    </div>
  );
};

export default OrdersManagement;
