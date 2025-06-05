import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct, Product } from "../../../api/Products";
import { getCategories, Category } from "../../../api/Categories";
import { getAdminUsers, AdminUserResponse } from "../../../api/Users/index";
import { toast } from "react-hot-toast";
import {
  CLOUDINARY_UPLOAD_URL,
  UPLOAD_PRESET,
} from "../../../config/cloudinary";

const EditProducts = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<AdminUserResponse[]>([]);
  const [sellerSearch, setSellerSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [initialProduct, setInitialProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    brand: "",
    productCondition: "NEW",
    size: "",
    color: "",
    price: 0,
    imageUrls: [] as string[],
    categoryId: "",
    sellerId: "",
    isFeatured: false,
    featuredUntil: new Date().toISOString(),
    isActive: true,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [cats, users, product] = await Promise.all([
          getCategories(),
          getAdminUsers(),
          id ? getProductById(id) : null,
        ]);

        if (cats) setCategories(cats);
        if (users) {
          const sellerUsers = users.filter(
            (user: AdminUserResponse) =>
              user.role.roleName === "USER" && user.active
          );
          setSellers(sellerUsers);
        }
        if (product) {
          setInitialProduct(product);
          setFormData({
            title: product.title,
            description: product.description,
            brand: product.brand,
            productCondition: product.productCondition,
            size: product.size,
            color: product.color,
            price: product.price,
            imageUrls: product.imageUrls,
            categoryId: product.categoryId,
            sellerId: product.sellerId,
            isFeatured: product.isFeatured,
            featuredUntil: product.featuredUntil || new Date().toISOString(),
            isActive: product.isActive,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load initial data.");
      }
    };
    fetchInitialData();
  }, [id]);

  useEffect(() => {
    if (initialProduct && sellers.length > 0) {
      const seller = sellers.find((s) => s.id === initialProduct.sellerId);
      if (seller) {
        setSellerSearch(`${seller.username} (${seller.fullName})`);
      }
    }
  }, [sellers, initialProduct]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(val) : val,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("cloud_name", "dnrxylpid");

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.secure_url) {
          setFormData((prev) => ({
            ...prev,
            imageUrls: [data.secure_url],
          }));
          toast.success("Image uploaded successfully!");
        } else {
          throw new Error(data.error?.message || "Failed to upload image");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Failed to upload image.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sellerId) {
      toast.error("Please select a seller.");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category.");
      return;
    }
    if (!formData.title) {
      toast.error("Please enter a title.");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    if (formData.imageUrls.length === 0) {
      toast("No image selected. Proceeding without product image.");
    }

    setLoading(true);
    try {
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim(),
        productCondition: formData.productCondition.toUpperCase(),
        size: formData.size.trim(),
        color: formData.color.trim(),
        price: Number(formData.price),
        imageUrls: formData.imageUrls,
        categoryId: formData.categoryId,
        sellerId: formData.sellerId,
        isFeatured: Boolean(formData.isFeatured),
        featuredUntil: formData.isFeatured
          ? new Date(formData.featuredUntil).toISOString()
          : null,
        isActive: Boolean(formData.isActive),
      };

      if (
        !productData.title ||
        !productData.categoryId ||
        !productData.sellerId
      ) {
        toast.error("Please fill in all required fields.");
        return;
      }

      if (!id) {
        toast.error("Product ID is missing.");
        return;
      }

      console.log("Updating product data:", productData);
      await updateProduct(id, productData);
      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Brand</label>
            <input
              type="text"
              name="brand"
              required
              value={formData.brand}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Size</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Price (VNĐ)
            </label>
            <input
              type="number"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Condition</label>
            <select
              name="productCondition"
              value={formData.productCondition}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="NEW">NEW</option>
              <option value="LIKE_NEW">LIKE_NEW</option>
              <option value="GOOD">GOOD</option>
              <option value="FAIR">FAIR</option>
              <option value="POOR">POOR</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block mb-1 text-sm font-medium">Seller</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search seller by name or username"
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                className="w-full border p-2 rounded"
              />
              {sellerSearch && (
                <div className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto rounded shadow mt-1">
                  {sellers
                    .filter((s) =>
                      `${s.username} ${s.fullName}`
                        .toLowerCase()
                        .includes(sellerSearch.toLowerCase())
                    )
                    .map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            sellerId: s.id,
                          }));
                          setSellerSearch(`${s.username} (${s.fullName})`);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        <div className="font-medium">{s.username}</div>
                        <div className="text-gray-600 text-xs">
                          {s.fullName} • {s.email}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {formData.sellerId && (
              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-700">
                  Selected seller:{" "}
                  <strong>
                    {sellers.find((s) => s.id === formData.sellerId)?.username}
                  </strong>
                </p>
                {sellers.find((s) => s.id === formData.sellerId) && (
                  <p className="text-xs text-green-600 mt-1">
                    {sellers.find((s) => s.id === formData.sellerId)?.fullName}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="w-full border p-2 rounded"
            />
            {uploadingImage && (
              <p className="text-sm text-blue-500 mt-2">Uploading image...</p>
            )}
            {formData.imageUrls.length > 0 ? (
              <img
                src={formData.imageUrls[0]}
                alt="Preview"
                className="mt-2 max-w-xs rounded"
              />
            ) : (
              <p className="text-xs text-gray-400 mt-2 italic">
                No image selected
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Featured Until
            </label>
            <input
              type="datetime-local"
              name="featuredUntil"
              value={formData.featuredUntil.slice(0, 16)}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Active
          </label>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded shadow"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProducts;
