import { getDrivers } from "@/api/drivers";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";
import { useDebounce } from "@/hooks/useDebounce";
import { getValidPage } from "@/libs/utils";
import type { DriverStatus } from "@/types/driversTypes";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router";

const DRIVER_PHOTO_PLACEHOLDER = "/icons/non-photo.svg";

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
                <NavLink className="create-link entity-action--create" to="/drivers/create">
                    Create driver
                </NavLink>
            </header>

            <div className="entity-search">
                <label>
                    Search drivers
                    <input
                        type="search"
                        value={searchInput}
                        placeholder="Name, phone number or ID"
                        onChange={(event) => setSearchInput(event.currentTarget.value)}
                    />
                </label>
                {isFetching && !isLoading && <span>Searching...</span>}
            </div>

            <div className="drivers-status-actions">
                <button onClick={() => changeStatus()}>All</button>
                <button onClick={() => changeStatus("available")}>
                    Available
                </button>
                <button onClick={() => changeStatus("on_trip")}>On trip</button>
                <button onClick={() => changeStatus("unavailable")}>
                    Unavailable
                </button>
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
