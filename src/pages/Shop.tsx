import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import { ShopBanner, ShopPageContent } from "../components";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import db from "../data/db.json"; // import your local database

export const shopCategoryLoader = async ({ params }: LoaderFunctionArgs) => {
  const { category } = params;

  if (!category) {
    throw new Response("Category not found", { status: 404 });
  }

  return category.toLowerCase();
};

const Shop = () => {
  const category = useLoaderData() as string;
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  // Filter products by category from the imported db
  const filteredProducts = useMemo(() => {
    return db.products.filter(
      (product) => product.category.toLowerCase() === category
    );
  }, [category]);

  useEffect(() => {
    if (isNaN(page) || page < 1) {
      toast.error("Invalid page number, defaulting to page 1.");
    }
  }, [page]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 pt-12 pb-20 transition-all duration-300">
      <ShopBanner category={category} />
      <div className="mt-8">
        <ShopPageContent
          category={category}
          page={isNaN(page) ? 1 : page}
          products={filteredProducts}
        />
      </div>
    </div>
  );
};

export default Shop;
