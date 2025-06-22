import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrdersByBuyerID, Order, OrderItem } from "../../api/Orders";
import { toast } from "react-hot-toast";
import { useAppSelector } from "../../hooks";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../../config/cloudinary";
import { deliveryConfirm } from "../../api/Orders";
import { HiArrowLeft } from "react-icons/hi2";

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

const BuyerOrderStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [receiveImage, setReceiveImage] = React.useState<string>("");
  const [uploading, setUploading] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

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
        const orders = await getOrdersByBuyerID(loggedInUser.id);
        const currentOrder = orders?.find((o) => o.orderId === orderId);
        if (currentOrder) {
          setOrder(currentOrder);
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

  const handleReceiveImageChange = async (
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
      setReceiveImage(data.secure_url);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Failed to upload image");
      setReceiveImage("");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!orderId || !loggedInUser?.id || !receiveImage) {
      toast.error("Missing information for delivery confirmation");
      return;
    }
    setConfirming(true);
    try {
      await deliveryConfirm(orderId, [receiveImage], loggedInUser.id);
      toast.success("Delivery confirmed!");
      setOrder((prev) => (prev ? { ...prev, status: "DELIVERED" } : prev));
      // Optionally, you could refetch the order from the server here for accuracy
    } catch {
      toast.error("Failed to confirm delivery");
    } finally {
      setConfirming(false);
    }
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
      <h2 className="text-2xl font-bold mb-8">Order Status</h2>

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
            This order has been cancelled
          </p>
        )}

        {/* Shipped Package Image under Order Progress */}
        {order.status === "SHIPPED" && order.sellerPackageImageUrl && (
          <div className="mt-8 flex flex-col items-center">
            <p className="text-gray-600 mb-2 font-semibold">
              Shipped Package Image:
            </p>
            <img
              src={order.sellerPackageImageUrl}
              alt="Shipped Package"
              className="w-40 h-40 object-cover rounded-md shadow"
            />
          </div>
        )}

        {/* Package Receive Section for buyer confirmation */}
        {order.status === "SHIPPED" && (
          <div className="my-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold mb-4 text-green-700">
              Package Receive
            </h3>
            <p className="mb-2 text-gray-700">
              Upload a photo to confirm you have received the order:
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleReceiveImageChange}
              disabled={uploading || confirming}
            />
            {receiveImage && (
              <div className="mt-4">
                <img
                  src={receiveImage}
                  alt="Receive Preview"
                  className="w-40 h-40 object-cover rounded shadow"
                />
              </div>
            )}
            <button
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              onClick={handleConfirmDelivery}
              disabled={!receiveImage || uploading || confirming}
            >
              {confirming ? "Confirming..." : "Confirm Delivery"}
            </button>
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
                "Your order has been placed and is waiting to be processed."}
              {order.status === "PROCESSING" &&
                "Your order is being prepared and processed by the seller."}
              {order.status === "SHIPPED" &&
                "Your order has been shipped and is on its way to you."}
              {order.status === "DELIVERED" &&
                "Your order has been successfully delivered."}
              {order.status === "CANCELLED" &&
                "This order has been cancelled and will not be processed."}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Next Steps</h4>
            <p className="text-sm text-gray-600">
              {order.status === "PENDING" &&
                "The seller will start processing your order soon."}
              {order.status === "PROCESSING" &&
                "Your order will be shipped once processing is complete."}
              {order.status === "SHIPPED" &&
                "Track your order and prepare for delivery."}
              {order.status === "DELIVERED" &&
                "Enjoy your purchase! Thank you for shopping with us."}
              {order.status === "CANCELLED" &&
                "If you wish to purchase these items, please place a new order."}
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
              ? "Awaiting Admin Confirmation"
              : order.paymentStatus === "PAID"
              ? "Payment Confirmed"
              : order.paymentStatus === "REFUNDED"
              ? "Refunded"
              : "Unknown Status"}
          </div>
          {order.paymentStatus === "PENDING" && (
            <p className="text-sm text-gray-600">
              Your payment has been submitted and is waiting for admin
              confirmation
            </p>
          )}
          {order.paymentStatus === "UNPAID" && (
            <p className="text-sm text-gray-600">
              Please complete your payment to proceed with the order
            </p>
          )}
          {order.paymentStatus === "PAID" && (
            <p className="text-sm text-gray-600">
              Your payment has been confirmed by admin
            </p>
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span>{order.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seller:</span>
              <span>{order.sellerName}</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2">
              <span>Total:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: OrderItem, index: number) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleProductClick(item.productId)}
                >
                  <td className="py-2 flex items-center">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded mr-4"
                    />
                    <span>{item.productName}</span>
                  </td>
                  <td className="text-right py-2">{formatPrice(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-gray-600">Shipping Address</p>
            <p className="font-medium">{order.shippingAddress}</p>
          </div>
        </div>
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
      </div>
    </div>
  );
};

export default BuyerOrderStatus;
