import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProductById } from "../../api/Products";
import { Product } from "../../api/Products";
import { formatPrice } from "../../utils/formatPrice";
import { toast } from "react-hot-toast";

const ConfirmFeature = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId, featuredPayment } = location.state || {};
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      toast.error("No product id provided");
      navigate("/shop");
      return;
    }
    getProductById(productId)
      .then((prod) => {
        setProduct(prod);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to fetch product details");
        setLoading(false);
      });
  }, [productId, navigate]);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!product) return null;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-700">
        Feature Payment Submitted!
      </h2>
      <div className="mb-4 flex items-center gap-4">
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
          <div className="text-gray-600">Category: {product.categoryName}</div>
        </div>
      </div>
      <div className="mb-4">
        <div className="font-medium">
          Feature Duration:{" "}
          <span className="font-bold">
            {featuredPayment?.durationDays} days
          </span>
        </div>
        <div className="font-medium">
          Feature Fee:{" "}
          <span className="font-bold">
            {formatPrice(featuredPayment?.amount)}
          </span>
        </div>
        <div className="font-medium">
          Status:{" "}
          <span className="font-bold text-black">
            {featuredPayment?.status}
          </span>
        </div>
        <div className="mt-2">
          <span className="font-medium">Payment Proof:</span>
          <img
            src={featuredPayment?.transferProofImageUrl}
            alt="Payment Proof"
            className="w-32 h-32 object-cover mt-2 rounded"
          />
        </div>
      </div>
      <div className="flex gap-4 mt-6">
        <button
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          onClick={() => navigate("/shop")}
        >
          Return to Home
        </button>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          onClick={() => navigate("/sell-product-list")}
        >
          Add to Shop
        </button>
      </div>
    </div>
  );
};

export default ConfirmFeature;
