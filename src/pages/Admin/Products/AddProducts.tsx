import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../../../api/Products/adminIndex";
import { getCategories, Category } from "../../../api/Categories";
import { getAdminUsers, AdminUserResponse } from "../../../api/Users/index";
import { toast } from "react-hot-toast";
import {
  CLOUDINARY_UPLOAD_URL,
  UPLOAD_PRESET,
} from "../../../config/cloudinary";

const AddProducts = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<AdminUserResponse[]>([]);
  const [sellerSearch, setSellerSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        const cats = await getCategories();
        const users = await getAdminUsers();
        if (cats) setCategories(cats);
        if (users) {
          const sellerUsers = users.filter(
            (user) => user.role.roleName === "USER" && user.active
          );
          setSellers(sellerUsers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load initial data.");
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

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
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, imageUrls: [] }));
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

    let finalImageUrls = formData.imageUrls; // Default to existing if no new upload

    if (selectedFile) {
      setUploadingImage(true);
      try {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", selectedFile);
        cloudinaryFormData.append("upload_preset", UPLOAD_PRESET);
        cloudinaryFormData.append("cloud_name", "dnrxylpid");

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: "POST",
          body: cloudinaryFormData,
        });

        const data = await response.json();

        if (data.secure_url) {
          finalImageUrls = [data.secure_url];
          toast.success("Image uploaded successfully!");
        } else {
          throw new Error(data.error?.message || "Failed to upload image");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Failed to upload image.");
        setUploadingImage(false);
        return; // Stop submission if image upload fails
      } finally {
        setUploadingImage(false);
      }
    } else if (formData.imageUrls.length === 0) {
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
        imageUrls: finalImageUrls, // Use the uploaded URL or existing
        categoryId: formData.categoryId,
        sellerId: formData.sellerId,
        isFeatured: Boolean(formData.isFeatured),
        featuredUntil: formData.isFeatured
          ? new Date(formData.featuredUntil).toISOString()
          : null,
        isActive: Boolean(formData.isActive),
        status: "PENDING" as const,
      };

      if (
        !productData.title ||
        !productData.categoryId ||
        !productData.sellerId
      ) {
        toast.error("Please fill in all required fields.");
        return;
      }

      console.log("Submitting product data:", productData);
      await addProduct(productData);
      toast.success("Product added!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Product</h2>
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
            <label className="block mb-1 text-sm font-medium">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border p-2 rounded"
              disabled={uploadingImage}
            />
            {uploadingImage && (
              <p className="text-blue-500 text-sm mt-1">Uploading image...</p>
            )}
            {(previewUrl || formData.imageUrls.length > 0) && (
              <div className="mt-2 flex items-center space-x-2">
                <img
                  src={previewUrl || formData.imageUrls[0]}
                  alt="Product Preview"
                  className="w-32 h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear Image
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Category</label>
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Seller</label>
            <input
              type="text"
              placeholder="Search seller by username or ID"
              value={sellerSearch}
              onChange={(e) => setSellerSearch(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />
            <select
              name="sellerId"
              required
              value={formData.sellerId}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select a seller</option>
              {sellers
                .filter(
                  (seller) =>
                    seller.username
                      .toLowerCase()
                      .includes(sellerSearch.toLowerCase()) ||
                    seller.id.toLowerCase().includes(sellerSearch.toLowerCase())
                )
                .map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.username} ({seller.fullName})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border p-2 rounded"
          ></textarea>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="text-sm font-medium">Featured Product</label>
          {formData.isFeatured && (
            <div>
              <label className="ml-4 text-sm font-medium">Featured Until</label>
              <input
                type="datetime-local"
                name="featuredUntil"
                value={formData.featuredUntil.substring(0, 16)}
                onChange={handleChange}
                className="ml-2 border p-1 rounded text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="text-sm font-medium">Product is Active</label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
            disabled={loading || uploadingImage}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;
