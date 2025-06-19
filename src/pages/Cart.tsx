import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { toast } from "react-hot-toast";
import { getCartByUserId, removeCartItem, Cart as CartType } from "../api/Cart";
import { getProductById } from "../api/Products";
import { formatPrice } from "../utils/formatPrice";
import emptyCartGif from "../assets/cart.gif";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerNames, setSellerNames] = useState<{
    [productId: string]: string;
  }>({});

  useEffect(() => {
    const fetchUserCart = async () => {
      if (!user?.id) {
        setLoading(false);
        setCart(null); // Clear cart if no user
        return;
      }
      setLoading(true);
      try {
        const userCart = await getCartByUserId(user.id);
        setCart(userCart);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCart(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCart();
  }, [user?.id]);

  // Fetch seller names for each product in the cart
  useEffect(() => {
    const fetchSellerNames = async () => {
      if (!cart || !cart.items) return;
      const newSellerNames: { [productId: string]: string } = {};
      await Promise.all(
        cart.items.map(async (item) => {
          if (!sellerNames[item.productId]) {
            const product = await getProductById(item.productId);
            if (product && product.sellerUsername) {
              newSellerNames[item.productId] = product.sellerUsername;
            }
          } else {
            newSellerNames[item.productId] = sellerNames[item.productId];
          }
        })
      );
      setSellerNames((prev) => ({ ...prev, ...newSellerNames }));
    };
    fetchSellerNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const handleRemoveItem = async (productId: string) => {
    if (!user?.id) {
      toast.error("Please log in to manage your cart.");
      return;
    }

    try {
      const updatedCart = await removeCartItem(user.id, productId);
      if (updatedCart) {
        setCart(updatedCart);
      } else {
        // If removal failed but we got a response, refresh the cart
        const refreshedCart = await getCartByUserId(user.id);
        if (refreshedCart) {
          setCart(refreshedCart);
        }
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      // Try to refresh the cart on error
      try {
        const refreshedCart = await getCartByUserId(user.id);
        if (refreshedCart) {
          setCart(refreshedCart);
        }
      } catch (refreshError) {
        console.error("Error refreshing cart:", refreshError);
      }
    }
  };

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    // Validation: Only allow checkout if all items are from the same seller
    const uniqueSellers = Array.from(
      new Set(
        cart.items.map((item) => sellerNames[item.productId]).filter(Boolean)
      )
    );
    if (uniqueSellers.length > 1) {
      toast.error(
        "You can only checkout items from one seller at a time. Please remove items from other sellers."
      );
      return;
    }
    // Validation: All products must be active
    const productStatuses = await Promise.all(
      cart.items.map(async (item) => {
        const product = await getProductById(item.productId);
        return product?.isActive !== false;
      })
    );
    if (productStatuses.some((active) => !active)) {
      toast.error(
        "Some products in your cart are no longer available for purchase."
      );
      return;
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Your Cart</h2>
          <p className="mt-2 text-gray-600">Your cart is empty</p>
          <img
            src={emptyCartGif}
            alt="Empty Cart"
            className="mx-auto mt-6 mb-4 w-48 h-48 object-contain"
          />
          <div className="mt-4 space-x-4">
            <button
              onClick={() => navigate("/shop")}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const calculatedTotalAmount = cart.items.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">Your Cart</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={item.productImage}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  {sellerNames[item.productId] && (
                    <p className="text-sm text-gray-500 mb-1">
                      Seller: {sellerNames[item.productId]}
                    </p>
                  )}
                  <p className="mt-1 text-primary font-medium">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.productId)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
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
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(calculatedTotalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(calculatedTotalAmount)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors mb-2"
            >
              Proceed to Checkout
            </button>
            <div className="flex justify-center mt-2">
              <button
                onClick={() => navigate("/shop")}
                className="flex-1 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
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
