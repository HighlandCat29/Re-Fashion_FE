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
import { MessagePopup } from "../components/MessagePopup";
import {
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiHeart,
  HiArrowLeft,
} from "react-icons/hi2";
import { FeaturedProductsSection } from "../components";
import { deleteProduct } from "../api/Products/index";
import ConfirmationModal from "../components/ConfirmationModal";

const SingleProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<UserResponse | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [returnToOrderUrl, setReturnToOrderUrl] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    wishlist: localWishlist,
    addToWishlist: addToLocalWishlist,
    removeFromWishlist: removeFromLocalWishlist,
  } = useWishlist();

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
        setIsOwner(!!userId && userId === data.sellerId);

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
  }, [id, userId, localWishlist, navigate]);

  useEffect(() => {
    const lastOrderPage = localStorage.getItem("lastOrderPage");
    if (lastOrderPage && lastOrderPage.includes("/order/")) {
      setReturnToOrderUrl(lastOrderPage);
    }
    // Cleanup function to run when the component unmounts
    return () => {
      localStorage.removeItem("lastOrderPage");
    };
  }, []);

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

    if (product.isActive === false) {
      toast.error("This product is no longer available for purchase.");
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
      await addToCart(userId, product.id);
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

  const handleDelete = async () => {
    if (!product || !product.id) return;
    try {
      await deleteProduct(product.id);
      toast.success("Product deleted successfully!");
      navigate("/user-profile"); // Redirect after deletion
    } catch (error) {
      toast.error("Failed to delete product.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleReturnToOrder = () => {
    if (returnToOrderUrl) {
      navigate(returnToOrderUrl);
    }
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
    product.isActive
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {returnToOrderUrl && (
        <div className="mb-6">
          <button
            onClick={handleReturnToOrder}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
            Return to Order Details
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main large image */}
          <div className="w-96 h-96 mx-auto overflow-hidden rounded-lg bg-gray-100">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img
                src={product.imageUrls[selectedImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300 ease-in-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Thumbnail gallery - only show if there are multiple images */}
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {product.imageUrls.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index
                      ? "border-primary shadow-lg scale-105"
                      : "border-gray-200 hover:border-gray-300 hover:scale-105"
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`${product.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
          <p className="text-lg text-gray-600">{product.brand || "No Brand"}</p>
          <p className="text-2xl font-semibold text-primary mt-2">
            {formatPrice(product.price)}
          </p>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            <p className="mt-1 text-gray-700">{product.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Category
                </h2>
                <p className="mt-1 text-gray-700">{product.categoryName}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Seller</h2>
                <p className="mt-1 text-gray-700">{product.sellerUsername}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Condition
                </h2>
                <p className="mt-1 text-gray-700">{product.productCondition}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Size</h2>
                <p className="mt-1 text-gray-700">{product.size}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Color</h2>
                <p className="mt-1 text-gray-700">{product.color}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Seller</h2>
            <p className="mt-2 text-gray-600">
              {sellerProfile?.username || "Unknown Seller"}
            </p>
            {!isOwner && userId && sellerProfile && (
              <button
                onClick={() => setShowChat(true)}
                className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Chat with Seller
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {userId ? (
              <>
                {!isOwner ? (
                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors text-2xl relative group"
                      aria-label="Add to Cart"
                      title="Add to Cart"
                    >
                      <HiOutlineShoppingCart />
                      <span className="sr-only">Add to Cart</span>
                      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        Add to Cart
                      </span>
                    </button>
                    <button
                      onClick={handleWishlistToggle}
                      className={`flex-1 flex items-center justify-center p-3 rounded-lg text-2xl relative group transition-colors ${
                        isInWishlist
                          ? "bg-red-100 text-red-500 hover:bg-red-200"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                      aria-label={
                        isInWishlist
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                      title={
                        isInWishlist
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                    >
                      {isInWishlist ? <HiHeart /> : <HiOutlineHeart />}
                      <span className="sr-only">
                        {isInWishlist
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"}
                      </span>
                      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        {isInWishlist
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"}
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Edit Product
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-gray-600">
                  Please{" "}
                  <a href="/login" className="text-black hover:underline">
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
          </div>
          {isOwner && product && (
            <div className="flex space-x-4 mt-4">
              <button
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                onClick={() =>
                  navigate("/feature-product", { state: { product } })
                }
              >
                Feature Product
              </button>
              <button
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete Product
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {product.id && <CommentSection productId={product.id} />}

      {/* Featured Products Section */}
      <div className="mt-16">
        <FeaturedProductsSection />
      </div>

      {/* Chat Popup */}
      {showChat && userId && sellerProfile && (
        <MessagePopup
          open={showChat}
          onClose={() => setShowChat(false)}
          senderId={userId}
          receiverId={sellerProfile.id}
          receiverName={sellerProfile.username}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
};

export default SingleProduct;
