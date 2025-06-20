import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCategories,
  Category,
  deleteCategory,
} from "../../../api/Categories/index";
import ConfirmationModal from "../../../components/ConfirmationModal";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const fetchAllCategories = async () => {
    try {
      const data = await getCategories();
      if (data) setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      fetchAllCategories();
      setCategoryToDelete(null); // Close modal
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Categories Management
          </h1>
          <button
            onClick={() => navigate("/admin/categories/add")}
            className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            + Add Category
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500">No categories found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {cat.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {cat.description}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-4">
                      <button
                        onClick={() =>
                          navigate(`/admin/categories/edit/${cat.id}`)
                        }
                        className="text-black hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => handleDelete(categoryToDelete!.id)}
        title="Confirm Category Deletion"
        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default CategoriesManagement;
