import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../api/Products/index";
import { Product } from "../api/Products";
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

const SingleProduct = () => {
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
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        const data = await getUserById(userId);
        if (data) {
          setUserProfile(data);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Fetch seller profile
  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!product?.sellerId) return;

      try {
        const data = await getUserById(product.sellerId);
        if (data) {
          setSellerProfile(data);
        }
      } catch (err) {
        console.error("Error fetching seller profile:", err);
      }
    };

    fetchSellerProfile();
  }, [product?.sellerId]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        toast.error("Product ID is missing");
        navigate("/shop");
        return;
      }

      try {
        const data = await getProductById(id);
        console.log("Full API Response:", data);

        if (!data) {
          toast.error("Product not found");
          navigate("/shop");
          return;
        }

        setProduct(data);

        // Check if the current user is the owner
        const ownerCheck = {
          userId,
          sellerId: data.sellerId,
          userUsername: userProfile?.username,
          sellerUsername: data.sellerUsername,
          isOwner: userProfile?.username === data.sellerUsername,
          productId: data.id,
          productTitle: data.title,
        };
        console.log("Owner Check Details:", ownerCheck);
        setIsOwner(ownerCheck.isOwner);

        // Check if product is in wishlist
        if (userId) {
          const wishlistResponse = await getUserWishlists(userId);
          if (wishlistResponse?.result) {
            setIsInWishlist(
              wishlistResponse.result.some((item) => item.productId === id)
            );
          }
        } else {
          // Check local wishlist if not logged in
          setIsInWishlist(localWishlist.some((item) => item.id === id));
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product details");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, userId, userProfile, localWishlist, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!userId) {
      toast.error("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    if (!product.id) {
      toast.error("Product ID is missing.");
      return;
    }

    if (
      !product.imageUrls ||
      product.imageUrls.length === 0 ||
      !product.imageUrls[0]
    ) {
      toast.error("Product image not available for cart.");
      return;
    }

    try {
      const addedToCart = await addToCart(
        userId,
        product.id,
        1, // Default quantity to 1
        product.price,
        product.title,
        product.imageUrls[0]
      );
      if (addedToCart) {
        toast.success("Added to cart!");
      } else {
        toast.error("Failed to add to cart.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred while adding to cart.");
    }
  };

  const handleWishlistToggle = async () => {
    if (!product?.id) {
      toast.error("Product ID is missing");
      return;
    }

    if (!userId) {
      // Handle local wishlist
      if (isInWishlist) {
        removeFromLocalWishlist(product.id);
        setIsInWishlist(false);
        toast.success("Removed from wishlist!");
      } else {
        // Ensure all required fields have valid values
        const wishlistProduct = {
          id: product.id,
          image: product.imageUrls?.[0] || "",
          title: product.title || "Untitled Product",
          category: product.categoryName || "Uncategorized",
          price: product.price || 0,
        };
        addToLocalWishlist(wishlistProduct);
        setIsInWishlist(true);
        toast.success("Added to wishlist!");
      }
      // Dispatch custom event
      window.dispatchEvent(new Event("wishlistUpdated"));
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(userId, product.id);
        setIsInWishlist(false);
        toast.success("Removed from wishlist!");
      } else {
        await addToWishlist({ userId, productId: product.id });
        setIsInWishlist(true);
        toast.success("Added to wishlist!");
      }
      // Dispatch custom event
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      // Error is already handled in the addToWishlist/removeFromWishlist functions
    }
  };

  const handleEdit = () => {
    if (!product?.id) return;
    navigate(`/edit-product/${product.id}`);
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
        <h2 className="text-2xl font-semibold text-gray-800">
          Product not found
        </h2>
        <button
          onClick={() => navigate("/shop")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  console.log(
    "Product object:",
    product,
    "Is Owner:",
    isOwner,
    "Is Active:",
    product?.isActive
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.imageUrls[0]}
              alt={product.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
          {product.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.imageUrls.slice(1).map((url, index) => (
                <div
                  key={index}
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
        <div className="md:col-span-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {product.title}
          </h1>
          <p className="text-xl text-gray-900 mt-2">
            {formatPrice(product.price)}
          </p>
          <div className="mt-4">
            <h2 className="text-sm font-medium text-gray-900">Description</h2>
            <div className="mt-2 space-y-6 text-base text-gray-700">
              <p>{product.description}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <h2 className="text-sm font-medium text-gray-900">Details</h2>
            <dl className="mt-2 space-y-2 text-base text-gray-700">
              <div>
                <dt className="inline font-medium text-gray-900">Brand:</dt>{" "}
                <dd className="inline">{product.brand}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-900">Condition:</dt>{" "}
                <dd className="inline capitalize">
                  {product.productCondition.toLowerCase().replace("_", " ")}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-900">Category:</dt>{" "}
                <dd className="inline">{product.categoryName}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-900">Seller:</dt>{" "}
                <dd className="inline">
                  {sellerProfile?.username ||
                    product.sellerUsername ||
                    "Unknown Seller"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex space-x-4">
            {!isOwner && (
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Add to Cart
              </button>
            )}
            {!isOwner && (
              <button
                onClick={handleWishlistToggle}
                className="flex-1 border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 ${
                    isInWishlist ? "text-red-500" : "text-gray-400"
                  }`}
                  fill={isInWishlist ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 22.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleEdit}
                className="flex-1 bg-blue-500 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Product
              </button>
            )}
          </div>

          <div className="mt-4">
            {product.status !== undefined && product.status !== null && (
              <p className="text-sm text-gray-500 capitalize">
                Product Status: {product.status}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
