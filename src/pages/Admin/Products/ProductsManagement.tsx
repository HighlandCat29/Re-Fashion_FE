import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Product,
  getProducts,
  changeProductStatus,
} from "../../../api/Products/adminIndex";
import { toast } from "react-hot-toast";
import { formatPrice } from "../../../utils/formatPrice";

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData || []);
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

  const handleStatusChange = async (
    id: string,
    newStatus: "PENDING" | "APPROVED" | "REJECTED"
  ) => {
    try {
      const note = `Product ${newStatus.toLowerCase()} by admin`;
      await changeProductStatus(id, newStatus, note);

      // Refresh the products list to get the latest data
      await fetchAllData();

      // Update status in the details view if it's open
      if (selectedProduct && selectedProduct.id === id) {
        const updatedProduct = products.find((p) => p.id === id);
        if (updatedProduct) {
          setSelectedProduct(updatedProduct);
        }
      }

      toast.success(`Product ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Failed to change status:", error);
      toast.error(`Failed to ${newStatus.toLowerCase()} product`);
    }
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
                      {product.categoryName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.sellerUsername}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : product.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        >
                          View Details
                        </button>
                        {product.status === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(product.id!, "APPROVED")
                              }
                              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(product.id!, "REJECTED")
                              }
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Product Details</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProduct.imageUrls[0] || "/default-product.png"}
                    alt={selectedProduct.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-gray-600">{selectedProduct.brand}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primaryBrown">
                      {formatPrice(selectedProduct.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Category: {selectedProduct.categoryName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Seller: {selectedProduct.sellerUsername}
                    </p>
                    <p className="text-sm text-gray-600">
                      Condition: {selectedProduct.productCondition}
                    </p>
                    <p className="text-sm text-gray-600">
                      Size: {selectedProduct.size}
                    </p>
                    <p className="text-sm text-gray-600">
                      Color: {selectedProduct.color}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Status:
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          selectedProduct.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : selectedProduct.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedProduct.status}
                      </span>
                    </p>
                    <div className="mt-2 flex gap-2">
                      {selectedProduct.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(
                                selectedProduct.id!,
                                "APPROVED"
                              )
                            }
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(
                                selectedProduct.id!,
                                "REJECTED"
                              )
                            }
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{selectedProduct.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
