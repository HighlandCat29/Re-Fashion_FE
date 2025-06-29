// src/components/ShowingPagination.tsx
type Props = {
  page: number;
  setCurrentPage: (page: number) => void;
  pageCount: number;
};

const ShowingPagination = ({ page, setCurrentPage, pageCount }: Props) => {
  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={() => setCurrentPage(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>

      <span className="px-4 py-2">{`Page ${page} of ${pageCount}`}</span>

      <button
        onClick={() => setCurrentPage(page + 1)}
        disabled={page >= pageCount}
        className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default ShowingPagination;
