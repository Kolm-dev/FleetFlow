import { getDrivers } from "@/api/drivers";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner/Spinner";
import { CreateEntityButton } from "@/components/shared/CreateEntityButton";
import { driverStatusStyles } from "@/components/Drivers/driverStatusStyles";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { getValidPage } from "@/libs/utils";
import type { DriverStatus } from "@/types/driversTypes";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

const DRIVER_PHOTO_PLACEHOLDER = "/icons/non-photo.svg";
const DRIVER_STATUSES: DriverStatus[] = ["available", "on_trip", "unavailable"];

const handlerStatus = (status: DriverStatus) => {
    if (status == "on_trip") {
        return "on trip";
    }
    return status;
};

export const DriversList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const status = searchParams.get("status") as DriverStatus;
    const urlSearch = searchParams.get("search")?.trim() ?? "";
    const page = getValidPage(searchParams.get("page"));
    const [searchInput, setSearchInput] = useState(urlSearch);
    const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch);
    const debouncedSearch = useDebounce(searchInput.trim(), 500);

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
        error,
        data: response,
    } = useQuery({
        queryKey: ["drivers", { status, search: urlSearch, page }],
        queryFn: () =>
            getDrivers({
                status: status || undefined,
                search: urlSearch || undefined,
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
                    <h2>Drivers</h2>
                    <p>Total drivers: {response?.total ?? drivers.length}</p>
                </div>
                <CreateEntityButton entity="driver" to="/drivers/create" />
            </header>

            <div className="entity-search mb-4 grid w-full gap-3 rounded-lg border bg-card p-3 sm:grid-cols-2 sm:gap-4 sm:p-4">
                <label className="grid w-full max-w-full gap-1.5 text-sm font-medium text-foreground">
                    Search drivers
                    <input
                        className="mt-0 h-10 w-full min-w-0 max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        type="search"
                        value={searchInput}
                        placeholder="Name, phone number or ID"
                        onChange={(event) => setSearchInput(event.currentTarget.value)}
                    />
                </label>
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
            <div className="drivers-list">
                {drivers.length > 0 ? (
                    drivers.map((driver, index) => (
                        <article className="driver-card" key={driver.id}>
                            <img
                                className="driver-card__photo"
                                src={driver.photo ?? DRIVER_PHOTO_PLACEHOLDER}
                                alt={driver.photo ? driver.name : ""}
                            />

                            <div className="driver-card__content">
                                <div className="driver-card__header">
                                    <span className="driver-card__number">
                                    #{(response.current_page - 1) * response.per_page + index + 1}
                                    </span>
                                    <h2>{driver.name}</h2>
                                </div>

                                <dl className="driver-card__details">
                                    <div>
                                        <dt>Phone</dt>
                                        <dd>{driver.phone_number}</dd>
                                    </div>
                                    <div>
                                        <dt>Status</dt>
                                        <dd>{handlerStatus(driver.status)}</dd>
                                    </div>
                                </dl>

                                <button
                                    className="entity-action entity-action--driver entity-action--details driver-card__button"
                                    type="button"
                                    onClick={() =>
                                        navigate(`/drivers/${driver.id}`)
                                    }
                                >
                                    View profile
                                </button>
                            </div>
                        </article>
                    ))
                ) : (
                    <p className="empty-state">No drivers found</p>
                )}
            </div>

            {response && (
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
