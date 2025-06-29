// src/pages/Shop.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";

import { getProducts, Product } from "../api/Products/index";
import { getCategories, Category } from "../api/Categories/index";
import { getAllOrders, Order } from "../api/Orders";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setProducts } from "../features/shop/shopSlice";
import { ShopPageContent } from "../components";
import ShowingPagination from "../components/ShowingPagination";

// --- Loader to pull ":category" from the URL ---
export const shopCategoryLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<string> => {
  return params.category ?? "all";
};

// --- Slugify helper (must match what CategoriesSection uses) ---
const slugify = (str?: string | null): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/['’]/g, "")            // strip apostrophes
    .replace(/\s*&\s*/g, " and ")   // "&" → "and"
    .replace(/[^a-z0-9]+/g, "-")    // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "");       // trim hyphens
};

// --- Humanize the slug for the page title ---
const formatCategoryName = (cat?: string | null): string => {
  if (!cat || cat === "all") return "All Products";
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const ITEMS_PER_PAGE = 16;

const Shop: React.FC = () => {
  // 1) Get the category slug from the route loader
  const category = useLoaderData() as string; // e.g. "footwear"
  // 2) Pagination via ?page=
  const [searchParams] = useSearchParams();
  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const navigate = useNavigate();

  // 3) Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsWithActive, setProductsWithActive] = useState<Product[]>([]);

  // 4) Redux slice for products
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((s) => s.shop);

  // — Keep selectedCategory in sync when URL changes —
  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);

  // — Fetch all categories for the filter dropdown —
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingCats(true);
        const cats = await getCategories();
        if (cats) setCategories(cats);
      } catch {
        toast.error("Could not load categories");
      } finally {
        setIsLoadingCats(false);
      }
    })();
  }, []);

  // — Fetch orders so we can mark items inactive if pending/paid —
  useEffect(() => {
    (async () => {
      try {
        const all = await getAllOrders();
        if (all) setOrders(all);
      } catch {
        console.error("Orders load error");
      }
    })();
  }, []);

  // — Fetch products, mark inactive, keep in Redux & local state —
  useEffect(() => {
    (async () => {
      try {
        const prods = await getProducts();
        if (!prods) return;

        // Build a set of productIds in pending/paid orders
        const inactiveSet = new Set<string>();
        orders.forEach((o) => {
          if (o.paymentStatus === "PENDING" || o.paymentStatus === "PAID") {
            (o.items || []).forEach((i) =>
              i.productId && inactiveSet.add(i.productId)
            );
            (o.productIds || []).forEach((id) => inactiveSet.add(id));
          }
        });

        // Toggle isActive and filter to APPROVED
        const updated = prods.map((p) => ({
          ...p,
          isActive: !(p.id && inactiveSet.has(p.id)),
        }));
        const activeOnly = updated.filter(
          (p) => p.isActive && p.status === "APPROVED"
        );

        dispatch(setProducts(activeOnly));
        setProductsWithActive(activeOnly);
      } catch {
        toast.error("Could not load products");
      }
    })();
  }, [dispatch, orders]);

  // — Filter by category & search —
  const filteredProducts = useMemo(() => {
    return productsWithActive.filter((p) => {
      // Category check
      if (selectedCategory !== "all") {
        if (slugify(p.categoryName) !== selectedCategory) return false;
      }
      // Search check
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [productsWithActive, selectedCategory, searchQuery]);

  // — Pagination logic —
  const pageCount = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  );
  const currentPage = Math.min(Math.max(rawPage, 1), pageCount);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // — Show spinner while Redux slice still empty —
  if (!products || products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 pb-20">
      <h1 className="text-4xl font-bold text-center mb-8">
        {formatCategoryName(selectedCategory)}
      </h1>

      {/* Search & Filter Bar */}
      <div className="mb-8 max-w-4xl mx-auto overflow-visible">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen((o) => !o)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
            >
              Filter
            </button>
            {isFilterOpen && (
              <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setIsFilterOpen(false);
                    navigate(`/shop/all?page=1`);
                  }}
                  className="block w-full px-4 py-2 hover:bg-gray-100"
                >
                  All Products
                </button>
                {categories.map((cat) => {
                  const slug = slugify(cat.name);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(slug);
                        setIsFilterOpen(false);
                        navigate(`/shop/${slug}?page=1`);
                      }}
                      className="block w-full px-4 py-2 hover:bg-gray-100"
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ShopPageContent
        category={selectedCategory}
        page={currentPage}
        products={pagedProducts}
      />

      {/* Pagination */}
      <ShowingPagination />
    </div>
  );
};

export default Shop;
