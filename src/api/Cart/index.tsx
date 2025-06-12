import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

// Interfaces
export interface CartItem {
  productId: string;
  title: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export interface CartResponse {
  code: number;
  message: string | null;
  result: Cart;
}

export interface CartsResponse {
  code: number;
  message: string | null;
  result: Cart[];
}

// API Functions

export const getCart = async (cartId: string): Promise<Cart | null> => {
  try {
    const response = await customFetch.get<CartResponse>(`/carts/${cartId}`);
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to fetch cart");
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getCartByUserId = async (userId: string): Promise<Cart | null> => {
  try {
    const response = await customFetch.get<CartResponse>(`/carts/${userId}`);
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error fetching cart by user ID:",
        error.response?.data?.message || "Unknown error"
      );
    }
    return null;
  }
};

export const addToCart = async (
  userId: string,
  productId: string
): Promise<Cart | null> => {
  try {
    const response = await customFetch.post<CartResponse>(`/carts/add`, {
      userId,
      productId,
    });
    toast.success("Item added to cart successfully!");
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to add item to cart"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  newQuantity: number
): Promise<Cart | null> => {
  try {
    const response = await customFetch.patch<CartResponse>(
      `/carts/updateQuantity`,
      {
        userId,
        productId,
        newQuantity,
      }
    );
    toast.success("Cart item quantity updated successfully!");
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to update cart item quantity"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const removeCartItem = async (
  userId: string,
  productId: string
): Promise<Cart | null> => {
  try {
    const response = await customFetch.delete<CartResponse>(
      `/carts/${userId}/remove/${productId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (response.data.code === 200) {
      toast.success("Item removed from cart successfully!");
      return response.data.result;
    } else {
      toast.success(response.data.message || "Remove Cart Success!");
      return null;
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Cart removal error:", error.response?.data);
    } else {
      toast.error("An unexpected error occurred");
      console.error("Unexpected error:", error);
    }
    return null;
  }
};

export const clearCart = async (userId: string): Promise<boolean> => {
  try {
    await customFetch.delete(`/carts/clear/${userId}`);
    toast.success("Cart cleared successfully!");
    return true;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to clear cart");
    } else {
      toast.error("An unexpected error occurred");
    }
    return false;
  }
};
