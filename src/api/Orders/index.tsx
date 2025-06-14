import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { getProductById } from "../Products/index";
import { getUserById } from "../Users/index";

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
  paymentImageUrls: string[];
}

export interface Order {
  orderId: string;
  buyerId: string;
  sellerId: string;
  shippingAddress: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "REFUNDED";
  deliveryTrackingNumber?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
  note?: string;
  buyerName?: string;
  sellerName?: string;
  productIds?: string[];
  paymentScreenshotUrl?: string;
  sellerPackageImageUrl?: string;
  buyerPackageImageUrl?: string;
}

export interface OrderResponse {
  code: number;
  message: string | null;
  result: Order;
}

export interface OrdersResponse {
  code: number;
  message: string | null;
  result: Order[] | { orders: Order[] };
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
      !orderData.items ||
      !orderData.paymentImageUrls ||
      orderData.paymentImageUrls.length === 0
    ) {
      toast.error("Please provide all required order information");
      return null;
    }

    // Validate items
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      toast.error("Order must contain at least one item");
      return null;
    }

    const response = await customFetch.post<OrderResponse>(
      "/orders",
      orderData
    );
    console.log("orderdata", orderData);
    console.log("API Response:", response.data);

    // Ensure we're returning the complete order data
    const createdOrder = response.data.result;
    console.log("Created Order:", createdOrder);

    // Verify paymentImageUrls is included
    if (createdOrder.paymentScreenshotUrl) {
      console.log("Payment screenshot URL:", createdOrder.paymentScreenshotUrl);
    }

    toast.success("Order created successfully!");
    return createdOrder;
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
    console.log("Fetching orders for buyer ID:", userId);
    const response = await customFetch.get<OrdersResponse>(
      `/orders/buyer/${userId}`
    );
    console.log("API Response for getOrdersByBuyerID:", response.data);
    const ordersData = response.data.result;
    let orders: Order[] = [];

    if (Array.isArray(ordersData)) {
      orders = ordersData;
    } else if (
      ordersData &&
      typeof ordersData === "object" &&
      "orders" in ordersData &&
      Array.isArray(ordersData.orders)
    ) {
      orders = ordersData.orders;
    }

    // Populate items and seller names for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Get seller details
        const seller = order.sellerId
          ? await getUserById(order.sellerId)
          : null;

        // Get product details
        if (order.productIds && order.productIds.length > 0) {
          const items = await Promise.all(
            order.productIds.map(async (productId) => {
              const product = await getProductById(productId);
              if (product) {
                return {
                  productId: product.id,
                  quantity: 1,
                  price: product.price,
                  productName: product.title,
                  productImage: product.imageUrls?.[0] || "",
                };
              }
              return null;
            })
          );
          order.items = items.filter((item) => item !== null) as OrderItem[];
        }

        return {
          ...order,
          sellerName: seller?.fullName || order.sellerId,
        };
      })
    );

    return ordersWithDetails;
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
    const order = response.data.result;

    // Fetch full product details for each productId if productIds exist
    if (order && order.productIds && order.productIds.length > 0) {
      const items = await Promise.all(
        order.productIds.map(async (productId) => {
          const product = await getProductById(productId);
          if (product) {
            return {
              productId: product.id,
              quantity: 1, // Assuming quantity is 1, adjust if your backend provides it
              price: product.price,
              productName: product.title,
              productImage: product.imageUrls?.[0] || "",
            };
          }
          return null; // Handle cases where product might not be found
        })
      );
      order.items = items.filter((item) => item !== null) as OrderItem[];
    }

    return order;
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
      `/orders/${orderId}/status?status=${status}`,
      {
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

    if (Array.isArray(response.data.result)) {
      return response.data.result; // Handle case where result is directly an array
    } else if (
      response.data.result &&
      typeof response.data.result === "object" &&
      "orders" in response.data.result &&
      Array.isArray(response.data.result.orders)
    ) {
      return response.data.result.orders; // Handle case where orders are nested
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
    const ordersData = response.data.result;
    if (Array.isArray(ordersData)) {
      return ordersData;
    } else if (
      ordersData &&
      typeof ordersData === "object" &&
      "orders" in ordersData &&
      Array.isArray(ordersData.orders)
    ) {
      return ordersData.orders;
    }
    return null;
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
    const ordersData = response.data.result;
    let orders: Order[] = [];

    if (Array.isArray(ordersData)) {
      orders = ordersData;
    } else if (
      ordersData &&
      typeof ordersData === "object" &&
      "orders" in ordersData &&
      Array.isArray(ordersData.orders)
    ) {
      orders = ordersData.orders;
    }

    // Populate items and buyer names for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Get buyer details
        const buyer = order.buyerId ? await getUserById(order.buyerId) : null;

        // Get product details
        if (order.productIds && order.productIds.length > 0) {
          const items = await Promise.all(
            order.productIds.map(async (productId) => {
              const product = await getProductById(productId);
              if (product) {
                return {
                  productId: product.id,
                  quantity: 1,
                  price: product.price,
                  productName: product.title,
                  productImage: product.imageUrls?.[0] || "",
                };
              }
              return null;
            })
          );
          order.items = items.filter((item) => item !== null) as OrderItem[];
        }

        return {
          ...order,
          buyerName: buyer?.fullName || order.buyerId,
        };
      })
    );

    return ordersWithDetails;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "REFUNDED",
  imageUrls?: string[]
): Promise<Order | null> => {
  try {
    if (!orderId || !paymentStatus) {
      toast.error("Order ID and payment status are required");
      return null;
    }

    // Construct query parameters
    const params = new URLSearchParams();
    params.append("paymentStatus", paymentStatus);
    if (imageUrls && imageUrls.length > 0) {
      imageUrls.forEach((url) => params.append("imageUrls", url));
    }

    const response = await customFetch.patch<OrderResponse>(
      `/orders/${orderId}/payment-status?${params.toString()}`,
      {}
    );
    console.log(
      "Payment status update URL:",
      `/orders/${orderId}/payment-status?${params.toString()}`
    );
    console.log("Payment status update response:", response.data);
    toast.success("Payment status updated successfully!");
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Payment status update error:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Failed to update payment status"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

// Confirm shipment by seller
export const shipConfirm = async (
  orderId: string,
  imageUrls: string[],
  sellerId: string
): Promise<Order | null> => {
  try {
    const params = new URLSearchParams();
    imageUrls.forEach((url) => params.append("imageUrls", url));
    params.append("sellerId", sellerId);
    const response = await customFetch.patch(
      `/orders/${orderId}/shipped?${params.toString()}`
    );
    // The API returns an array in result, get the first order
    const order = Array.isArray(response.data.result)
      ? response.data.result[0]
      : response.data.result;
    return order;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to confirm shipment"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

// Confirm delivery by buyer
export const deliveryConfirm = async (
  orderId: string,
  imageUrls: string[],
  buyerId: string
): Promise<Order | null> => {
  try {
    const params = new URLSearchParams();
    imageUrls.forEach((url) => params.append("imageUrls", url));
    params.append("buyerId", buyerId);
    const response = await customFetch.patch(
      `/orders/${orderId}/delivered?${params.toString()}`
    );
    // The API may return an array in result, get the first order if so
    const order = Array.isArray(response.data.result)
      ? response.data.result[0]
      : response.data.result;
    return order;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to confirm delivery"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};
