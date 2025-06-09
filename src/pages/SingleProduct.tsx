// src/pages/SingleProduct.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, Product } from "../api/Products/index";
import { useAppSelector } from "../hooks";
import { toast } from "react-hot-toast";
import { useWishlist } from "../components/WishlistContext";
import {
  addToWishlist,
  getUserWishlists,
  removeFromWishlist,
} from "../api/Whishlists";
import { getUserById, UserResponse } from "../api/Users";
import { addToCart } from "../api/Cart";
import { formatPrice } from "../utils/formatPrice";

// ← Import the comments section you created
import CommentsSection from "../components/CommentsSection";

const SingleProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
  const [sellerProfile, setSellerProfile] = useState<UserResponse | null>(null);

  const {
    wishlist: localWishlist,
    addToWishlist: addToLocalWishlist,
    removeFromWishlist: removeFromLocalWishlist,
  } = useWishlist();

  // Fetch user profile to get username
  useEffect(() => {
    if (!userId) return;
    getUserById(userId)
      .then((data) => data && setUserProfile(data))
      .catch((err) => console.error("Error fetching user profile:", err));
  }, [userId]);

  // Fetch seller profile once product loads
  useEffect(() => {
    if (!product?.sellerId) return;
    getUserById(product.sellerId)
      .then((data) => data && setSellerProfile(data))
      .catch((err) => console.error("Error fetching seller profile:", err));
  }, [product?.sellerId]);

  // Fetch product, check ownership & wishlist
  useEffect(() => {
    if (!id) {
      toast.error("Product ID is missing");
      navigate("/shop");
      return;
    }

    (async () => {
      try {
        const data = await getProductById(id);
        if (!data) {
          toast.error("Product not found");
          navigate("/shop");
          return;
        }
        setProduct(data);

        // Owner check
        const owner = userProfile?.username === data.sellerUsername;
        setIsOwner(owner);

        // Wishlist check
        if (userId) {
          const resp = await getUserWishlists(userId);
          const items = resp?.result || [];
          setIsInWishlist(items.some((i) => i.productId === id));
        } else {
          setIsInWishlist(localWishlist.some((i) => i.id === id));
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product details");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, userId, userProfile, localWishlist, navigate]);

  const handleAddToCart = async () => {
    if (!product || !userId) {
      toast.error(!userId ? "Please log in" : "Product data missing");
      if (!userId) navigate("/login");
      return;
    }
    try {
      const ok = await addToCart(
        userId,
        product.id,
        1,
        product.price,
        product.title,
        product.imageUrls[0]
      );
      toast[ok ? "success" : "error"](ok ? "Added to cart!" : "Add to cart failed");
    } catch {
      toast.error("Error adding to cart");
    }
  };

  const handleWishlistToggle = async () => {
    if (!product?.id) return toast.error("Product ID missing");
    if (!userId) {
      // local
      if (isInWishlist) {
        removeFromLocalWishlist(product.id);
        setIsInWishlist(false);
        toast.success("Removed from wishlist!");
      } else {
        addToLocalWishlist({
          id: product.id,
          image: product.imageUrls[0] || "",
          title: product.title,
          category: product.categoryName || "",
          price: product.price,
        });
        setIsInWishlist(true);
        toast.success("Added to wishlist!");
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
      return;
    }
    // server-side
    try {
      if (isInWishlist) {
        await removeFromWishlist(userId, product.id);
        toast.success("Removed from wishlist!");
      } else {
        await addToWishlist({ userId, productId: product.id });
        toast.success("Added to wishlist!");
      }
      setIsInWishlist(!isInWishlist);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch {
      /* error handling inside API */
    }
  };

  const handleEdit = () => {
    if (product?.id) navigate(`/edit-product/${product.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-800">Product not found</h2>
        <button
          onClick={() => navigate("/shop")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.imageUrls[0]}
              alt={product.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
          {product.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.imageUrls.slice(1).map((url, idx) => (
                <div
                  key={idx}
                  className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100"
                >
                  <img
                    src={url}
                    alt={product.title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{product.title}</h1>
          <p className="text-xl text-gray-900 mt-2">{formatPrice(product.price)}</p>

          <div className="mt-4">
            <h2 className="text-sm font-medium text-gray-900">Description</h2>
            <p className="mt-2 text-base text-gray-700">{product.description}</p>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <h2 className="text-sm font-medium text-gray-900">Details</h2>
            <dl className="mt-2 space-y-2 text-base text-gray-700">
              <div>
                <dt className="inline font-medium">Brand:</dt>{" "}
                <dd className="inline">{product.brand}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Condition:</dt>{" "}
                <dd className="inline capitalize">
                  {product.productCondition.toLowerCase().replace("_", " ")}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Category:</dt>{" "}
                <dd className="inline">{product.categoryName}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Seller:</dt>{" "}
                <dd className="inline">
                  {sellerProfile?.username || product.sellerUsername}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex space-x-4">
            {!isOwner && (
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white rounded-md py-3 px-8 hover:bg-primary-dark"
              >
                Add to Cart
              </button>
            )}
            {!isOwner && (
              <button
                onClick={handleWishlistToggle}
                className="flex-1 border border-gray-300 rounded-md py-3 px-8 hover:bg-gray-50"
              >
                {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleEdit}
                className="flex-1 bg-blue-500 text-white rounded-md py-3 px-8 hover:bg-blue-600"
              >
                Edit Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ————— Comments Section ————— */}
      <CommentsSection productId={product.id!} />
    </div>
  );
};

export default SingleProduct;
