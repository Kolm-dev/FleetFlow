import { getVehicles } from "@/api/vehicles";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";
import { useDebounce } from "@/hooks/useDebounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router";

const getValidPage = (value: string | null) => {
    const page = Number(value);
    return Number.isInteger(page) && page > 0 ? page : 1;
};

const VehiclesList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
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

    const { data, isPending, isFetching, isError, error } = useQuery({
        queryKey: ["vehicles", { search: urlSearch, page }],
        queryFn: () =>
            getVehicles({ search: urlSearch || undefined, page }),
        placeholderData: keepPreviousData,
    });

    if (isPending) return <Spinner text="Loading vehicles..." />;
    if (isError) {
        return <div>Failed to load vehicles: {error.message}</div>;
    }

    const vehicles = data.vehicles;

    return (
        <div>
            <header className="page-header entity-list-header">
                <div>
                    <h2>Vehicles</h2>
                    <p>Total found: {data.total}</p>
                </div>
                <NavLink className="create-link entity-action--create" to="/vehicles/create">
                    Create vehicle
                </NavLink>
            </header>

            <div className="entity-search">
                <label>
                    Search vehicles
                    <input
                        type="search"
                        value={searchInput}
                        placeholder="Brand, model, license plate or ID"
                        onChange={(event) => setSearchInput(event.currentTarget.value)}
                    />
                </label>
                {isFetching && !isPending && <span>Searching...</span>}
            </div>

            <div className="vehicles-list">
                {vehicles.length > 0 ? (
                    vehicles.map((vehicle, index) => (
                        <NavLink
                            className="vehicle-card"
                            key={vehicle.id}
                            to={`/vehicles/${vehicle.id}`}
                        >
                            <div className="vehicle-card__header">
                                <span className="vehicle-card__number">
                                    #{(data.current_page - 1) * data.per_page + index + 1}
                                </span>
                                <h2>
                                    {vehicle.brand} {vehicle.model}
                                </h2>
                            </div>

                            <dl className="vehicle-card__details">
                                <div>
                                    <dt>License plate</dt>
                                    <dd>{vehicle.license_plate}</dd>
                                </div>
                                <div>
                                    <dt>Year</dt>
                                    <dd>{vehicle.year ?? "Not specified"}</dd>
                                </div>
                            </dl>
                        </NavLink>
                    ))
                ) : (
                    <p className="empty-state">No vehicles found</p>
                )}
            </div>

            <Pagination
                page={data.current_page}
                lastPage={data.last_page}
                isFetching={isFetching}
                onPreviousPage={() => goToPage(data.current_page - 1)}
                onNextPage={() => goToPage(data.current_page + 1)}
            />
        </div>
    );
};

export default VehiclesList;
