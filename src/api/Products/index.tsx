import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

// Product interface matching your provided schema
export interface Product {
  id?: string;
  title: string;
  description: string;
  brand: string;
  productCondition: "NEW" | "USED" | string;
  size: string;
  color: string;
  price: number;
  imageFile: string;
  categoryId: string;
  sellerId: string;
  isFeatured: boolean;
  featuredUntil: string; // ISO date string
  isActive: boolean;
}

// API response format for a single product
export interface ProductResponse {
  code: number;
  message: string;
  result: {
    id: string;
    title: string;
    description: string;
    brand: string;
    productCondition: string;
    size: string;
    color: string;
    price: number;
    imageUrl: string;
    categoryName: string;
    sellerUsername: string;
    isFeatured: boolean;
    featuredUntil: string;
    imageFile: string;
    createdAt: string;
    isActive: boolean;
  };
}

// Get all products
export const getProducts = async (): Promise<
  ProductResponse["result"][] | null
> => {
  try {
    const response = await customFetch.get("/products");
    return response.data.result;
  } catch (error: any) {
    toast.error(
      "Failed to fetch products: " +
        (error.response?.data?.message || error.message)
    );
    return null;
  }
};

// Get a product by ID
export const getProductById = async (
  id: string
): Promise<ProductResponse["result"] | null> => {
  try {
    const response = await customFetch.get(`/products/${id}`);
    return response.data.result;
  } catch (error: any) {
    toast.error(
      "Failed to fetch product: " +
        (error.response?.data?.message || error.message)
    );
    return null;
  }
};

// Add a product
export const addProduct = async (
  product: Omit<Product, "id">
): Promise<void> => {
  try {
    const formData = new FormData();

    // Log the incoming product data
    console.log("Product data being sent:", product);

    // Add all product fields to FormData
    Object.entries(product).forEach(([key, value]) => {
      if (key === "imageFile") {
        // Handle image file - it should be a string URL from Cloudinary
        formData.append(key, String(value));
      } else {
        // Convert all other values to strings
        formData.append(key, String(value));
      }
    });

    // Log the FormData contents
    console.log("FormData contents:");
    for (const pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    const response = await customFetch.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200 || response.status === 201) {
      toast.success("Product added successfully!");
    } else {
      console.error("Unexpected response:", response);
      toast.error("Unexpected response when adding product.");
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error response:", error.response?.data);
      console.error("Error config:", error.config);
      toast.error(
        "Failed to add product: " +
          (error.response?.data?.message || error.message)
      );
    } else {
      console.error("Unknown error:", error);
      toast.error("Failed to add product: Unknown error occurred");
    }
    throw error;
  }
};

// Update a product
export const updateProduct = async (
  id: string,
  product: Product
): Promise<void> => {
  try {
    const response = await customFetch.put(`/products/${id}`, product);
    if (response.status === 200 || response.status === 1000) {
      toast.success("Product updated successfully!");
    } else {
      toast.error("Unexpected response when updating product.");
    }
  } catch (error: any) {
    toast.error(
      "Failed to update product: " +
        (error.response?.data?.message || error.message)
    );
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response = await customFetch.delete(`/products/${id}`);
    if (response.status === 200 || response.status === 1000) {
      toast.success("Product deleted successfully!");
    } else {
      toast.error("Unexpected response when deleting product.");
    }
  } catch (error: any) {
    toast.error(
      "Failed to delete product: " +
        (error.response?.data?.message || error.message)
    );
    throw error;
  }
};
