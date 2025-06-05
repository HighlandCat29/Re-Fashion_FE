import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import { ShopBanner, ShopPageContent } from "../components";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { getProducts } from "../api/Products";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setProducts } from "../features/shop/shopSlice";

export const shopCategoryLoader = async ({ params }: LoaderFunctionArgs) => {
  const { category } = params;
  console.log("Shop category loader - category:", category);

  if (!category) {
    throw new Response("Category not found", { status: 404 });
  }

  return category;
};

const Shop = () => {
  const category = useLoaderData() as string;
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.shop);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        console.log("Raw API Response:", productsData);
        if (productsData && productsData.length > 0) {
          console.log("First product details:", {
            id: productsData[0].id,
            title: productsData[0].title,
            categoryId: productsData[0].categoryId,
            isActive: productsData[0].isActive,
          });
        }
        if (productsData) {
          // Filter out inactive products
          const activeProducts = productsData.filter(
            (product) => product.isActive
          );
          console.log("Active products count:", activeProducts.length);
          console.log("Active products:", activeProducts);
          dispatch(setProducts(activeProducts));
        } else {
          console.log("No products data received from API");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      }
    };

    fetchProducts();
  }, [dispatch]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    console.log("Current category:", category);
    console.log("All products count:", products.length);
    console.log("All products:", products);
    const filtered = products.filter(
      (product) => product.categoryId?.toLowerCase() === category?.toLowerCase()
    );
    console.log("Filtered products count:", filtered.length);
    console.log("Filtered products:", filtered);
    return filtered;
  }, [category, products]);

  useEffect(() => {
    if (isNaN(page) || page < 1) {
      toast.error("Invalid page number, defaulting to page 1.");
    }
  }, [page]);

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

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
