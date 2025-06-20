import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import { createFeaturedPayment } from "../../api/Feature";
import { Product } from "../../api/Products";
import { toast } from "react-hot-toast";
import paymentImage from "../../assets/Payment.jpg";
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../../config/cloudinary";
import { formatPrice } from "../../utils/formatPrice";

const FeatureProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const product: Product | undefined = location.state?.product;

  const durationDays = 7;
  const [transferProofImageUrl, setTransferProofImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const featureFee = product ? Math.round(product.price * 0.1) : 0;
  const amount = featureFee;

  if (!product || !user) {
    toast.error("Product or user not found");
    navigate("/shop");
    return null;
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      if (!data.secure_url)
        throw new Error(data.error?.message || "Failed to upload image");
      setTransferProofImageUrl(data.secure_url);
      toast.success("Payment screenshot uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload payment screenshot.");
      setTransferProofImageUrl("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProofImageUrl) {
      toast.error("Please upload payment screenshot");
      return;
    }
    const req = {
      productId: product.id!,
      sellerId: user.id,
      durationDays,
      transferProofImageUrl,
      amount,
    };
    console.log("Submitting featured payment:", req);
    try {
      const result = await createFeaturedPayment(req);
      if (result) {
        toast.success("Product is now pending for featuring!");
        navigate("/feature/confirm", {
          state: {
            productId: product.id,
            featuredPayment: result,
          },
        });
      }
    } catch (error) {
      toast.error("Failed to create featured payment");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Feature Your Product</h2>
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <img
            src={product.imageUrls?.[0]}
            alt={product.title}
            className="w-24 h-24 object-cover rounded"
          />
          <div>
            <div className="font-semibold text-lg">{product.title}</div>
            <div className="text-gray-600">
              Price: {formatPrice(product.price)}
            </div>
            <div className="text-gray-600">
              Category: {product.categoryName}
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-1">Feature Duration</label>
          <div className="text-lg font-bold">7 ngày</div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Feature Fee (10% of price)
          </label>
          <input
            type="number"
            min={featureFee}
            value={amount}
            readOnly
            className="text-lg font-bold border rounded px-2 py-1 w-full max-w-xs bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Bank Transfer Payment
          </label>
          <img
            src={paymentImage}
            alt="Bank Payment"
            className="w-full max-w-xs mb-2 mx-auto"
          />
          <div className="text-center mb-2">
            <div className="font-semibold">Ngân hàng: VCB</div>
            <div className="font-semibold">Tên tài khoản: THAI BINH DUONG</div>
            <div className="font-semibold">Số tài khoản: 1031513945</div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploadingImage}
            className="block mt-2"
          />
          {transferProofImageUrl && (
            <img
              src={transferProofImageUrl}
              alt="Proof"
              className="w-32 h-32 object-cover mt-2 rounded"
            />
          )}
        </div>
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          disabled={uploadingImage}
        >
          Submit Feature Payment
        </button>
      </form>
    </div>
  );
};

export default FeatureProduct;
