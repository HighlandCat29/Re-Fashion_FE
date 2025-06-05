import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

export interface Wishlist {
  userId: string;
  productId: string;
}

export interface WishlistResponse {
  code: number;
  message: string | null;
  result: Wishlist[];
}

// Get all wishlists for a user
export const getUserWishlists = async (
  userId: string
): Promise<WishlistResponse | null> => {
  try {
    const response = await customFetch.get(`/wishlists/user/${userId}`);
    return response.data;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to fetch wishlists: " + errorMessage);
    return null;
  }
};

// Add product to wishlist
export const addToWishlist = async (
  wishlist: Wishlist
): Promise<Wishlist | null> => {
  try {
    const response = await customFetch.post("/wishlists", wishlist);
    toast.success("Product added to wishlist!");
    return response.data;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to add product to wishlist: " + errorMessage);
    return null;
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    await customFetch.delete(`/wishlists/${userId}/${productId}`);
    toast.success("Product removed from wishlist!");
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to remove product from wishlist: " + errorMessage);
    throw error; // Re-throw error as this function has a void return type
  }
};
