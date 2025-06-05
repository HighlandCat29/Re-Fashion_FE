import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  removeProductFromTheCart,
  ProductInCart,
} from "../features/cart/cartSlice";
import { toast } from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { productsInCart, subtotal } = useAppSelector((state) => state.cart);

  const handleRemoveItem = (id: string) => {
    dispatch(removeProductFromTheCart({ id }));
    toast.success("Item removed from cart");
  };

  const handleCheckout = () => {
    if (productsInCart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  if (productsInCart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Your Cart</h2>
          <p className="mt-2 text-gray-600">Your cart is empty</p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">Your Cart</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {productsInCart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
              >
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {item.brand} • {item.size} • {item.color}
                  </p>
                  <p className="text-sm text-gray-500">
                    Condition:{" "}
                    {item.productCondition.toLowerCase().replace("_", " ")}
                  </p>
                  <p className="mt-1 text-gray-900">
                    {item.price.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium text-gray-900">
                  <span>Total</span>
                  <span>{subtotal.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => navigate("/shop")}
                className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
