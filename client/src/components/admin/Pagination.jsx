function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="flex justify-end gap-3 mt-6">
      <button
        disabled={page === 1}
        onClick={() =>
          onPageChange(page - 1)
        }
        className="rounded bg-slate-700 px-4 py-2 disabled:opacity-40"
      >
        Previous
      </button>

      <span className="self-center">
        {page} / {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() =>
          onPageChange(page + 1)
        }
        className="rounded bg-slate-700 px-4 py-2 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;