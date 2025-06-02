import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../../../api/Products/index";

interface Product {
  id: string;
  title: string;
  description: string;
  size: string;
  color: string;
  brand: string;
  price: number;
  productCondition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  isActive: boolean;
  featuredUntil: string;
  isFeatured: boolean;
  categoryId: string;
  sellerId: string;
  imageFile: string;
}

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id as string);
        if (data) {
          setProduct({
            ...data,
            categoryId: data.categoryName,
            sellerId: data.sellerUsername,
            productCondition: data.productCondition as
              | "NEW"
              | "LIKE_NEW"
              | "GOOD"
              | "FAIR"
              | "POOR",
          });
        }
      } catch (err) {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!product) return;
    const { name, value, type } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;

    const parsedValue =
      type === "checkbox"
        ? checked
        : name === "price"
        ? parseFloat(value)
        : value;

    setProduct({ ...product, [name]: parsedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (product) {
        console.log("Product before FormData:", product);
        const formData = new FormData();

        // Ensure all required fields are present
        if (
          !product.title ||
          !product.description ||
          !product.brand ||
          !product.size ||
          !product.color ||
          !product.price ||
          !product.categoryId ||
          !product.sellerId
        ) {
          setError("All fields are required");
          return;
        }

        // Convert all values to strings before appending
        const productData = {
          title: product.title,
          description: product.description,
          brand: product.brand,
          productCondition: product.productCondition,
          size: product.size,
          color: product.color,
          price: product.price.toString(),
          categoryId: product.categoryId,
          sellerId: product.sellerId,
          isFeatured: product.isFeatured.toString(),
          featuredUntil: product.featuredUntil,
          isActive: product.isActive.toString(),
          imageUrl: product.imageFile,
        };

        // Append all fields to FormData
        Object.entries(productData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });

        // Debug FormData contents
        console.log("FormData contents:");
        for (const pair of formData.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }

        await updateProduct(product.id, formData);
        navigate("/admin/products");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update product.");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!product) return <p className="p-6">Product not found.</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={product.title}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={product.brand}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Size
              </label>
              <input
                type="text"
                name="size"
                value={product.size}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={product.color}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Condition
              </label>
              <select
                name="productCondition"
                value={product.productCondition}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2"
              >
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category ID
              </label>
              <input
                type="text"
                name="categoryId"
                value={product.categoryId}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Seller ID
              </label>
              <input
                type="text"
                name="sellerId"
                value={product.sellerId}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Featured Until
              </label>
              <input
                type="datetime-local"
                name="featuredUntil"
                value={
                  product.featuredUntil
                    ? product.featuredUntil.slice(0, 16)
                    : ""
                }
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={product.isFeatured}
                  onChange={handleChange}
                  className="mr-2"
                />
                Featured
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={product.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                Active
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
