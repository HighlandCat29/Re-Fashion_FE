import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../api/Products";
import { Product } from "../api/Products";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../hooks";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { formatPrice } from "../utils/formatPrice";
import { useWishlist } from "../components/WishlistContext";
import {
  addToWishlist,
  getUserWishlists,
  removeFromWishlist,
} from "../api/Whishlists";
import { HiOutlineHeart } from "react-icons/hi2";

interface ProductInCart {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  sellerId: string;
  size: string;
  color: string;
  stock: number;
  image: string;
  brand: string;
  productCondition: string;
  category: string;
  popularity: number;
}

const SingleProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    wishlist: localWishlist,
    addToWishlist: addToLocalWishlist,
    removeFromWishlist: removeFromLocalWishlist,
  } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        toast.error("Product ID is missing");
        navigate("/shop");
        return;
      }

      try {
        const productData = await getProductById(id);
        if (productData) {
          setProduct(productData);
          // Check if product is in wishlist
          if (user?.id) {
            const response = await getUserWishlists(user.id);
            if (response?.result) {
              setIsInWishlist(
                response.result.some((item) => item.productId === id)
              );
            }
          } else {
            setIsInWishlist(localWishlist.some((item) => item.id === id));
          }
        } else {
          toast.error("Product not found");
          navigate("/shop");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, user?.id, localWishlist]);

  const handleAddToCart = () => {
    if (!product || !product.id) return;

    const cartItem: ProductInCart = {
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrls[0],
      quantity: 1,
      sellerId: product.sellerId,
      size: product.size,
      color: product.color,
      stock: 1,
      image: product.imageUrls[0],
      brand: product.brand,
      productCondition: product.productCondition,
      category: product.categoryName,
      popularity: 0,
    };

    dispatch(addProductToTheCart(cartItem));
    toast.success("Added to cart!");
  };

  const handleWishlistToggle = async () => {
    if (!product?.id) return;

    if (!user?.id) {
      // Handle local wishlist
      if (isInWishlist) {
        removeFromLocalWishlist(product.id);
        setIsInWishlist(false);
        toast.success("Removed from wishlist!");
      } else {
        addToLocalWishlist({
          id: product.id,
          image: product.imageUrls[0],
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

    try {
      if (isInWishlist) {
        await removeFromWishlist(user.id, product.id);
        setIsInWishlist(false);
        toast.success("Removed from wishlist!");
      } else {
        await addToWishlist({ userId: user.id, productId: product.id });
        setIsInWishlist(true);
        toast.success("Added to wishlist!");
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      // Error is already handled in the API functions
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Product not found
          </h2>
          <p className="text-gray-600 mt-2">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
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
                    alt={`${product.title} - ${index + 1}`}
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
              <p className="mt-2 text-2xl text-gray-900">
                {formatPrice(product.price)}
              </p>
            </div>
            <button
              onClick={handleWishlistToggle}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <HiOutlineHeart
                className={`h-6 w-6 ${
                  isInWishlist ? "text-red-500 fill-current" : "text-gray-400"
                }`}
              />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Brand</h3>
                <p className="mt-1 text-gray-600">{product.brand}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Condition</h3>
                <p className="mt-1 text-gray-600 capitalize">
                  {product.productCondition.toLowerCase().replace("_", " ")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Size</h3>
                <p className="mt-1 text-gray-600">{product.size}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Color</h3>
                <p className="mt-1 text-gray-600">{product.color}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </button>

          {/* Seller Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Seller Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600">
                    {product.sellerUsername?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {product.sellerUsername}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since{" "}
                    {new Date(
                      product.sellerCreatedAt || ""
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Sales</p>
                  <p className="font-medium text-gray-900">
                    {product.sellerTotalSales || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Rating</p>
                  <p className="font-medium text-gray-900">
                    {product.sellerRating || "No ratings yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
