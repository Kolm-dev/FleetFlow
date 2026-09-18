import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce.ts";
import type { TripSort, TripStatus } from "@/types/tripsTypes";

export const useTripsFilters = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<TripStatus | undefined>();
    const [sort, setSort] = useState<TripSort | undefined>();
    const [searchInput, setSearchInput] = useState("");
    const search = useDebounce(searchInput.trim(), 500);

    const resetPage = () => setPage(1);
    const goToPreviousPage = () => setPage(currentPage => currentPage - 1);
    const goToNextPage = () => setPage(currentPage => currentPage + 1);

    const changeStatus = (nextStatus?: TripStatus) => {
        setStatus(nextStatus);
        resetPage();
    };

    const changeSort = (nextSort?: TripSort) => {
        setSort(nextSort);
        resetPage();
    };

    const changeSearchInput = (searchValue: string) => {
        setSearchInput(searchValue);
        resetPage();
    };

    return {
        page,
        status,
        sort,
        search,
        searchInput,
        changeStatus,
        changeSort,
        changeSearchInput,
        goToPreviousPage,
        goToNextPage,
    };
};
