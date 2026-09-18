type PaginationProps = {
    page: number;
    lastPage: number;
    isFetching: boolean;
    onPreviousPage: () => void;
    onNextPage: () => void;
};

export const Pagination = ({ page, lastPage, isFetching, onPreviousPage, onNextPage }: PaginationProps) => (
    <div>
        <button
            type="button"
            disabled={page === 1 || isFetching}
            onClick={onPreviousPage}
        >
            Previous
        </button>
        <button
            type="button"
            disabled={page === lastPage || isFetching}
            onClick={onNextPage}
        >
            Next
        </button>
    </div>
);
