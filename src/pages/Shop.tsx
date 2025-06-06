// src/pages/Shop.tsx

import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import { ShopBanner, ShopPageContent } from "../components";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { getProducts, Product } from "../api/Products/adminIndex";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setProducts } from "../features/shop/shopSlice";

export const shopCategoryLoader = async ({ params }: LoaderFunctionArgs) => {
  const { category } = params;
  if (!category) throw new Response("Category not found", { status: 404 });
  return category;
};

// Helper function to turn "Suits & Blazers" into "suits-and-blazers"
const slugify = (str: string) =>
  str
    .toLowerCase()
    // replace & with "and"
    .replace(/\s*&\s*/g, " and ")
    // replace any non-alphanumeric sequence with a hyphen
    .replace(/[^a-z0-9]+/g, "-")
    // trim leading/trailing hyphens
    .replace(/^-+|-+$/g, "");

const Shop = () => {
  const category = useLoaderData() as string; // e.g. "tops" or "suits-and-blazers"
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.shop);

  // 1) Fetch *all* products into Redux (just like before)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        if (productsData) {
          const activeProducts = productsData.filter(
            (p) => p.isActive
          );
          dispatch(setProducts(activeProducts));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, [dispatch]);

  // 2) Filter by slugified categoryName instead of categoryId
  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      if (!p.categoryName) return false;
      const productSlug = slugify(p.categoryName);
      return productSlug === category.toLowerCase();
    });
  }, [category, products]);

  // 3) Validate page param
  useEffect(() => {
    if (isNaN(page) || page < 1) {
      toast.error("Invalid page number, defaulting to page 1.");
    }
  }, [page]);

  // 4) Show spinner while we haven’t yet loaded any products from Redux
  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // 5) If no products match that category slug, show “No products found”
  if (filteredProducts.length === 0) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 pt-12 pb-20">
        <ShopBanner category={category} />
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800">
            No products found
          </h2>
          <p className="text-gray-600 mt-2">
            Try a different category or check back later.
          </p>
        </div>
      </div>
    );
  }

  // 6) Otherwise, render the banner + paginated content with the filtered products
  return (
    <div className="max-w-screen-2xl mx-auto px-4 pt-12 pb-20">
      <ShopBanner category={category} />
      <ShopPageContent
        category={category}
        page={page}
        products={filteredProducts}
      />
    </div>
  );
};

export default Shop;
