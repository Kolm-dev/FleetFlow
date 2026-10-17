import { getVehicles } from "@/api/vehicles";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner/Spinner";
import { CreateEntityButton } from "@/components/shared/CreateEntityButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { getValidPage } from "@/libs/utils";
import type { VehicleDriverAssignment } from "@/types/vehiclesTypes";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight, Hash, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router";

type DriverAssignmentFilter = VehicleDriverAssignment | "all";

const DRIVER_ASSIGNMENT_OPTIONS: { value: DriverAssignmentFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "assigned", label: "Assigned" },
    { value: "unassigned", label: "Unassigned" },
];

const getDriverAssignmentFilter = (value: string | null): DriverAssignmentFilter => {
    if (value === "assigned" || value === "unassigned") {
        return value;
    }

    return "all";
};

const VehiclesList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch = searchParams.get("search")?.trim() ?? "";
    const driverAssignment = getDriverAssignmentFilter(searchParams.get("driver_assignment"));
    const selectedDriverAssignment = driverAssignment === "all" ? undefined : driverAssignment;
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
            currentParams => {
                const nextParams = new URLSearchParams(currentParams);

                if (debouncedSearch) {
                    nextParams.set("search", debouncedSearch);
                } else {
                    nextParams.delete("search");
                }

                nextParams.delete("page");
                return nextParams;
            },
            { replace: true }
        );
    }, [debouncedSearch, setSearchParams, urlSearch]);

    const changeDriverAssignment = (nextAssignment: DriverAssignmentFilter) => {
        setSearchParams(
            currentParams => {
                const nextParams = new URLSearchParams(currentParams);

                if (nextAssignment === "all") {
                    nextParams.delete("driver_assignment");
                } else {
                    nextParams.set("driver_assignment", nextAssignment);
                }

                nextParams.delete("page");
                return nextParams;
            },
            { replace: true }
        );
    };

    const goToPage = (nextPage: number) => {
        setSearchParams(
            currentParams => {
                const nextParams = new URLSearchParams(currentParams);

                if (nextPage > 1) {
                    nextParams.set("page", nextPage.toString());
                } else {
                    nextParams.delete("page");
                }

                return nextParams;
            },
            { replace: true }
        );
    };

    const { data, isPending, isFetching, isError, error } = useQuery({
        queryKey: ["vehicles", { search: urlSearch, page, driverAssignment: selectedDriverAssignment }],
        queryFn: () =>
            getVehicles({
                search: urlSearch || undefined,
                page,
                driver_assignment: selectedDriverAssignment,
            }),
        placeholderData: keepPreviousData,
    });

    if (isPending) return <Spinner text="Loading vehicles..." />;
    if (isError) {
        return <div>Failed to load vehicles: {error?.message}</div>;
    }

    const vehicles = data.vehicles;

    return (
        <div>
            <header className="page-header entity-list-header">
                <div>
                    <h2>Vehicles</h2>
                    <p>
                        Page {data.current_page} of {data.last_page}. Total vehicles: {data.total}
                    </p>
                </div>
                <CreateEntityButton
                    entity="vehicle"
                    to="/vehicles/create"
                />
            </header>

            <div className="entity-search grid-cols-1 grid gap-4 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-end sm:p-5 mt-3.5">
                <label className="mb-0 grid max-w-none gap-1.5 text-sm font-medium text-foreground">
                    Search vehicles
                    <input
                        className="mt-0 h-10 w-full max-w-none rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                        type="search"
                        value={searchInput}
                        placeholder="Brand, model, license plate or ID"
                        onChange={event => setSearchInput(event.currentTarget.value)}
                    />
                </label>

                <label className="mb-0 grid w-full max-w-none gap-1.5 text-sm font-medium text-foreground">
                    Driver assignment
                    <select
                        className="mt-0 h-10 w-full max-w-none rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                        value={driverAssignment}
                        onChange={event => changeDriverAssignment(event.currentTarget.value as DriverAssignmentFilter)}
                    >
                        {DRIVER_ASSIGNMENT_OPTIONS.map(option => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                {isFetching && !isPending && (
                    <div className="sm:col-span-2">
                        <Spinner text="Searching vehicles..." />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-3 py-4">
                {vehicles.length > 0 ? (
                    vehicles.map((vehicle, index) => (
                        <NavLink
                            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            key={vehicle.id}
                            to={`/vehicles/${vehicle.id}`}
                        >
                            <Card className="h-full gap-0 border-2 border-border bg-card py-0 shadow-sm transition-colors group-hover:border-primary/50 group-hover:bg-accent/30 group-hover:shadow-md">
                                <CardHeader className="p-4 sm:p-5">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                                            #{(data.current_page - 1) * data.per_page + index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="line-clamp-2 text-base leading-snug">
                                                {vehicle.brand} {vehicle.model}
                                            </CardTitle>
                                            <CardDescription className="mt-1.5 flex min-w-0 items-center gap-1.5 font-mono text-sm">
                                                <Hash
                                                    className="size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                <span className="truncate">{vehicle.license_plate}</span>
                                            </CardDescription>
                                        </div>
                                        <ChevronRight
                                            className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-3 rounded-b-xl border-t-2 bg-muted/20 px-4 py-3 sm:px-5">
                                    <div className="flex min-w-0 items-start gap-2">
                                        <CalendarDays
                                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Year</p>
                                            <p className="truncate text-sm font-medium">
                                                {vehicle.year ?? "Not specified"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex min-w-0 items-start gap-2">
                                        <UserRound
                                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Driver</p>
                                            <p className="truncate text-sm font-medium">
                                                {vehicle.driver?.name ?? "Unassigned"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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
