import React, { useState, useEffect } from "react";
import { Input } from "../../components/Input";
import Button from "../../components/Button";
import { Textarea } from "../../components/Textarea";
import { useAppSelector } from "../../hooks";
import { addProduct } from "../../api/Products";
import { getCategories, Category } from "../../api/Categories";
import { toast } from "react-hot-toast";
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../../config/cloudinary";

const SellProduct: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    brand: "",
    productCondition: "NEW",
    size: "",
    color: "",
    price: "",
    categoryId: "",
    imageUrls: [] as string[],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("cloud_name", "dnrxylpid");

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!data.secure_url) {
          throw new Error(data.error?.message || "Failed to upload image");
        }
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploadedUrls],
      }));
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload images.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("You must be logged in to sell a product.");
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.brand ||
      !formData.price ||
      !formData.categoryId ||
      formData.imageUrls.length === 0
    ) {
      toast.error(
        "Please fill in all required fields and upload at least one image."
      );
      return;
    }

    setSubmitting(true);
    try {
      const productPayload = {
        title: formData.title,
        description: formData.description,
        brand: formData.brand,
        productCondition: formData.productCondition,
        size: formData.size,
        color: formData.color,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        sellerId: user.id,
        isFeatured: false,
        featuredUntil: null,
        imageUrls: formData.imageUrls,
        isActive: true,
      };

      await addProduct(productPayload);
      toast.success("Product listed successfully!");
      // Reset form
      setFormData({
        title: "",
        description: "",
        brand: "",
        productCondition: "NEW",
        size: "",
        color: "",
        price: "",
        categoryId: "",
        imageUrls: [],
      });
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const conditions = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"];

  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        Sell Your Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left Column: Images and basic info */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Product Images
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28H8m48 8H12"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Choose Files
                      <input
                        id="file-upload"
                        name="imageFiles"
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                        multiple
                        accept="image/*"
                        disabled={uploadingImage}
                      />
                    </label>
                    <p className="mt-2">or drag and drop files here</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              {uploadingImage && (
                <p className="mt-2 text-sm text-blue-500">
                  Uploading images...
                </p>
              )}
              {/* Display selected images */}
              {formData.imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`preview-${index}`}
                        className="h-20 w-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            imageUrls: prev.imageUrls.filter(
                              (_, i) => i !== index
                            ),
                          }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label
                htmlFor="title"
                className="block text-lg font-semibold mb-2 text-gray-700"
              >
                Product Name
              </label>
              <Input
                id="title"
                name="title"
                maxLength={100}
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter product name"
              />
              <div className="text-right text-sm text-gray-500">
                {formData.title.length}/100
              </div>
            </div>

            {/* Brand */}
            <div>
              <label
                htmlFor="brand"
                className="block text-lg font-semibold mb-2 text-gray-700"
              >
                Brand
              </label>
              <Input
                id="brand"
                name="brand"
                maxLength={50}
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Enter brand name"
              />
              <div className="text-right text-sm text-gray-500">
                {formData.brand.length}/50
              </div>
            </div>
          </div>

          {/* Right Column: Details and Description */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <label
                htmlFor="categoryId"
                className="block text-lg font-semibold mb-2 text-gray-700"
              >
                Category
              </label>
              {loadingCategories ? (
                <p>Loading categories...</p>
              ) : (
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Condition */}
            <div>
              <label
                htmlFor="productCondition"
                className="block text-lg font-semibold mb-2 text-gray-700"
              >
                Condition
              </label>
              <select
                id="productCondition"
                name="productCondition"
                value={formData.productCondition}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label
                htmlFor="size"
                className="block text-lg font-semibold mb-2 text-gray-700"
              >
                Size
              </label>
              <Input
                id="size"
                name="size"
                maxLength={20}
                value={formData.size}
                onChange={handleInputChange}
                placeholder="e.g., M, 10, 32x34"
              />
            </div>

            {/* Color */}
            <div>
              <label
                htmlFor="color"
                className="block text-lg font-semibold mb-2 text-gray-700"
              >
                Color
              </label>
              <Input
                id="color"
                name="color"
                maxLength={30}
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g., Red, Blue, Black"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-lg font-semibold mb-2 text-gray-700"
              >
                Price ($)
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-lg font-semibold mb-2 text-gray-700"
              >
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                rows={6}
                maxLength={500}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product..."
              />
              <div className="text-right text-sm text-gray-500">
                {formData.description.length}/500
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md"
            mode="brown"
            text={submitting ? "Saving..." : "Create"}
            style={{
              display: "block",
              zIndex: 9999,
              width: "200px",
              height: "50px",
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default SellProduct;
