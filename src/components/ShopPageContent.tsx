import {
  ProductGrid,
  ProductGridWrapper,
  ShopFilterAndSort,
  ShowingPagination,
} from "../components";
import { useState, useMemo } from "react";
import { Product } from "../api/Products";

type Props = {
  category: string;
  page: number;
  products: Product[];
};

const ITEMS_PER_PAGE = 6;

const ShopPageContent = ({ category, page, products }: Props) => {
  const [sortCriteria, setSortCriteria] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(page);

  // Sort products
  const sorted = [...products];
  const sortedProducts = useMemo(() => {
    if (sortCriteria === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortCriteria === "price-desc") {
      sorted.sort((a, b) => b.price - b.price);
    }
    return sorted;
  }, [products, sortCriteria]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage]);

  // Calculate total filtered products and products shown on current page
  const totalFilteredProducts = sortedProducts.length;

  return (
    <>
      <ShopFilterAndSort
        sortCriteria={sortCriteria}
        setSortCriteria={setSortCriteria}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        totalFilteredProducts={totalFilteredProducts}
      />

      <ProductGridWrapper>
        <ProductGrid products={paginatedProducts} />
      </ProductGridWrapper>

      <ShowingPagination
        page={currentPage}
        category={category}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default ShopPageContent;
