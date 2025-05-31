import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";

export interface Category {
  id: string;
  name: string;
  description: string;
}

export const getCategories = async (): Promise<Category[] | null> => {
  try {
    const response = await customFetch.get("/categories");
    return response.data.result;
  } catch (error: any) {
    toast.error(
      "Failed to fetch categories: " +
        (error.response?.data?.message || error.message)
    );
    return null;
  }
};

// ✅ Add this function to handle POST
export const addCategory = async (
  category: Omit<Category, "id">
): Promise<void> => {
  try {
    console.log(category);
    const response = await customFetch.post("/categories", {
      name: category.name,
      description: category.description,
    });
    console.log("thanh cong");
    if (response.status === 200 || response.status === 1000) {
      toast.success("Category added successfully!");
    } else {
      toast.error("Unexpected response when adding category.");
    }
  } catch (error: any) {
    toast.error(
      "Failed to add category: " +
        (error.response?.data?.message || error.message)
    );
    throw error;
  }
};
