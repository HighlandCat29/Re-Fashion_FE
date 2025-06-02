import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import customFetch from "../../../axios/custom";

interface Order {
  orderId: string;
  buyerId: string;
  sellerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await customFetch.get("/orders/history");
      setOrders(response.data.result || []);
    } catch (error: any) {
      toast.error(
        "Failed to fetch orders: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await customFetch.delete(`/orders/${orderId}`);
        toast.success("Order deleted successfully!");
        fetchOrders();
      } catch (error: any) {
        toast.error(
          "Failed to delete order: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Orders Management
          </h1>
          <button
            onClick={() => navigate("/admin/orders/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            + Add Order
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.buyerId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.sellerId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                      {order.status}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => openModal(order)}
                        className="text-green-600 hover:underline font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.orderId)}
                        className="text-red-600 hover:underline font-medium"
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

      {showModal && selectedOrder && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 transition-all duration-300 transform scale-100 opacity-100">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <div className="space-y-2">
              {Object.entries(selectedOrder).map(([key, value]) => (
                <div key={key}>
                  <span className="font-semibold capitalize">{key}:</span>{" "}
                  {String(value)}
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
