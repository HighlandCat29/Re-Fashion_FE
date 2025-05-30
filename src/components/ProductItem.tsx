import { Link } from "react-router-dom";
import { formatCategoryName } from "../utils/formatCategoryName";
import { useWishlist } from "../components/WishlistContext";

const ProductItem = ({
  id,
  image,
  title,
  category,
  price,
}: {
  id: string;
  image: string;
  title: string;
  category: string;
  price: number;
}) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const isInWishlist = wishlist.some((item) => item.id === id);

  return (
    <div className="w-[400px] flex flex-col gap-2 justify-center max-md:w-[300px]">
      <Link
        to={`/product/${id}`}
        className="w-full h-[300px] max-md:h-[200px] overflow-hidden"
      >
        <img src={`/assets/${image}`} alt={title} loading="lazy" />
      </Link>
      <Link
        to={`/product/${id}`}
        className="text-black text-center text-3xl tracking-[1.02px] max-md:text-2xl"
      >
        <h2>{title}</h2>
      </Link>
      <p className="text-secondaryBrown text-lg tracking-wide text-center max-md:text-base">
        {formatCategoryName(category)}
      </p>
      <p className="text-black text-2xl text-center font-bold max-md:text-xl">
        ${price}
      </p>
      <div className="w-full flex flex-col gap-1">
        <Link
          to={`/product/${id}`}
          className="text-white bg-secondaryBrown text-center text-xl font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center max-md:text-base"
        >
          View product
        </Link>
        <Link
          to={`/product/${id}`}
          className="bg-white text-black text-center text-xl border border-[rgba(0, 0, 0, 0.40)] font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center max-md:text-base"
        >
          Learn more
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={() =>
            isInWishlist
              ? removeFromWishlist(id)
              : addToWishlist({ id, image, title, category, price })
          }
          className={`mt-2 w-full h-12 text-xl font-normal tracking-[0.6px] flex items-center justify-center ${
            isInWishlist
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
        >
          {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
