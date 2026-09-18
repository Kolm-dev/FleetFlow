import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce.ts";
import type { TripSort, TripStatus } from "@/types/tripsTypes";
import { useSearchParams } from "react-router";

const TRIP_STATUSES: TripStatus[] = ["closed", "pending", "planned", "cancelled"];
const TRIP_SORTS: TripSort[] = ["price", "-price", "created_at", "-created_at"];

const getValidPage = (page: string | null) => {
    const parsedPage = Number(page);

    return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
};

const getValidStatus = (status: string | null) => {
    return TRIP_STATUSES.includes(status as TripStatus) ? (status as TripStatus) : undefined;
};

const getValidSort = (sort: string | null) => {
    return TRIP_SORTS.includes(sort as TripSort) ? (sort as TripSort) : undefined;
};

export const useTripsFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = getValidPage(searchParams.get("page"));
    const status = getValidStatus(searchParams.get("status"));
    const sort = getValidSort(searchParams.get("sort"));
    const urlSearch = searchParams.get("search")?.trim() || "";
    const [searchInput, setSearchInput] = useState(urlSearch);
    const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch);
    const debouncedSearch = useDebounce(searchInput.trim(), 500);

    if (urlSearch !== lastUrlSearch) {
        setLastUrlSearch(urlSearch);
        setSearchInput(urlSearch);
    }

    const updateSearchParams = useCallback(
        (updates: Record<string, string | undefined>, shouldResetPage = true) => {
            setSearchParams(
                currentParams => {
                    const nextParams = new URLSearchParams(currentParams);

                    Object.entries(updates).forEach(([key, value]) => {
                        if (value) {
                            nextParams.set(key, value);
                            return;
                        }

                        nextParams.delete(key);
                    });

                    if (shouldResetPage) {
                        nextParams.delete("page");
                    }

                    return nextParams;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const setPageParam = (nextPage: number) => {
        updateSearchParams(
            {
                page: nextPage > 1 ? nextPage.toString() : undefined,
            },
            false
        );
    };

    useEffect(() => {
        if (debouncedSearch === urlSearch) return;

        updateSearchParams({
            search: debouncedSearch || undefined,
        });
    }, [debouncedSearch, updateSearchParams, urlSearch]);

    const goToPreviousPage = () => setPageParam(page - 1);
    const goToNextPage = () => setPageParam(page + 1);

    const changeStatus = (nextStatus?: TripStatus) => {
        updateSearchParams({
            status: nextStatus,
        });
    };

    const changeSort = (nextSort?: TripSort) => {
        updateSearchParams({
            sort: nextSort,
        });
    };

    const changeSearchInput = (searchValue: string) => {
        setSearchInput(searchValue);
    };

    return {
        page,
        status,
        sort,
        search: urlSearch,
        searchInput,
        changeStatus,
        changeSort,
        changeSearchInput,
        goToPreviousPage,
        goToNextPage,
    };
};
