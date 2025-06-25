// src/pages/Shop.tsx

import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { ShopPageContent } from "../components";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getProducts, Product } from "../api/Products/index";
import { getCategories, Category } from "../api/Categories/index";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setProducts } from "../features/shop/shopSlice";
import { getAllOrders, Order } from "../api/Orders";
import ShowingPagination from "../components/ShowingPagination";

export const shopCategoryLoader = async ({ params }: LoaderFunctionArgs) => {
  const { category } = params;
  return category || "all";
};

const slugify = (str: string | undefined | null): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const formatCategoryName = (category: string | undefined | null): string => {
  if (!category || category === "all") return "All Products";
  return category.replace(/-/g, " ");
};

const ITEMS_PER_PAGE = 16;

const Shop = () => {
  const category = useLoaderData() as string;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsWithActive, setProductsWithActive] = useState<Product[]>([]);

  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.shop);

  // — fetch categories —
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingCategories(true);
        const cats = await getCategories();
        if (cats) setCategories(cats);
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    })();
  }, []);

  // — fetch orders —
  useEffect(() => {
    (async () => {
      try {
        const all = await getAllOrders();
        if (all) setOrders(all);
      } catch {
        console.error("Orders error");
      }
    })();
  }, []);

  // — fetch products & mark inactive —
  useEffect(() => {
    (async () => {
      try {
        const prods = await getProducts();
        if (!prods) return;
        const inactive = new Set<string>();
        orders.forEach((o) => {
          if (o.paymentStatus === "PENDING" || o.paymentStatus === "PAID") {
            (o.items || []).forEach((i) => i.productId && inactive.add(i.productId));
            (o.productIds || []).forEach((id) => inactive.add(id));
          }
        });
        const updated = prods.map((p) => ({
          ...p,
          isActive: !inactive.has(p.id ?? ""),
        }));
        const active = updated.filter((p) => p.isActive && p.status === "APPROVED");
        dispatch(setProducts(active));
        setProductsWithActive(active);
      } catch {
        toast.error("Failed to load products");
      }
    })();
  }, [dispatch, orders]);

  // — filtered list —
  const filteredProducts = useMemo(() => {
    return productsWithActive.filter((p) => {
      // search-only if "all"
      if (!selectedCategory || selectedCategory === "all") {
        if (!searchQuery) return true;
        const s = searchQuery.toLowerCase();
        return (
          p.title?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s) ||
          p.brand?.toLowerCase().includes(s)
        );
      }
      // category match
      const slug = slugify(p.categoryName);
      if (slug !== selectedCategory) return false;
      if (!searchQuery) return true;
      const s = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s)
      );
    });
  }, [productsWithActive, selectedCategory, searchQuery]);

  // — clamp page & slice —
  const pageCount = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(Math.max(rawPage, 1), pageCount);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // — early loading spinner —
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
        {selectedCategory === "all"
          ? "All Products"
          : formatCategoryName(selectedCategory)}
      </h1>

      {/* — Search & Filter bar — */}
      <div className="mb-8 max-w-4xl mx-auto overflow-visible">
        <div className="flex gap-4 items-center">
          {/* Search input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filter button + dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen((o) => !o)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
            >
              Filter
            </button>

            {isFilterOpen && (
              <div
                className="
            absolute top-full
            right-0
            sm:left-0 sm:right-auto
            mt-2 w-48
            bg-white border rounded-lg shadow-lg
            z-50
          "
              >
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setIsFilterOpen(false);
                    navigate(`/shop?category=all`);
                  }}
                  className="block w-full px-4 py-2 hover:bg-gray-100"
                >
                  All Products
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      const slug = slugify(cat.name);
                      setSelectedCategory(slug);
                      setIsFilterOpen(false);
                      navigate(`/shop?category=${slug}`);
                    }}
                    className="block w-full px-4 py-2 hover:bg-gray-100"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* — Grid of 16 items — */}
      <ShopPageContent category="" page={currentPage} products={pagedProducts} />

      {/* — Pagination controls — */}
      <ShowingPagination />
    </div>
  );

};

export default Shop;
