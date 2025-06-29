// src/components/ShopPageContent.tsx
import { useState, useMemo } from "react";
import { ProductGrid, ProductGridWrapper, ShopFilterAndSort } from "../components";
import { Product } from "../api/Products";

type Props = {
  category: string;
  page: number;
  products: Product[];
  totalProducts: number;
};

const ShopPageContent = ({ category, page, products, totalProducts }: Props) => {
  const [sortCriteria, setSortCriteria] = useState("");

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    if (sortCriteria === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortCriteria === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    }
    return sorted;
  }, [products, sortCriteria]);

  return (
    <>
      <ShopFilterAndSort
        sortCriteria={sortCriteria}
        setSortCriteria={setSortCriteria}
        currentPage={page}
        itemsPerPage={products.length}
        totalFilteredProducts={totalProducts}
      />

      <ProductGridWrapper>
        <ProductGrid products={sortedProducts} />
      </ProductGridWrapper>
    </>
  );
};

export default ShopPageContent;
