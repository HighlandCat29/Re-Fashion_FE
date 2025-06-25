// src/components/ShowingPagination.tsx
import { useAppSelector } from "../hooks";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ShowingPagination() {
  const { totalProducts, showingProducts } = useAppSelector(s => s.shop);
  const [searchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const ITEMS_PER_PAGE = 16;
  const pageCount = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const currentPage = Math.min(Math.max(pageParam, 1), pageCount || 1);
  const navigate = useNavigate();

  if (pageCount <= 1) return null;

  return (
    <nav className="py-8 flex justify-center space-x-2">
      <button
        onClick={() => navigate(`?page=${currentPage - 1}`)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        ‹ Prev
      </button>

      {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => navigate(`?page=${p}`)}
          className={`px-3 py-1 border rounded ${p === currentPage ? "bg-primary text-white" : ""
            }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => navigate(`?page=${currentPage + 1}`)}
        disabled={currentPage === pageCount}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next ›
      </button>
    </nav>
  );
}
