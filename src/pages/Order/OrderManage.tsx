import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import { getMyFeaturedPayments } from "../../api/Feature";
import {
  getProductsBySellerId,
  getProductById,
  Product,
} from "../../api/Products/adminIndex";
import { formatPrice } from "../../utils/formatPrice";
import { toast } from "react-hot-toast";
import {
  getOrdersBySellerId,
  getOrdersByBuyerID,
  Order,
} from "../../api/Orders/index";

const TABS = [
  { key: "featured", label: "Current Feature's Product" },
  { key: "selling", label: "Current's Selling Products" },
  { key: "sellingOrders", label: "Current Selling Orders" },
  { key: "buyingOrders", label: "Current Buying Orders" },
];

const OrderManage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("featured");
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [sellingProducts, setSellingProducts] = useState<Product[]>([]);
  const [sellingOrders, setSellingOrders] = useState<Order[]>([]);
  const [buyingOrders, setBuyingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      toast.error("Please log in to access management page");
      navigate("/login");
      return;
    }
    setLoading(true);
    const fetchAll = async () => {
      try {
        // Featured Products
        const payments = await getMyFeaturedPayments(user.id);
        if (payments && payments.length > 0) {
          const productPromises = payments.map((p) =>
            getProductById(p.productId)
          );
          const products = await Promise.all(productPromises);
          setFeaturedProducts(products.filter((p): p is Product => !!p));
        } else {
          setFeaturedProducts([]);
        }
        // Selling Products
        const userProducts = await getProductsBySellerId(user.id);
        setSellingProducts(userProducts || []);
        // Orders
        const sellerOrders = await getOrdersBySellerId(user.id);
        setSellingOrders(sellerOrders || []);
        const buyerOrders = await getOrdersByBuyerID(user.id);
        setBuyingOrders(buyerOrders || []);
      } catch (err) {
        toast.error("Failed to load management data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Manage Selling/Buying Product
        </h1>
        <button
          className="px-6 py-2 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition"
          onClick={() => navigate("/sell-product-list")}
        >
          Sell Product
        </button>
      </div>
      <div className="flex gap-4 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-md font-medium border transition-colors duration-200 ${
              activeTab === tab.key
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === "featured" && (
        <section>
          <p className="text-gray-500 text-sm mb-4">
            This section shows your currently featured products that are
            highlighted on the platform.
          </p>
          {featuredProducts.length === 0 ? (
            <p className="text-gray-500">No featured products yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-black rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <img
                    src={product.imageUrls[0] || "/placeholder-image.jpg"}
                    alt={product.title}
                    className="object-cover rounded-lg w-full h-48 mb-3"
                  />
                  <h4 className="font-medium text-lg mb-2">{product.title}</h4>
                  <p className="text-gray-600 mb-2">{product.brand}</p>
                  <p className="text-primary font-semibold mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="text-black hover:bg-black hover:text-white text-sm font-medium px-3 py-1 rounded transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      {activeTab === "selling" && (
        <section>
          <p className="text-gray-500 text-sm mb-4">
            This section lists all products you are currently selling.
          </p>
          {sellingProducts.length === 0 ? (
            <p className="text-gray-500">No products listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellingProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-black rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <img
                    src={product.imageUrls[0] || "/placeholder-image.jpg"}
                    alt={product.title}
                    className="object-cover rounded-lg w-full h-48 mb-3"
                  />
                  <h4 className="font-medium text-lg mb-2">{product.title}</h4>
                  <p className="text-gray-600 mb-2">{product.brand}</p>
                  <p className="text-primary font-semibold mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="text-black hover:bg-black hover:text-white text-sm font-medium px-3 py-1 rounded transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      {activeTab === "sellingOrders" && (
        <section>
          <p className="text-gray-500 text-sm mb-4">
            These are orders from buyers for your products. Track and manage
            your sales here.
          </p>
          {sellingOrders.length === 0 ? (
            <p className="text-gray-500">No current selling orders.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellingOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="border border-black rounded-lg p-4 hover:shadow-md transition-shadow"
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
                    Order Date: {order.createdAt}
                  </p>
                  <p className="text-gray-600 mb-2">
                    Shipping Address: {order.shippingAddress}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">
                        Order Status:
                      </span>
                      <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 mb-1">
                        Payment Status:
                      </span>
                      <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                        {order.paymentStatus || "N/A"}
                      </span>
                    </div>
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
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        navigate(`/seller-order/${order.orderId}/status`)
                      }
                      className="text-black hover:bg-black hover:text-white text-sm font-medium px-3 py-1 rounded transition-colors"
                    >
                      View Order Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      {activeTab === "buyingOrders" && (
        <section>
          <p className="text-gray-500 text-sm mb-4">
            These are orders you have placed to purchase products from other
            sellers.
          </p>
          {buyingOrders.length === 0 ? (
            <p className="text-gray-500">No current buying orders.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buyingOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="border border-black rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-lg mb-2">
                    Order ID: {order.orderId}
                  </h4>
                  <p className="text-gray-600 mb-2">
                    Seller: {order.sellerName}
                  </p>
                  <p className="text-primary font-semibold mb-2">
                    Total: {formatPrice(order.totalAmount)}
                  </p>
                  <p className="text-gray-600 mb-2">
                    Order Date: {order.createdAt}
                  </p>
                  <p className="text-gray-600 mb-2">
                    Shipping Address: {order.shippingAddress}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">
                        Order Status:
                      </span>
                      <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 mb-1">
                        Payment Status:
                      </span>
                      <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                        {order.paymentStatus || "N/A"}
                      </span>
                    </div>
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
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        navigate(`/buyer-order/${order.orderId}/status`)
                      }
                      className="text-black hover:bg-black hover:text-white text-sm font-medium px-3 py-1 rounded transition-colors"
                    >
                      View Order Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default OrderManage;
