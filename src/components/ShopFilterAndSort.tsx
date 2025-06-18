interface ShopFilterAndSortProps {
  sortCriteria: string;
  setSortCriteria: (value: string) => void;
  currentPage: number;
  itemsPerPage: number;
  totalFilteredProducts: number;
}

const ShopFilterAndSort = ({
  sortCriteria,
  setSortCriteria,
  currentPage,
  itemsPerPage,
  totalFilteredProducts,
}: ShopFilterAndSortProps) => {
  let showingText = "";
  if (totalFilteredProducts === 0) {
    showingText = "Showing 0 of 0 results";
  } else {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalFilteredProducts);
    showingText = `Showing ${start}–${end} of ${totalFilteredProducts} results`;
  }
  return (
    <div className="flex justify-between items-center px-5 mb-2 max-sm:flex-col max-sm:gap-5">
      <p className="text-lg">{showingText}</p>
      <div className="flex gap-3 items-center">
        <p>Sort by:</p>
        <div className="relative">
          <select
            className="border border-[rgba(0,0,0,0.40)] px-2 py-1"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSortCriteria(e.target.value)
            }
            value={sortCriteria}
          >
            <option value="default">Default</option>
            <option value="popularity">Popularity</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>
    </div>
  );
};
export default ShopFilterAndSort;
