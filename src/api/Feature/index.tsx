import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

// Interfaces for Featured Payments
export interface FeaturedPayment {
  id: string;
  productId: string;
  sellerId: string;
  amount: number;
  durationDays: number;
  paymentDate: string;
  transferProofImageUrl: string;
  status: string;
}

export interface CreateFeaturedPaymentRequest {
  productId: string;
  sellerId: string;
  amount: number;
  durationDays: number;
  transferProofImageUrl: string;
}

export interface UpdateFeaturedPaymentRequest {
  productId: string;
  sellerId: string;
  amount: number;
  durationDays: number;
  transferProofImageUrl: string;
}

export interface FeaturedPaymentResponse {
  code: number;
  message: string | null;
  result: FeaturedPayment;
}

export interface FeaturedPaymentsResponse {
  code: number;
  message: string | null;
  result: FeaturedPayment[];
}

// API Functions
export const createFeaturedPayment = async (
  data: CreateFeaturedPaymentRequest
): Promise<FeaturedPayment | null> => {
  try {
    const response = await customFetch.post<FeaturedPaymentResponse>(
      "/featured-payments",
      data
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to create featured payment"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getAllFeaturedPayments = async (
  adminId: string
): Promise<FeaturedPayment[] | null> => {
  try {
    const response = await customFetch.get<FeaturedPaymentsResponse>(
      `/featured-payments?adminId=${adminId}`
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to fetch featured payments"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getFeaturedPaymentById = async (
  paymentId: string,
  adminId: string
): Promise<FeaturedPayment | null> => {
  try {
    const response = await customFetch.get<FeaturedPaymentResponse>(
      `/featured-payments/${paymentId}?adminId=${adminId}`
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to fetch featured payment"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const updateFeaturedPayment = async (
  paymentId: string,
  adminId: string,
  data: UpdateFeaturedPaymentRequest
): Promise<FeaturedPayment | null> => {
  try {
    const response = await customFetch.put<FeaturedPaymentResponse>(
      `/featured-payments/${paymentId}?adminId=${adminId}`,
      data
    );
    toast.success("Featured payment updated successfully!");
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to update featured payment"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const deleteFeaturedPayment = async (
  paymentId: string,
  adminId: string
): Promise<boolean> => {
  try {
    await customFetch.delete(
      `/featured-payments/${paymentId}?adminId=${adminId}`
    );
    toast.success("Featured payment deleted successfully!");
    return true;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to delete featured payment"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return false;
  }
};

export const confirmFeaturedPayment = async (
  paymentId: string,
  adminId: string,
  isConfirmed: boolean
): Promise<FeaturedPayment | null> => {
  try {
    const response = await customFetch.patch<FeaturedPaymentResponse>(
      `/featured-payments/${paymentId}/confirm?adminId=${adminId}&isConfirmed=${isConfirmed}`
    );
    toast.success("Featured payment confirmation updated!");
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to confirm featured payment"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getPendingFeaturedPayments = async (
  adminId: string
): Promise<FeaturedPayment[] | null> => {
  try {
    const response = await customFetch.get<FeaturedPaymentsResponse>(
      `/featured-payments/pending?adminId=${adminId}`
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch pending featured payments"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getMyFeaturedPayments = async (
  sellerId: string
): Promise<FeaturedPayment[] | null> => {
  try {
    const response = await customFetch.get<FeaturedPaymentsResponse>(
      `/featured-payments/my?sellerId=${sellerId}`
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch your featured payments"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};
