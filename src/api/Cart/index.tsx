import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

// Interfaces
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage: string;
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  items?: CartItem[];
  totalAmount?: number;
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
    const response = await customFetch.get<CartResponse>(
      `/carts/user/${userId}`
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to fetch cart by user ID"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<Cart | null> => {
  try {
    const response = await customFetch.post<CartResponse>(`/carts/add`, {
      userId,
      productId,
      quantity,
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
      `/carts/removeItem`,
      {
        data: { userId, productId }, // Axios requires data for DELETE in 'data' field
      }
    );
    toast.success("Item removed from cart successfully!");
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to remove item from cart"
      );
    } else {
      toast.error("An unexpected error occurred");
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
