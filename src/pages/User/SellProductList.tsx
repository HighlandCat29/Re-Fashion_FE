import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsBySellerId, Product } from "../../api/Products/adminIndex";
import { useAppSelector } from "../../hooks";
import { toast } from "react-hot-toast";
import { formatPrice } from "../../utils/formatPrice";

const SellProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.id) {
        toast.error("Please log in to view your products");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const userProducts = await getProductsBySellerId(user.id);
        if (userProducts) {
          setProducts(userProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load your products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user?.id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Sell's Products</h1>
        <button
          onClick={() => navigate("/sell-product")}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Sell New Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">
            You haven't listed any products yet.
          </p>
          <button
            onClick={() => navigate("/sell-product")}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Start Selling
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative group">
                <img
                  src={product.imageUrls[0] || "/default-product.png"}
                  alt={product.title}
                  className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-md shadow-md hover:bg-gray-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                  >
                    View Details
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3
                  className="text-lg font-semibold mb-2 hover:text-primary transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                <p className="text-primary font-bold mb-4">
                  {formatPrice(product.price)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 capitalize">
                    {product.productCondition.toLowerCase().replace("_", " ")}
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.categoryName}
                  </span>
                </div>
                <div className="mt-2">
                  {product.isSold ? (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      Sold
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Available
                    </span>
                  )}
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => navigate(`/edit-product/${product.id}`)}
                    className="text-black hover:text-gray-800 text-sm font-medium"
                  >
                    Edit
                  </button>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellProductList;
