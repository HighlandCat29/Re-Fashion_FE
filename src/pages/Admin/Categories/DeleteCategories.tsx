import { deleteCategory } from "../../../api/Categories";

export const handleDelete = async (id: string) => {
  if (window.confirm("Are you sure you want to delete this category?")) {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category.");
    }
  }
};
