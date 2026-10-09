function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="ui-pagination" aria-label="Pagination">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
      <span aria-live="polite">Page {currentPage} of {totalPages}</span>
      <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
    </nav>
  );
}
export default Pagination;
