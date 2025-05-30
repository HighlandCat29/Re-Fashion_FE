import {
  ProductGrid,
  ProductGridWrapper,
  ShopFilterAndSort,
  ShowingPagination,
} from "../components";
import { useState, useMemo } from "react";

type Product = {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  popularity: number;
  stock: number;
};

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
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortCriteria === "popularity") {
      sorted.sort((a, b) => b.popularity - a.popularity);
    }
    return sorted;
  }, [products, sortCriteria]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  return (
    <>
      <ShopFilterAndSort
        sortCriteria={sortCriteria}
        setSortCriteria={setSortCriteria}
      />

      <ProductGridWrapper
        sortCriteria={sortCriteria}
        category={category}
        page={currentPage}
      >
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
