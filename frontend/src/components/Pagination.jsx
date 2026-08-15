import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, numOfPages, onChange }) => {
  if (numOfPages <= 1) return null;

  const pages = Array.from({ length: numOfPages }, (_, i) => i + 1).filter(
    (page) =>
      page === 1 ||
      page === numOfPages ||
      Math.abs(page - currentPage) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-8">
      <button
        className="btn-outline !px-2.5"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        aria-label="Previous page">
        <FiChevronLeft />
      </button>
      {pages.map((page, index) => (
        <span key={page} className="flex items-center gap-1.5">
          {index > 0 && page - pages[index - 1] > 1 && (
            <span className="px-1 text-dark-400">…</span>
          )}
          <button
            onClick={() => onChange(page)}
            className={
              page === currentPage
                ? 'btn bg-primary-600 !px-3.5 text-white'
                : 'btn-outline !px-3.5'
            }>
            {page}
          </button>
        </span>
      ))}
      <button
        className="btn-outline !px-2.5"
        disabled={currentPage === numOfPages}
        onClick={() => onChange(currentPage + 1)}
        aria-label="Next page">
        <FiChevronRight />
      </button>
    </nav>
  );
};

export default Pagination;
