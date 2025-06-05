import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

// Product interface matching your provided schema
export interface Product {
  id?: string;
  title: string;
  description: string;
  brand: string;
  productCondition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR" | string;
  size: string;
  color: string;
  price: number;
  categoryId: string;
  sellerId: string;
  isFeatured: boolean;
  featuredUntil: string | null; // Allow null for non-featured products
  imageUrls: string[];
  createdAt?: string;
  isActive: boolean;
  categoryName: string;
  sellerUsername: string;
}

// API response format
export interface ProductResponse {
  code: number;
  message: string | null;
  result: Product;
}

// Get all products
export const getProducts = async (): Promise<Product[] | null> => {
  try {
    const response = await customFetch.get("/products");
    return response.data.result;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    toast.error("Failed to fetch products: " + errorMessage);
    return null;
  }
};

// Get a product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await customFetch.get(`/products/${id}`);
    return response.data.result;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    toast.error("Failed to fetch product: " + errorMessage);
    return null;
  }
};

// Add a product
export const addProduct = async (
  product: Omit<Product, "id" | "createdAt" | "categoryName" | "sellerUsername">
): Promise<void> => {
  try {
    // Format the data to match server expectations
    const formattedProduct = {
      title: product.title.trim(),
      description: product.description.trim(),
      brand: product.brand.trim(),
      productCondition: product.productCondition.toUpperCase(),
      size: product.size.trim(),
      color: product.color.trim(),
      price: Number(product.price),
      categoryId: product.categoryId,
      sellerId: product.sellerId,
      isFeatured: Boolean(product.isFeatured),
      featuredUntil:
        product.isFeatured && product.featuredUntil
          ? new Date(product.featuredUntil).toISOString()
          : null,
      imageUrls: Array.isArray(product.imageUrls) ? product.imageUrls : [],
      isActive: Boolean(product.isActive),
    };

    console.log("Sending formatted product:", formattedProduct);

    // Send the request with JSON data
    const response = await customFetch.post("/products", formattedProduct, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data) {
      console.log("Server response:", response.data);
    }

    if (
      response.status === 200 ||
      response.status === 1000 ||
      response.status === 1073741824
    ) {
      toast.success("Product added successfully!");
    } else {
      console.error("Unexpected response:", response);
      toast.error("Unexpected response when adding product.");
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error response:", error.response?.data);
      console.error("Error config:", error.config);
      console.error("Request data:", error.config?.data);
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
  product: Partial<Omit<Product, "id" | "createdAt">>
): Promise<void> => {
  try {
    // Format the data to match server expectations
    const formattedProduct = {
      title: product.title?.trim(),
      description: product.description?.trim(),
      brand: product.brand?.trim(),
      productCondition: product.productCondition?.toUpperCase(),
      size: product.size?.trim(),
      color: product.color?.trim(),
      price: Number(product.price),
      categoryId: product.categoryId,
      sellerId: product.sellerId,
      isFeatured: Boolean(product.isFeatured),
      featuredUntil:
        product.isFeatured && product.featuredUntil
          ? new Date(product.featuredUntil).toISOString()
          : null,
      imageUrls: Array.isArray(product.imageUrls) ? product.imageUrls : [],
      isActive: Boolean(product.isActive),
    };

    console.log("=== Update Product Request ===");
    console.log("Product ID:", id);
    console.log("Original product data:", product);
    console.log("Formatted product data:", formattedProduct);
    console.log("Request URL:", `/products/${id}`);
    console.log("Request Method: PUT");

    // Validate required fields
    if (
      !formattedProduct.title ||
      !formattedProduct.categoryId ||
      !formattedProduct.sellerId
    ) {
      throw new Error("Title, category, and seller are required");
    }

    const response = await customFetch.put(`/products/${id}`, formattedProduct);

    console.log("=== Update Product Response ===");
    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);

    // Check if the response contains the updated product
    if (response.data && response.data.result) {
      const updatedProduct = response.data.result;
      console.log("Updated product:", updatedProduct);

      // Verify the update was successful
      if (updatedProduct.id === id) {
        console.log("Update verified - product ID matches");
        toast.success("Product updated successfully!");
      } else {
        console.error("Update verification failed - product ID mismatch");
        toast.error(
          "Product update may have failed - please verify the changes"
        );
      }
    } else {
      console.error("No product data in response");
      console.error("Response data:", response.data);
      toast.error("Failed to verify product update");
    }
  } catch (error) {
    console.error("=== Update Product Error ===");
    if (error instanceof AxiosError) {
      console.error("Error Type: AxiosError");
      console.error("Error Status:", error.response?.status);
      console.error("Error Headers:", error.response?.headers);
      console.error("Error Data:", error.response?.data);
      console.error("Error Config:", error.config);
      console.error("Request Data:", error.config?.data);
      console.error("Request URL:", error.config?.url);
      console.error("Request Method:", error.config?.method);

      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error Message:", errorMessage);
      toast.error(`Failed to update product: ${errorMessage}`);
    } else {
      console.error("Error Type: Unknown");
      console.error("Error:", error);
      toast.error("Failed to update product: Unknown error occurred");
    }
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response = await customFetch.delete(`/products/${id}`);
    if (
      response.status === 200 ||
      response.status === 1000 ||
      response.status === 1073741824
    ) {
      toast.success("Product deleted successfully!");
    } else {
      toast.error("Unexpected response when deleting product.");
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    toast.error("Failed to delete product: " + errorMessage);
    throw error;
  }
};
