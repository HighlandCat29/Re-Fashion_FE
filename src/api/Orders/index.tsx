import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

// Interfaces
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage: string;
}

export interface CreateOrderRequest {
  buyerId: string;
  sellerId: string;
  shippingAddress: string;
  items: OrderItem[];
  note?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  shippingAddress: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus?: "PAID" | "PENDING" | "REFUNDED";
  deliveryTrackingNumber?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
  note?: string;
  buyerName?: string;
  sellerName?: string;
}

export interface OrderResponse {
  code: number;
  message: string | null;
  result: Order;
}

export interface OrdersResponse {
  code: number;
  message: string | null;
  result: Order[];
}

// API Functions
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

    const response = await customFetch.post<OrderResponse>(
      "/orders",
      orderData
    );
    toast.success("Order created successfully!");
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to create order");
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getOrdersByBuyerID = async (
  userId: string
): Promise<Order[] | null> => {
  try {
    console.log(userId);

    const response = await customFetch.get<OrdersResponse>(
      `/orders/buyer/${userId}`
    );
    return response.data.result;
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
    const response = await customFetch.get<OrderResponse>(`/orders/${orderId}`);
    return response.data.result;
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

export const getOrderStatus = async (
  orderId: string
): Promise<Order["status"] | null> => {
  try {
    const response = await customFetch.get<OrderResponse>(
      `/orders/${orderId}/status`
    );
    return response.data.result.status;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to fetch order status"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
  note?: string
): Promise<Order | null> => {
  try {
    const response = await customFetch.patch<OrderResponse>(
      `/orders/${orderId}/status`,
      {
        status,
        note,
      }
    );
    toast.success("Order status updated successfully!");
    return response.data.result;
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
    await customFetch.delete(`/orders/${orderId}`);
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
    const response = await customFetch.get<OrdersResponse>("/orders");
    console.log("API Response:", response.data); // Debug log
    if (
      response.data &&
      response.data.result &&
      Array.isArray(response.data.result)
    ) {
      return response.data.result;
    }
    console.error("Invalid API response structure:", response.data);
    return null;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("API Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } else {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getOrdersByStatus = async (
  status: Order["status"]
): Promise<Order[] | null> => {
  try {
    const response = await customFetch.get<OrdersResponse>(
      `/orders/status/${status}`
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getOrdersBySellerId = async (
  sellerId: string
): Promise<Order[] | null> => {
  try {
    const response = await customFetch.get<OrdersResponse>(
      `/orders/seller/${sellerId}`
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to fetch orders by seller ID"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};
