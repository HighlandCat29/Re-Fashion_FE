import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ProductResponse,
  getProducts,
  deleteProduct,
} from "../../../api/Products/index";

const API_BASE_URL = "http://localhost:8080"; // Add your API base URL here

const ProductsManagement = () => {
  const [products, setProducts] = useState<ProductResponse["result"][]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<
    ProductResponse["result"] | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const data = await getProducts();
      if (data) setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        fetchAllProducts();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const openModal = (product: ProductResponse["result"]) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <img
                        src={`${API_BASE_URL}${product.imageFile}`}
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
                      {product.categoryName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.sellerUsername}
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
                        onClick={() => handleDeleteProduct(product.id)}
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

      {showModal && selectedProduct && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 transition-all duration-300 transform scale-100 opacity-100">
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            <div className="space-y-2">
              {Object.entries(selectedProduct).map(([key, value]) => (
                <div key={key}>
                  <span className="font-semibold capitalize">{key}:</span>{" "}
                  {String(value)}
                </div>
              ))}
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
