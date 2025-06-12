import { Link, useLocation } from "react-router-dom";
import { OrderItem } from "../../api/Orders";
import purchaseGif from "../../assets/purchase.gif";

const OrderConfirmation = () => {
  const location = useLocation();
  // Order info should be passed via navigation state from checkout
  const order = location.state?.order;

  return (
    <div className="max-w-screen-2xl mx-auto pt-20 px-4">
      <h1 className="text-5xl font-light text-center mb-8">
        Order Confirmation
      </h1>
      {order ? (
        <div className="mt-8 max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-center text-green-700">
            Thank you for your purchase!
          </h2>
          <img
            src={purchaseGif}
            alt="Purchase Confirmed"
            className="mx-auto mb-6 w-48 h-48 object-contain"
          />
          <p className="text-center text-gray-700 mb-6">
            Your order has been confirmed and will be shipped shortly.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Order ID:</span>
              <span>{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Order Date:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total:</span>
              <span>
                {order.totalAmount?.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Buyer:</span>
              <span>{order.buyerName || order.buyerId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Seller:</span>
              <span>{order.sellerName || order.sellerId || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Shipping Address:</span>
              <span>{order.shippingAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Payment Status:</span>
              <span>{order.paymentStatus || "Pending"}</span>
            </div>
            <div className="mt-6">
              <span className="font-medium">Items:</span>
              <ul className="list-disc ml-6 mt-2">
                {(order.items as OrderItem[])?.map((item, idx) => (
                  <li key={idx} className="mb-4">
                    <div className="flex items-center">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded mr-4"
                      />
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          Price:{" "}
                          {item.price?.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}{" "}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center mt-5 text-lg">
          Your order has been confirmed and will be shipped shortly.
        </p>
      )}
      <div className="flex justify-center space-x-4 mt-8">
        <Link
          to="/shop"
          className="text-white bg-black text-center text-xl font-normal tracking-[0.6px] w-[200px] h-12 flex items-center justify-center max-md:text-base rounded-lg shadow hover:bg-gray-800 transition-colors"
        >
          Continue shopping
        </Link>
        <Link
          to="/order-history"
          className="text-white bg-black text-center text-xl font-normal tracking-[0.6px] w-[200px] h-12 flex items-center justify-center max-md:text-base rounded-lg shadow hover:bg-gray-800 transition-colors"
        >
          See order history
        </Link>
      </div>
    </div>
  );
};
export default OrderConfirmation;
