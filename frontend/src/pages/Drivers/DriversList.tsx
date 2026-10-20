import { getDrivers } from "@/api/drivers";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner/Spinner";
import { CreateEntityButton } from "@/components/shared/CreateEntityButton";
import { DriverListCard } from "@/components/Drivers/DriverListCard";
import { driverStatusStyles } from "@/components/Drivers/driverStatusStyles";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { getValidPage } from "@/libs/utils";
import type { DriverStatus } from "@/types/driversTypes";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

const DRIVER_STATUSES: DriverStatus[] = ["available", "on_trip", "unavailable"];

export const DriversList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const status = searchParams.get("status") as DriverStatus;
    const urlSearch = searchParams.get("search")?.trim() ?? "";
    const page = getValidPage(searchParams.get("page"));
    const [searchInput, setSearchInput] = useState(urlSearch);
    const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debouncedSearch = useDebounce(searchInput.trim(), 500);
    const isIdSearch = searchInput.startsWith("#");

    if (urlSearch !== lastUrlSearch) {
        setLastUrlSearch(urlSearch);
        setSearchInput(urlSearch);
    }

    useEffect(() => {
        if (debouncedSearch === urlSearch) return;

        setSearchParams(
            (currentParams) => {
                const nextParams = new URLSearchParams(currentParams);

                if (debouncedSearch) {
                    nextParams.set("search", debouncedSearch);
                } else {
                    nextParams.delete("search");
                }

                nextParams.delete("page");
                return nextParams;
            },
            { replace: true },
        );
    }, [debouncedSearch, setSearchParams, urlSearch]);

    const changeStatus = (status?: DriverStatus) => {
        setSearchParams(
            (currentParams) => {
                const nextParams = new URLSearchParams(currentParams);

                if (status) {
                    nextParams.set("status", status);
                } else {
                    nextParams.delete("status");
                }

                nextParams.delete("page");
                return nextParams;
            },
            { replace: true },
        );
    };

    const toggleIdSearch = () => {
        setSearchInput((current) => {
            if (current.startsWith("#")) return current.slice(1);
            return `#${/^\d*$/.test(current) ? current : ""}`;
        });
        searchInputRef.current?.focus();
    };

    const goToPage = (nextPage: number) => {
        setSearchParams(
            (currentParams) => {
                const nextParams = new URLSearchParams(currentParams);

                if (nextPage > 1) {
                    nextParams.set("page", nextPage.toString());
                } else {
                    nextParams.delete("page");
                }

                return nextParams;
            },
            { replace: true },
        );
    };
    const {
        isError,
        isLoading,
        isFetching,
        isPlaceholderData,
        error,
        data: response,
    } = useQuery({
        queryKey: ["drivers", { status, search: urlSearch, page }],
        queryFn: () =>
            getDrivers({
                status: status || undefined,
                search: urlSearch === "#" ? undefined : urlSearch || undefined,
                page,
            }),
        placeholderData: keepPreviousData,
    });

    if (isLoading) return <Spinner />;
    if (isError) {
        return <div>{error.message}</div>;
    }
    if (!response) return <p className="empty-state">No drivers data.</p>;

    const drivers = response.drivers;

    return (
        <div className="drivers-status-container">
            <header className="page-header entity-list-header">
                <div>
                    <h2 className="m-0 text-xl font-semibold tracking-tight text-foreground">Drivers</h2>
                    <p className="m-0 mt-1 text-sm text-muted-foreground">
                        {isPlaceholderData
                            ? "Loading results..."
                            : `Page ${response.current_page} of ${response.last_page}. Total drivers: ${response.total}`}
                    </p>
                </div>
                <CreateEntityButton entity="driver" to="/drivers/create" />
            </header>

            <div className="entity-search mb-4 grid w-full gap-3 rounded-lg border bg-card p-3 sm:grid-cols-2 sm:gap-4 sm:p-4">
                <div className="w-full max-w-sm">
                    <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="driver-search">
                        Search drivers
                    </label>
                    <div className="flex gap-2">
                        <input
                            ref={searchInputRef}
                            id="driver-search"
                            className="mt-0 h-10 w-full min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            type="search"
                            value={searchInput}
                            placeholder={isIdSearch ? "#20" : "Name or phone number"}
                            aria-describedby="driver-search-hint"
                            onChange={(event) => setSearchInput(event.currentTarget.value)}
                        />
                        <Button
                            className="size-10 shrink-0 text-base"
                            type="button"
                            variant={isIdSearch ? "default" : "outline"}
                            aria-label={isIdSearch ? "Disable ID search" : "Search by exact ID"}
                            aria-pressed={isIdSearch}
                            onClick={toggleIdSearch}
                        >
                            #
                        </Button>
                    </div>
                    <p id="driver-search-hint" className="m-0 mt-1.5 text-xs text-muted-foreground">
                        {isIdSearch ? "Enter digits after # for an exact ID match." : "For an exact ID match, enter #20 or press #."}
                    </p>
                </div>
                {isFetching && !isLoading && <span>Searching...</span>}
            </div>

            <div className="grid w-full grid-cols-2 gap-2 rounded-md border p-3 sm:grid-cols-4" aria-label="Filter drivers by status">
                <Button
                    className={cn(
                        "h-8 w-full min-w-0 border px-1 text-xs sm:px-3 sm:text-sm",
                        !status ? "border-primary bg-primary text-primary-foreground hover:bg-primary/80" : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                    aria-pressed={!status}
                    type="button"
                    variant="outline"
                    onClick={() => changeStatus()}
                >
                    All
                </Button>
                {DRIVER_STATUSES.map((value) => (
                    <Button
                        key={value}
                        className={cn(
                            "h-8 w-full min-w-0 border px-1 text-xs sm:px-3 sm:text-sm",
                            status === value
                                ? driverStatusStyles[value].selectedFilter
                                : driverStatusStyles[value].filter,
                        )}
                        aria-pressed={status === value}
                        type="button"
                        variant="outline"
                        onClick={() => changeStatus(value)}
                    >
                        {driverStatusStyles[value].label}
                    </Button>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isPlaceholderData ? (
                    <p className="col-span-full text-sm text-muted-foreground">Searching...</p>
                ) : drivers.length > 0 ? (
                    drivers.map((driver) => (
                        <DriverListCard
                            key={driver.id}
                            driver={driver}
                        />
                    ))
                ) : (
                    <p className="empty-state col-span-full">No drivers found</p>
                )}
            </div>

            {!isPlaceholderData && (
                <Pagination
                    page={response.current_page}
                    lastPage={response.last_page}
                    isFetching={isFetching}
                    onPreviousPage={() => goToPage(response.current_page - 1)}
                    onNextPage={() => goToPage(response.current_page + 1)}
                />
            )}
        </div>
    );
};
