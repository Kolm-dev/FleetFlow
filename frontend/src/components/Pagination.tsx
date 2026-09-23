type PaginationProps = {
    page: number;
    lastPage: number;
    isFetching: boolean;
    onPreviousPage: () => void;
    onNextPage: () => void;
};

export const Pagination = ({ page, lastPage, isFetching, onPreviousPage, onNextPage }: PaginationProps) => {
    if (lastPage <= 1) return null;

    return (
        <nav
            className="pagination"
            aria-label="Pagination"
        >
            <button
                className="pagination__button"
                type="button"
                aria-label="Go to previous page"
                disabled={page <= 1 || isFetching}
                onClick={onPreviousPage}
            >
                Previous
            </button>

            <span className="pagination__status" aria-live="polite">
                Page {page} of {lastPage}
            </span>

            <button
                className="pagination__button"
                type="button"
                aria-label="Go to next page"
                disabled={page >= lastPage || isFetching}
                onClick={onNextPage}
            >
                Next
            </button>
        </nav>
    );
};
