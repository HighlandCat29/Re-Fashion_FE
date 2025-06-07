import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../api/Products/adminIndex";
import { Product } from "../api/Products/adminIndex";
import { useAppDispatch, useAppSelector } from "../hooks";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { toast } from "react-hot-toast";
import { useWishlist } from "../components/WishlistContext";
import {
  addToWishlist,
  getUserWishlists,
  removeFromWishlist,
} from "../api/Whishlists";
import { getUserById, UserResponse } from "../api/Users";

const SingleProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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

  const handleAddToCart = () => {
    if (!product) return;

    if (!userId) {
      toast.error("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    dispatch(
      addProductToTheCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image:
          product.imageUrls && product.imageUrls.length > 0
            ? product.imageUrls[0]
            : "",
        quantity: 1,
      })
    );
    toast.success("Added to cart!");
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
              {product.imageUrls.map((image, index) => (
                <div
                  key={index}
                  className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100"
                >
                  <img
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.title}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                By{" "}
                {product.sellerUsername ||
                  sellerProfile?.fullName ||
                  "Unknown Seller"}
              </p>
            </div>
            {!isOwner && (
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full ${
                  isInWishlist
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-400 hover:text-gray-500"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill={isInWishlist ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary">
              {product.price.toLocaleString("vi-VN")} ₫
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <p className="mt-1 text-gray-600">{product.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900">Details</h3>
            <dl className="mt-1 space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Condition</dt>
                <dd className="text-gray-900">{product.productCondition}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900">{product.categoryName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Size</dt>
                <dd className="text-gray-900">{product.size}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Color</dt>
                <dd className="text-gray-900">{product.color}</dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              {isOwner ? (
                <button
                  onClick={handleEdit}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Product
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {"Add to Cart"}
                </button>
              )}
            </div>
          </div>

          {/* Seller's Profile Section */}
          {sellerProfile && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Seller Information
              </h3>
              <dl className="mt-2 space-y-2">
                {sellerProfile.username && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Username</dt>
                    <dd className="text-gray-900">{sellerProfile.username}</dd>
                  </div>
                )}
                {/* Add other seller details here if available in UserResponse and needed */}
                {sellerProfile.fullName && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Full Name</dt>
                    <dd className="text-gray-900">{sellerProfile.fullName}</dd>
                  </div>
                )}
                {sellerProfile.email && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Email</dt>
                    <dd className="text-gray-900">{sellerProfile.email}</dd>
                  </div>
                )}
                {/* Example: Adding a link to seller's other products if applicable */}
                {/* <div className="flex justify-between">
                  <dt className="text-gray-500">Other Products</dt>
                  <dd className="text-gray-900"><a href={`/shop?seller=${sellerProfile.id}`} className="text-blue-600 hover:underline">View all by {sellerProfile.username}</a></dd>
                </div> */}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
