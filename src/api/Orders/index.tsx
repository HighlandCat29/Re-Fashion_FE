import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import customFetch from "../../axios/custom";
import { AxiosError } from "axios";

interface Order {
  orderId: string;
  buyerId: string;
  sellerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await customFetch.get("/orders/history");
      setOrders(response.data.result || []);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(
          "Failed to fetch orders: " +
            (error.response?.data?.message || error.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await customFetch.delete(`/orders/${orderId}`);
      toast.success("Order deleted successfully!");
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(
          "Failed to delete order: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Order ID</th>
              <th className="px-4 py-2 border">Buyer</th>
              <th className="px-4 py-2 border">Seller</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Created</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} className="text-center">
                <td className="px-4 py-2 border">{order.orderId}</td>
                <td className="px-4 py-2 border">{order.buyerId}</td>
                <td className="px-4 py-2 border">{order.sellerId}</td>
                <td className="px-4 py-2 border">{order.status}</td>
                <td className="px-4 py-2 border">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteOrder(order.orderId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersPage;
