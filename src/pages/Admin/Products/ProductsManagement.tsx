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

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, usersData] = await Promise.all([
        getProducts(),
        getCategories(),
        getAdminUsers(),
      ]);

      console.log("Raw API responses:", {
        products: productsData,
        categories: categoriesData,
        sellers: usersData,
      });

      if (productsData) {
        console.log("First product data structure:", productsData[0]);
        setProducts(productsData);
      }

      if (categoriesData) {
        console.log("Categories data structure:", categoriesData);
        setCategories(categoriesData);
      }

      if (usersData) {
        console.log("Sellers data structure:", usersData);
        const sellerUsers = usersData.filter(
          (user) => user.role.roleName === "USER" && user.active
        );
        setSellers(sellerUsers);
      }
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

  // Add a listener for navigation events
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
    console.log("Category lookup - Product object:", product);
    console.log("Category lookup - Available categories:", categories);
    // Prioritize finding by ID
    let category = categories.find((cat) => cat.id === product.categoryId);
    // If not found by ID, try by name (fallback)
    if (!category && product.categoryName) {
      category = categories.find((cat) => cat.name === product.categoryName);
    }
    console.log("Category lookup - Found category:", category);
    return category?.name || product.categoryName || "Unknown Category";
  };

  const getSellerName = (product: Product) => {
    console.log("Seller lookup - Product object:", product);
    console.log("Seller lookup - Available sellers:", sellers);
    // Prioritize finding by ID
    let seller = sellers.find((s) => s.id === product.sellerId);
    // If not found by ID, try by username (fallback)
    if (!seller && product.sellerUsername) {
      seller = sellers.find((s) => s.username === product.sellerUsername);
    }
    console.log("Seller lookup - Found seller:", seller);
    if (seller) {
      return `${seller.username} (${seller.fullName})`;
    }
    return product.sellerUsername || "Unknown Seller";
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
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  // Add this useEffect to log the current state whenever it changes
  useEffect(() => {
    console.log("Current state:", {
      products: products,
      categories: categories,
      sellers: sellers,
    });
  }, [products, categories, sellers]);

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
                {products.map((product) => {
                  console.log("Rendering product:", product);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition"
                    >
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
                        ${product.price.toFixed(2)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedProduct && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 transition-all duration-300 transform scale-100 opacity-100">
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    Basic Information
                  </h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">Title:</span>
                      <span className="text-gray-800">
                        {selectedProduct.title}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">Brand:</span>
                      <span className="text-gray-800">
                        {selectedProduct.brand}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">Price:</span>
                      <span className="text-gray-800">
                        ${selectedProduct.price.toFixed(2)}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Condition:
                      </span>
                      <span className="text-gray-800">
                        {selectedProduct.productCondition}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    Product Details
                  </h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">Size:</span>
                      <span className="text-gray-800">
                        {selectedProduct.size}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">Color:</span>
                      <span className="text-gray-800">
                        {selectedProduct.color}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Category:
                      </span>
                      <span className="text-gray-800">
                        {getCategoryName(selectedProduct)}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">Seller:</span>
                      <span className="text-gray-800">
                        {getSellerName(selectedProduct)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Status & Description */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    Status Information
                  </h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedProduct.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedProduct.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Featured:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedProduct.isFeatured
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedProduct.isFeatured ? "Yes" : "No"}
                      </span>
                    </p>
                    {selectedProduct.isFeatured &&
                      selectedProduct.featuredUntil && (
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-600">
                            Featured Until:
                          </span>
                          <span className="text-gray-800">
                            {new Date(
                              selectedProduct.featuredUntil
                            ).toLocaleDateString()}
                          </span>
                        </p>
                      )}
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Created At:
                      </span>
                      <span className="text-gray-800">
                        {selectedProduct.createdAt
                          ? new Date(
                              selectedProduct.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    Description
                  </h3>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Product Images
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {selectedProduct.imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm"
                      >
                        View Full
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
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

export default ProductsManagement;
