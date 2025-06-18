import { useEffect } from "react";
import ProductGrid from "./ProductGrid";
import ProductGridWrapper from "./ProductGridWrapper";
import { useAppDispatch } from "../hooks";
import { getProducts } from "../api/Products/index";
import { setProducts } from "../features/shop/shopSlice";
import toast from "react-hot-toast";
import { getAllOrders } from "../api/Orders";

const HomeCollectionSection = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchProductsAndOrders = async () => {
      try {
        const [productsData, allOrders] = await Promise.all([
          getProducts(),
          getAllOrders(),
        ]);
        if (productsData) {
          // Find all productIds in orders with paymentStatus PENDING or PAID
          const inactiveProductIds = new Set<string>();
          (allOrders || []).forEach((order) => {
            if (
              order.paymentStatus === "PENDING" ||
              order.paymentStatus === "PAID"
            ) {
              (order.items || []).forEach((item) => {
                if (item.productId) inactiveProductIds.add(item.productId);
              });
              (order.productIds || []).forEach((pid) =>
                inactiveProductIds.add(pid)
              );
            }
          });
          // Set isActive false for those products (in-memory)
          const updatedProducts = productsData.map((p) => ({
            ...p,
            isActive: !inactiveProductIds.has(p.id ?? ""),
          }));
          // Only keep products with isActive true and status APPROVED, limit to 6
          const activeProducts = updatedProducts
            .filter((p) => p.isActive && p.status === "APPROVED")
            .slice(0, 6);
          dispatch(setProducts(activeProducts));
        }
      } catch (error) {
        console.error("Error fetching products or orders:", error);
        toast.error("Failed to load products");
      }
    };

    fetchProductsAndOrders();
  }, [dispatch]);

  return (
    <div>
      <div className="max-w-screen-2xl flex items-center justify-between mx-auto mt-24 px-5 max-[400px]:px-3">
        <h2 className="text-black text-5xl font-normal tracking-[1.56px] max-sm:text-4xl">
          Our Collection
        </h2>
      </div>
      <ProductGridWrapper>
        <ProductGrid />
      </ProductGridWrapper>
    </div>
  );
};

export default HomeCollectionSection;
