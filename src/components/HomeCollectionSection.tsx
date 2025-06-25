import { useEffect } from "react";
import ProductGrid from "./ProductGrid";
import ProductGridWrapper from "./ProductGridWrapper";
import { useAppDispatch } from "../hooks";
import { getProducts } from "../api/Products/index";
import { setProducts } from "../features/shop/shopSlice";
import toast from "react-hot-toast";

const HomeCollectionSection = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        if (productsData) {
          // Only keep products with isActive true, isSold false, and status APPROVED
          const activeProducts = productsData.filter(
            (p) =>
              p.isActive &&
              p.status === "APPROVED" &&
              (p as { isSold?: boolean }).isSold === false
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
