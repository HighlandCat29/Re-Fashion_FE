import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../../../api/Products";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    brand: "",
    productCondition: "NEW",
    size: "",
    color: "",
    price: 0,
    imageFile: "",
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
        const admins = await getAdminUsers();
        console.log("Fetched admins:", admins);
        if (cats) setCategories(cats);
        if (admins) {
          const sellerUsers = admins.filter(
            (u: AdminUserResponse) => u.role.roleName === "SELLER"
          );
          console.log("Filtered sellers:", sellerUsers);
          setSellers(sellerUsers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load initial data.");
      }
    };
    fetchInitialData();
  }, []);

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
      setImageFile(file);
      setUploadingImage(true);

      try {
        // Create form data for Cloudinary upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("cloud_name", "dnrxylpid");

        // Upload to Cloudinary
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.secure_url) {
          setFormData((prev) => ({
            ...prev,
            imageFile: data.secure_url,
          }));
          toast.success("Image uploaded successfully!");
        } else {
          console.error("Cloudinary response:", data);
          throw new Error(data.error?.message || "Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.sellerId) {
      toast.error("Please select a seller from the dropdown.");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category.");
      return;
    }
    if (!formData.title) {
      toast.error("Please enter a product title.");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }
    if (!formData.imageFile) {
      toast.error("Please select a product image.");
      return;
    }

    // Log the form data before submission
    console.log("Submitting form data:", formData);

    setLoading(true);
    try {
      // Create a new object with the form data, ensuring proper types
      const productData = {
        title: formData.title,
        description: formData.description || "",
        brand: formData.brand || "",
        productCondition: formData.productCondition,
        size: formData.size || "",
        color: formData.color || "",
        price: Number(formData.price),
        imageFile: formData.imageFile, // Using imageFile as per the interface
        categoryId: formData.categoryId,
        sellerId: formData.sellerId,
        isFeatured: Boolean(formData.isFeatured),
        featuredUntil: formData.featuredUntil,
        isActive: Boolean(formData.isActive),
      };

      console.log("Sending product data:", productData);
      await addProduct(productData);
      toast.success("Product added!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(
        "Failed to add product. Please check the console for details."
      );
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
              <option value="USED">USED</option>
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

          {/* Seller Selection */}
          <div className="relative">
            <label className="block mb-1 text-sm font-medium">Seller</label>
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
                        setFormData((prev) => ({ ...prev, sellerId: s.id }));
                        setSellerSearch(`${s.username} (${s.fullName})`);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {s.username} ({s.fullName})
                    </div>
                  ))}
              </div>
            )}
            {formData.sellerId && (
              <p className="text-xs text-green-600 mt-1">
                Selected seller ID: <strong>{formData.sellerId}</strong>
              </p>
            )}
          </div>

          {/* Image Upload */}
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
            {imageFile && (
              <div className="mt-2">
                <p className="text-xs text-gray-600">{imageFile.name}</p>
                {uploadingImage && (
                  <p className="text-xs text-blue-600">Uploading image...</p>
                )}
                {formData.imageFile && !uploadingImage && (
                  <img
                    src={formData.imageFile}
                    alt="Preview"
                    className="mt-2 max-w-xs rounded"
                  />
                )}
              </div>
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
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;
