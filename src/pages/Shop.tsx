// src/pages/Shop.tsx
import {
  useLoaderData,
  useSearchParams,
  useNavigate,
  LoaderFunctionArgs,
} from "react-router-dom";
import { ShopPageContent, ShowingPagination } from "../components";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getProducts, Product } from "../api/Products";
import { getCategories, Category } from "../api/Categories";
import { getAllOrders, Order, OrderItem } from "../api/Orders";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setProducts } from "../features/shop/shopSlice";

const ITEMS_PER_PAGE = 16;

// ✅ EXPORT: This is what was missing!
export const shopCategoryLoader = async ({ params }: LoaderFunctionArgs) => {
  const { category } = params;
  return category || "all";
};

const slugify = (str: string | undefined | null): string => {
  if (!str) return "";
  return str
    .normalize("NFKD")
    .replace(/[’']/g, "")               // remove apostrophes (both smart & straight)
    .replace(/[^\x00-\x7F]/g, "")       // remove non-ASCII
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};



const formatCategoryName = (category: string | undefined | null): string => {
  if (!category || category === "all") return "All Products";
  return category.replace(/-/g, " ");
};

const Shop = () => {
  const category = useLoaderData() as string;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsWithActive, setProductsWithActive] = useState<Product[]>([]);

  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.shop);

  useEffect(() => {
    (async () => {
      try {
        const cats = await getCategories();
        if (cats) setCategories(cats);
      } catch {
        toast.error("Failed to load categories");
      }
    })();
  }, []);

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

  useEffect(() => {
    (async () => {
      try {
        const prods = await getProducts();
        if (!prods) return;

        const inactive = new Set<string>();
        orders.forEach((o: Order) => {
          if (o.paymentStatus === "PENDING" || o.paymentStatus === "PAID") {
            (o.items || []).forEach((i: OrderItem) => {
              if (i.productId) inactive.add(i.productId);
            });
            (o.productIds || []).forEach((id: string) => {
              inactive.add(id);
            });
          }
        });

        const updated = prods.map((p: Product) => ({
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

  const filteredProducts = useMemo(() => {
    return productsWithActive.filter((p: Product) => {
      const matchesSearch =
        !searchQuery ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase());

      const catSlug = slugify(p.categoryName);
      console.log({
        selectedCategory,
        rawCategory: p.categoryName,
        slugifiedCategory: catSlug,
        matches: catSlug === selectedCategory
      });
      const matchesCategory =
        !selectedCategory || selectedCategory === "all" || catSlug === selectedCategory;

      return matchesCategory && matchesSearch;
    });
  }, [productsWithActive, selectedCategory, searchQuery]);

  const pageCount = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(Math.max(rawPage, 1), pageCount);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="max-w-screen-2xl mx-auto px-4 pb-20">
      <h1 className="text-4xl font-bold text-center mb-8">
        {selectedCategory === "all"
          ? "All Products"
          : categories.find((cat) => slugify(cat.name) === selectedCategory)?.name || "Unknown Category"}
      </h1>


      <div className="mb-8">
        <input
          type="text"
          placeholder="Search products…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <ShopPageContent
        category={selectedCategory}
        page={currentPage}
        products={pagedProducts}
        totalProducts={filteredProducts.length}
      />

      <ShowingPagination
        page={currentPage}
        setCurrentPage={(p) => navigate(`?page=${p}`)}
        pageCount={pageCount}
      />
    </div>
  );
};

export default Shop;
