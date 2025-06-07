// src/pages/Shop.tsx

import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import { ShopBanner, ShopPageContent } from "../components";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getProducts, Product } from "../api/Products/index";
import { getCategories, Category } from "../api/Categories/index";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setProducts } from "../features/shop/shopSlice";

export const shopCategoryLoader = async ({ params }: LoaderFunctionArgs) => {
  const { category } = params;
  return category || "all";
};

// Helper function to turn "Suits & Blazers" into "suits-and-blazers"
const slugify = (str: string | undefined | null): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Helper function to format category name for display
const formatCategoryName = (category: string | undefined | null): string => {
  if (!category || category === "all") return "All Products";
  return category.replace(/-/g, " ");
};

const Shop = () => {
  const category = useLoaderData() as string;
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.shop);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await getCategories();
        if (categoriesData) {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories. Please try again later.");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        if (productsData) {
          // Filter only approved products
          const approvedProducts = productsData.filter(
            (p) => p.status === "APPROVED"
          );
          console.log("Fetched products:", productsData);
          console.log("Approved products:", approvedProducts);
          dispatch(setProducts(approvedProducts));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products. Please try again later.");
      }
    };
    fetchProducts();
  }, [dispatch]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) {
      console.log("No products available");
      return [];
    }

    console.log("Current category:", selectedCategory);
    console.log("Total products before filtering:", products.length);

    const filtered = products.filter((p: Product) => {
      try {
        // If category is "all" or undefined, show all products
        if (!selectedCategory || selectedCategory === "all") {
          if (!searchQuery) return true;

          const searchLower = searchQuery.toLowerCase();
          const matchesSearch =
            (p.title?.toLowerCase() || "").includes(searchLower) ||
            (p.description?.toLowerCase() || "").includes(searchLower) ||
            (p.brand?.toLowerCase() || "").includes(searchLower);

          return matchesSearch;
        }

        // Filter by category
        const productSlug = slugify(p.categoryName);
        const categorySlug = selectedCategory?.toLowerCase() || "";
        console.log("Product category:", p.categoryName);
        console.log("Product slug:", productSlug);
        console.log("Category slug:", categorySlug);

        const matchesCategory = productSlug === categorySlug;

        // If there's a search query, also check if the product matches the search
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch =
            (p.title?.toLowerCase() || "").includes(searchLower) ||
            (p.description?.toLowerCase() || "").includes(searchLower) ||
            (p.brand?.toLowerCase() || "").includes(searchLower);

          return matchesCategory && matchesSearch;
        }

        return matchesCategory;
      } catch (error) {
        console.error("Error filtering product:", error);
        return false;
      }
    });

    console.log("Filtered products:", filtered);
    return filtered;
  }, [selectedCategory, products, searchQuery]);

  // Validate page parameter
  useEffect(() => {
    if (isNaN(page) || page < 1) {
      toast.error("Invalid page number. Showing page 1.");
    }
  }, [page]);

  // Show loading spinner
  if (!products || products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // Show no products found message
  if (filteredProducts.length === 0) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 pt-12 pb-20">
        <ShopBanner category={formatCategoryName(selectedCategory)} />

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-center">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-600">Filter</span>
                </button>

                {/* Filter Dropdown */}
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">
                        Categories
                      </h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          selectedCategory === "all"
                            ? "text-primary font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        All Products
                      </button>
                      {isLoadingCategories ? (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Loading categories...
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          No categories available
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(slugify(cat.name));
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                              selectedCategory === slugify(cat.name)
                                ? "text-primary font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800">
            No products found
          </h2>
          <p className="text-gray-600 mt-2">
            {!selectedCategory || selectedCategory === "all"
              ? "We couldn't find any products matching your search."
              : `We couldn't find any products in the ${formatCategoryName(
                  selectedCategory
                )} category.`}
          </p>
          <button
            onClick={() => setSelectedCategory("all")}
            className="mt-4 text-primary hover:text-primary-dark transition-colors"
          >
            View all products
          </button>
        </div>
      </div>
    );
  }

  // Render shop content
  return (
    <div className="max-w-screen-2xl mx-auto px-4 pt-12 pb-20">
      <ShopBanner category={formatCategoryName(selectedCategory)} />

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-600">Filter</span>
              </button>

              {/* Filter Dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">
                      Categories
                    </h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        selectedCategory === "all"
                          ? "text-primary font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      All Products
                    </button>
                    {isLoadingCategories ? (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Loading categories...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No categories available
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(slugify(cat.name));
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            selectedCategory === slugify(cat.name)
                              ? "text-primary font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ShopPageContent
        category={formatCategoryName(selectedCategory)}
        page={page}
        products={filteredProducts}
      />
    </div>
  );
};

export default Shop;
