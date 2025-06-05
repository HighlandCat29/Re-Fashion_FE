import { Product, changeProductStatus } from "../api/Products/adminIndex";
import { useEffect, useState } from "react";
import { getProducts } from "../api/Products/adminIndex";

const AdminProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleStatusChange = async (
    id: string,
    newStatus: "PENDING" | "APPROVED" | "REJECTED"
  ) => {
    try {
      await changeProductStatus(id, newStatus);
      setProducts(
        products.map((product) =>
          product.id === id ? { ...product, status: newStatus } : product
        )
      );
    } catch (error) {
      console.error("Failed to change status:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Product Management</h2>
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                {product.imageUrls[0] && (
                  <img
                    src={product.imageUrls[0]}
                    alt={product.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-bold">{product.title}</h3>
                  <p className="text-gray-600">{product.brand}</p>
                  <p className="text-gray-600">Price: ${product.price}</p>
                  <p className="text-gray-600">
                    Seller: {product.sellerUsername}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  className={`px-2 py-1 rounded ${
                    product.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : product.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.status}
                </span>
                <div className="flex gap-2">
                  {product.status !== "APPROVED" && (
                    <button
                      onClick={() =>
                        handleStatusChange(product.id!, "APPROVED")
                      }
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                  )}
                  {product.status !== "REJECTED" && (
                    <button
                      onClick={() =>
                        handleStatusChange(product.id!, "REJECTED")
                      }
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  )}
                  {product.status !== "PENDING" && (
                    <button
                      onClick={() => handleStatusChange(product.id!, "PENDING")}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Set Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductList;
