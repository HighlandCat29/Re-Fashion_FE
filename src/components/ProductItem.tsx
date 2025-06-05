import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCategoryName } from "../utils/formatCategoryName";
import { formatPrice } from "../utils/formatPrice";
import { useWishlist } from "./WishlistContext";
import { useAppSelector } from "../hooks";
import {
  addToWishlist,
  getUserWishlists,
  removeFromWishlist,
} from "../api/Whishlists";
import { toast } from "react-hot-toast";

type Props = {
  id: string;
  image: string;
  title: string;
  category: string;
  price: number;
  brand: string;
  condition: string;
};

const ProductItem = ({
  id,
  image,
  title,
  category,
  price,
  brand,
  condition,
}: Props) => {
  const { user } = useAppSelector((state) => state.auth);
  const {
    wishlist: localWishlist,
    addToWishlist: addToLocalWishlist,
    removeFromWishlist: removeFromLocalWishlist,
  } = useWishlist();
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      // Check local wishlist first
      const isInLocalWishlist = localWishlist.some((item) => item.id === id);
      if (isInLocalWishlist) {
        setIsInWishlist(true);
        return;
      }

      // If user is logged in, check server wishlist
      if (user?.id) {
        try {
          const response = await getUserWishlists(user.id);
          if (response?.result) {
            const isInServerWishlist = response.result.some(
              (item) => item.productId === id
            );
            setIsInWishlist(isInServerWishlist);
          }
        } catch (error) {
          console.error("Failed to check wishlist status:", error);
        }
      }
    };

    checkWishlistStatus();
  }, [id, user?.id, localWishlist]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the wishlist button
    e.stopPropagation();

    if (!user?.id) {
      // If not logged in, toggle local wishlist
      if (isInWishlist) {
        removeFromLocalWishlist(id);
        setIsInWishlist(false);
        toast.success("Removed from wishlist!");
      } else {
        addToLocalWishlist({ id, image, title, category, price });
        setIsInWishlist(true);
        toast.success("Added to wishlist!");
      }
      // Dispatch custom event
      window.dispatchEvent(new Event("wishlistUpdated"));
      return;
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await removeFromWishlist(user.id, id);
        setIsInWishlist(false);
        toast.success("Removed from wishlist!");
      } else {
        // Add to wishlist
        await addToWishlist({ userId: user.id, productId: id });
        setIsInWishlist(true);
        toast.success("Added to wishlist!");
      }
      // Dispatch custom event
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      // Error is already handled in the addToWishlist/removeFromWishlist functions
    }
  };

  return (
    <Link
      to={`/product/${id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image || "/default-product.png"}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={handleWishlistToggle}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                isInWishlist ? "text-red-500" : "text-gray-400"
              }`}
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
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondaryBrown text-white">
            {condition}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 truncate">
            {brand}
          </span>
          <span className="text-sm font-medium text-secondaryBrown ml-2 flex-shrink-0">
            {formatCategoryName(category)}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 min-h-[3rem]">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-primaryBrown">
            {formatPrice(price)}
          </span>
          <button className="px-3 py-1 text-sm font-medium text-white bg-primaryBrown rounded-full hover:bg-secondaryBrown transition-colors duration-300">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(ProductItem);
