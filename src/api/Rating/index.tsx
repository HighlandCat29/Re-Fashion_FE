import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

interface RatingPayload {
  productId: string;
  rating: number; // Assuming rating is a number, though the example value is large
  comment: string;
}

// Assuming a successful rating submission might return the created rating object
interface RatingResponse {
  // Define the structure of the successful response here if known
  // For now, using a flexible type or assuming it returns the payload structure + id
  id?: string; // Assuming a new ID might be assigned
  productId: string;
  rating: number;
  comment: string;
  reviewerId?: string; // Assuming reviewerId might be included in the response
  // Add other properties if the API response includes them (e.g., createdAt, etc.)
}

export const submitRating = async (
  reviewerId: string,
  payload: RatingPayload
): Promise<RatingResponse | null> => {
  try {
    const response = await customFetch.post(
      `/ratings?reviewerId=${reviewerId}`,
      payload
    );
    toast.success("Rating submitted successfully!");
    return response.data;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to submit rating: " + errorMessage);
    return null;
  }
};
