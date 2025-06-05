import axios from "axios";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

// Interfaces
export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  buyerId: string;
  sellerId: string;
  shippingAddress: string;
  items: OrderItem[];
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  shippingAddress: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrderResponse {
  data: Order;
  message: string;
  status: number;
}

// API Functions
const API_URL =
  "https://refashion-fqe8c7bfcgg5h0e7.southeastasia-01.azurewebsites.net/api";

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.warn("No auth token found in localStorage");
    return "";
  }
  return `Bearer ${token}`;
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const createOrder = async (
  orderData: CreateOrderRequest
): Promise<Order | null> => {
  try {
    // Validate required fields
    if (
      !orderData.buyerId ||
      !orderData.sellerId ||
      !orderData.shippingAddress ||
      !orderData.items
    ) {
      toast.error("Please provide all required order information");
      return null;
    }

    // Validate items
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      toast.error("Order must contain at least one item");
      return null;
    }

    // Validate each item
    for (const item of orderData.items) {
      if (
        !item.productId ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        toast.error("Each item must have a valid product ID and quantity");
        return null;
      }
    }

    const response = await axiosInstance.post<OrderResponse>(
      "/orders",
      orderData
    );
    toast.success("Order created successfully!");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to create order");
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getOrders = async (userId: string): Promise<Order[] | null> => {
  try {
    const response = await axiosInstance.get<{ data: Order[] }>(
      `/orders/history/${userId}`
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const response = await axiosInstance.get<OrderResponse>(
      `/orders/${orderId}`
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to fetch order details"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"]
): Promise<Order | null> => {
  try {
    const response = await axiosInstance.patch<OrderResponse>(
      `/orders/${orderId}/status`,
      {
        status,
      }
    );
    toast.success("Order status updated successfully!");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/orders/${orderId}`);
    toast.success("Order deleted successfully!");
    return true;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to delete order");
    } else {
      toast.error("An unexpected error occurred");
    }
    return false;
  }
};

// Admin functions
export const getAllOrders = async (): Promise<Order[] | null> => {
  try {
    const response = await axiosInstance.get<{ data: Order[] }>("/orders");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getOrdersByStatus = async (
  status: Order["status"]
): Promise<Order[] | null> => {
  try {
    const response = await axiosInstance.get<{ data: Order[] }>(
      `/orders/status/${status}`
    );
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};
