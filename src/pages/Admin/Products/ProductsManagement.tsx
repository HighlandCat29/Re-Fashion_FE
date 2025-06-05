import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Product,
  getProducts,
  deleteProduct,
} from "../../../api/Products/index";
import { getCategories, Category } from "../../../api/Categories";
import { getAdminUsers, AdminUserResponse } from "../../../api/Users";
import { toast } from "react-hot-toast";
import { formatPrice } from "../../../utils/formatPrice";

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, usersData] = await Promise.all([
        getProducts(),
        getCategories(),
        getAdminUsers(),
      ]);

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      const activeSellers = (usersData || []).filter(
        (user) => user.role.roleName === "USER" && user.active
      );
      setSellers(activeSellers);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      fetchAllData();
    };
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const getCategoryName = (product: Product) => {
    // First try to find by ID
    let category = categories.find((cat) => cat.id === product.categoryId);

    // If not found by ID and product has categoryName, try to find by name
    if (!category && product.categoryName) {
      category = categories.find(
        (cat) => cat.name.toLowerCase() === product.categoryName?.toLowerCase()
      );
    }

    // Log for debugging
    console.log(
      "Product:",
      product.title,
      "Category:",
      category?.name || product.categoryName
    );

    // Return category name or fallback
    return category?.name || product.categoryName || "Unknown Category";
  };

  const getSellerName = (product: Product) => {
    let seller = sellers.find((s) => s.id === product.sellerId);
    if (!seller && product.sellerUsername) {
      seller = sellers.find((s) => s.username === product.sellerUsername);
    }
    return seller
      ? `${seller.username} (${seller.fullName})`
      : product.sellerUsername || "Unknown Seller";
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        fetchAllData();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Products Management
          </h1>
          <button
            onClick={() => navigate("/admin/products/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            + Add Product
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <img
                        src={product.imageUrls[0] || "/default-product.png"}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {product.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {product.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {getCategoryName(product)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {getSellerName(product)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => openModal(product)}
                        className="text-green-600 hover:underline font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/products/edit/${product.id}`)
                        }
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id!)}
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

      {/* Enhanced Modal for Product Details */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800">
                Product Details
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-200 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Images
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedProduct.imageUrls.length > 0 ? (
                    selectedProduct.imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url || "/default-product.png"}
                        alt={`Product Image ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg border hover:scale-105 transition-transform"
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No images available.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
                <InfoLine label="Title" value={selectedProduct.title} />
                <InfoLine label="Brand" value={selectedProduct.brand} />
                <InfoLine
                  label="Price"
                  value={formatPrice(selectedProduct.price)}
                />
                <InfoLine
                  label="Condition"
                  value={selectedProduct.productCondition}
                />
                <InfoLine label="Size" value={selectedProduct.size || "N/A"} />
                <InfoLine
                  label="Color"
                  value={selectedProduct.color || "N/A"}
                />
                <InfoLine
                  label="Category"
                  value={getCategoryName(selectedProduct)}
                />
                <InfoLine
                  label="Seller"
                  value={getSellerName(selectedProduct)}
                />
                <InfoLine
                  label="Status"
                  value={
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedProduct.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedProduct.isActive ? "Active" : "Inactive"}
                    </span>
                  }
                />
                {selectedProduct.isFeatured && (
                  <InfoLine
                    label="Featured Until"
                    value={
                      selectedProduct.featuredUntil
                        ? new Date(
                            selectedProduct.featuredUntil
                          ).toLocaleString()
                        : "N/A"
                    }
                  />
                )}
                {selectedProduct.createdAt && (
                  <InfoLine
                    label="Created At"
                    value={new Date(selectedProduct.createdAt).toLocaleString()}
                  />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Description
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedProduct.description || "N/A"}
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🧩 Reusable subcomponent for displaying product detail lines
const InfoLine = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <strong className="block font-medium text-gray-800 mb-1">{label}</strong>
    <div className="text-gray-700">{value}</div>
  </div>
);

export default ProductsManagement;
