import { CommentSection } from "../components/CommentSection";
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
      const addedToCart = await addToCart(userId, product.id);
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
          <div className="w-96 h-96 mx-auto overflow-hidden rounded-lg bg-gray-100">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img
                src={product.imageUrls[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {product.title}
            </h1>
            <p className="text-2xl font-semibold text-primary mt-2">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Description
              </h2>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">Category</h2>
              <p className="mt-2 text-gray-600">{product.categoryName}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">Seller</h2>
              <p className="mt-2 text-gray-600">
                {sellerProfile?.username || "Unknown Seller"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-4">
            {isOwner ? (
              <button
                onClick={handleEdit}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Product
              </button>
            ) : (
              <>
                {userId ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleWishlistToggle}
                      className={`w-full py-3 px-6 rounded-lg transition-colors ${
                        isInWishlist
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {isInWishlist
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"}
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center text-gray-600">
                      Please{" "}
                      <a
                        href="/login"
                        className="text-blue-600 hover:underline"
                      >
                        log in
                      </a>{" "}
                      to add items to cart or wishlist
                    </div>
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Login to Continue
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {product.id && <CommentSection productId={product.id} />}
    </div>
  );
};

export default SingleProduct;
