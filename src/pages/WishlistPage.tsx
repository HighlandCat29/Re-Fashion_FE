import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserWishlists, removeFromWishlist } from "../api/Whishlists";
import { getProductById } from "../api/Products/adminIndex";
import { Product } from "../api/Products";
import { useAppSelector } from "../hooks";
import { useWishlist } from "../components/WishlistContext";
import { toast } from "react-hot-toast";
import { formatPrice } from "../utils/formatPrice";

const WishlistPage: React.FC = () => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);
  const {
    wishlist: localWishlist,
    removeFromWishlist: removeFromLocalWishlist,
  } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!user?.id) {
        // If not logged in, show local wishlist items
        try {
          const localProducts = await Promise.all(
            localWishlist.map(async (item) => {
              try {
                const product = await getProductById(item.id);
                return product;
              } catch (error) {
                console.error(`Failed to fetch product ${item.id}:`, error);
                return null;
              }
            })
          );
          setWishlistProducts(
            localProducts.filter(
              (product): product is Product => product !== null
            )
          );
        } catch (error) {
          console.error("Failed to fetch local wishlist products:", error);
          toast.error("Failed to load local wishlist items");
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await getUserWishlists(user.id);
        console.log("Fetched wishlists response:", response); // Debug log

        if (response && response.result) {
          const products = await Promise.all(
            response.result.map(async (wishlist) => {
              try {
                const product = await getProductById(wishlist.productId);
                return product;
              } catch (error) {
                console.error(
                  `Failed to fetch product ${wishlist.productId}:`,
                  error
                );
                return null;
              }
            })
          );

          const validProducts = products.filter(
            (product): product is Product => product !== null
          );
          console.log("Valid products:", validProducts); // Debug log
          setWishlistProducts(validProducts);
        } else {
          console.log("No wishlists found for user:", user.id); // Debug log
          setWishlistProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist items:", error);
        toast.error("Failed to load wishlist items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [user?.id, navigate, localWishlist]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user?.id) {
      // If not logged in, remove from local wishlist
      removeFromLocalWishlist(productId);
      setWishlistProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );
      // Dispatch custom event
      window.dispatchEvent(new Event("wishlistUpdated"));
      return;
    }

    try {
      await removeFromWishlist(user.id, productId);
      setWishlistProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );
      // Dispatch custom event
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      // Error is already handled in the removeFromWishlist function
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Your wishlist is empty</p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative group">
              <img
                src={product.imageUrls[0]}
                alt={product.title}
                className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity duration-300"
              />
              <button
                onClick={() => handleRemoveFromWishlist(product.id!)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                title="Remove from wishlist"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-md shadow-md hover:bg-gray-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                >
                  View Details
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3
                className="text-lg font-semibold mb-2 hover:text-primary transition-colors duration-200 cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {product.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
              <p className="text-primary font-bold mb-4">
                {formatPrice(product.price)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 capitalize">
                  {product.productCondition.toLowerCase().replace("_", " ")}
                </span>
                <span className="text-sm text-gray-500">
                  {product.categoryName}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
