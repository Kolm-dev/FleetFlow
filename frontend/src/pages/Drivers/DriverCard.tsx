import { deleteDriver, getDriverDetails } from "@/api/drivers";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner/Spinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { driverStatusStyles } from "@/components/Drivers/driverStatusStyles";
import { tripStatusStyles } from "@/components/Trips/tripStatusStyles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBackendErrorMessage } from "@/libs/errors";
import { formatCurrency, formatDateOnly, formatNumber, formatNumberWithSuffix, getValidPage } from "@/libs/utils";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    ArrowUpRight,
    BarChart3,
    CalendarDays,
    CarFront,
    ChevronRight,
    CircleDollarSign,
    Hash,
    MapPin,
    Pencil,
    Phone,
    Route,
    Trash2,
    Truck,
    UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";

const DRIVER_PHOTO_PLACEHOLDER = "/icons/non-photo.svg";

export const DriverCard = () => {
    const { driverId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const page = getValidPage(searchParams.get("page"));
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";
    const { mutate, isError, error, isPending, isSuccess } = useMutation({
        mutationFn: (id: number) => deleteDriver(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
    });
    const {
        isLoading,
        isFetching,
        data,
        error: driverError,
    } = useQuery({
        enabled: !!driverId,
        queryKey: ["driver", driverId, { page, from, to }],
        queryFn: () =>
            getDriverDetails(parseInt(driverId as string), { page, from: from || undefined, to: to || undefined }),
        placeholderData: keepPreviousData,
    });
    const driver = data?.driver;
    const statistics = data?.statistics;
    const closedTrips = data?.closed_trips;
    const currentTrip = data?.current_trip;

    const goToPage = (nextPage: number) =>
        setSearchParams(currentParams => {
            const nextParams = new URLSearchParams(currentParams);
            nextParams.set("page", nextPage.toString());
            return nextParams;
        });

    const changeDateFilter = (name: "from" | "to", value: string) =>
        setSearchParams(currentParams => {
            const nextParams = new URLSearchParams(currentParams);
            if (value) nextParams.set(name, value);
            else nextParams.delete(name);
            nextParams.delete("page");
            return nextParams;
        });

    const handleConfirmDelete = () => {
        if (!driverId) return;
        setIsDeleteConfirmOpen(false);
        mutate(parseInt(driverId));
    };

    if (isSuccess) {
        return (
            <SuccessMessage
                tag="driver"
                successText={`${driver?.name} - ${driver?.phone_number} was successfully deleted. Redirecting to drivers list shortly.`}
                onComplete={() => navigate("/drivers")}
            />
        );
    }

    return (
        <main className="mx-auto grid w-full max-w-7xl gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-6">
            {isError && <ErrorMessage messages={getBackendErrorMessage(error, "Could not delete driver.")} />}
            {driverError && (
                <ErrorMessage
                    messages={driverError.message}
                    fallbackMessage="Could not load driver."
                />
            )}
            {isLoading && <Spinner />}
            {!isLoading && !driver && !driverError && <ErrorMessage messages="Driver not found" />}

            {driver && statistics && closedTrips && (
                <>
                    <header className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between sm:pb-5">
                        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                            <img
                                className="size-20 shrink-0 rounded-xl border bg-muted object-cover sm:size-30"
                                src={driver.photo ?? DRIVER_PHOTO_PLACEHOLDER}
                                alt={driver.photo ? driver.name : "No driver photo"}
                            />
                            <div className="min-w-0">
                                <nav
                                    className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"
                                    aria-label="Breadcrumb"
                                >
                                    <Link
                                        className="inline-flex items-center gap-1 hover:text-foreground"
                                        to="/drivers"
                                    >
                                        <ArrowLeft className="size-4" />
                                        Drivers
                                    </Link>
                                    <ChevronRight className="size-4" />
                                    <span className="truncate text-foreground">{driver.name}</span>
                                </nav>
                                <h1 className="wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl">
                                    {driver.name}
                                </h1>
                                <span
                                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${driverStatusStyles[driver.status].badge}`}
                                >
                                    {driverStatusStyles[driver.status].label}
                                </span>
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                    <a
                                        className="inline-flex items-center gap-2 text-foreground hover:underline"
                                        href={`tel:${driver.phone_number}`}
                                    >
                                        <Phone className="size-4" />
                                        {driver.phone_number}
                                    </a>
                                    <span className="inline-flex items-center gap-2">
                                        <Hash className="size-4" />
                                        ID {driver.id}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <CalendarDays className="size-4" />
                                        Joined {formatDateOnly(driver.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full gap-2 sm:w-auto">
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                onClick={() => navigate(`/drivers/${driverId}/edit`)}
                            >
                                <Pencil />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1 sm:flex-none"
                                disabled={isPending}
                                onClick={() => setIsDeleteConfirmOpen(true)}
                            >
                                <Trash2 />
                                {isPending ? "Deleting…" : "Delete"}
                            </Button>
                        </div>
                    </header>

                    <section
                        className="grid gap-3 sm:grid-cols-3"
                        aria-label="Driver statistics"
                    >
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                                <span className="rounded-xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    <BarChart3 />
                                </span>
                                <div>
                                    <p className="text-sm text-muted-foreground">Completed trips</p>
                                    <strong className="text-xl font-semibold">
                                        {formatNumber(statistics.closed_trips_count)}
                                    </strong>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                                <span className="rounded-xl bg-green-100 p-3 text-green-700 dark:bg-green-950 dark:text-green-300">
                                    <MapPin />
                                </span>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total distance</p>
                                    <strong className="text-xl font-semibold">
                                        {formatNumber(statistics.total_distance)} km
                                    </strong>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                                <span className="rounded-xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                    <CircleDollarSign />
                                </span>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total earnings</p>
                                    <strong className="text-xl font-semibold">
                                        {formatCurrency(statistics.total_earnings)}
                                    </strong>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="grid items-stretch gap-4 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="size-5" />
                                    Current trip
                                </CardTitle>
                                {currentTrip && (
                                    <Button
                                        render={<Link to={`/trips/${currentTrip.id}`} />}
                                        variant="default"
                                        size="sm"
                                        className="w-fit shrink-0 whitespace-nowrap hover:opacity-90"
                                    >
                                        View trip
                                        <ArrowUpRight aria-hidden="true" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {currentTrip ? (
                                    <Link
                                        to={`/trips/${currentTrip.id}`}
                                        className="block rounded-xl border p-4 transition-colors hover:bg-muted/40"
                                    >
                                        <h3 className="font-semibold flex items-center gap-2 justify-between">
                                            {currentTrip.title}
                                            <span
                                                className={`inline-flex rounded px-3 py-1 text-xs font-semibold ${tripStatusStyles[currentTrip.status].badge}`}
                                            >
                                                {currentTrip.status}
                                            </span>
                                        </h3>

                                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                            {currentTrip.started_at && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CalendarDays className="size-4" />
                                                    {formatDateOnly(currentTrip.started_at)}
                                                </span>
                                            )}
                                            {currentTrip.distance != null && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Route className="size-4" />
                                                    {formatNumberWithSuffix(currentTrip.distance, " km")}
                                                </span>
                                            )}
                                            {currentTrip.price != null && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CircleDollarSign className="size-4" />
                                                    {formatCurrency(currentTrip.price)}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No current trip</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserRound className="size-5" />
                                    Driver details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid gap-3 text-sm">
                                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                                        <dt className="text-muted-foreground">Status</dt>
                                        <dd className="m-0 font-medium">{driverStatusStyles[driver.status].label}</dd>
                                    </div>
                                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                                        <dt className="text-muted-foreground">Phone number</dt>
                                        <dd className="m-0 font-medium">{driver.phone_number}</dd>
                                    </div>
                                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                                        <dt className="text-muted-foreground">ID</dt>
                                        <dd className="m-0 font-medium">{driver.id}</dd>
                                    </div>
                                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                                        <dt className="text-muted-foreground">Joined</dt>
                                        <dd className="m-0 font-medium">{formatDateOnly(driver.created_at)}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CarFront className="size-5" />
                                    Assigned vehicles ({driver.vehicles.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {driver.vehicles.length ? (
                                    <ul className="grid gap-2">
                                        {driver.vehicles.map(vehicle => (
                                            <li key={vehicle.id}>
                                                <Link
                                                    className="flex min-w-0 items-center gap-3 rounded-xl border p-2.5 transition-colors hover:bg-muted/40"
                                                    to={`/vehicles/${vehicle.id}`}
                                                >
                                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                        <CarFront className="size-6 text-muted-foreground" />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-semibold">
                                                            {vehicle.brand} {vehicle.model}
                                                        </span>
                                                        <span className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                                                            <span>{vehicle.license_plate}</span>
                                                            <span>·</span>
                                                            <span>{vehicle.year ?? "Year not specified"}</span>
                                                        </span>
                                                    </span>
                                                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No assigned vehicles</p>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    <Card>
                        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Route className="size-5" />
                                Trip history ({closedTrips.total})
                            </CardTitle>
                            <div className="flex flex-row flex-wrap items-end justify-center gap-3 text-sm sm:justify-end">
                                <label
                                    className="w-36 gap-1 text-center text-muted-foreground"
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        marginBottom: 0,
                                    }}
                                >
                                    From
                                    <input
                                        className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                        max={to || undefined}
                                        type="date"
                                        value={from}
                                        onChange={event => changeDateFilter("from", event.currentTarget.value)}
                                    />
                                </label>
                                <label
                                    className="w-36 gap-1 text-center text-muted-foreground"
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        marginBottom: 0,
                                    }}
                                >
                                    To
                                    <input
                                        className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                        min={from || undefined}
                                        type="date"
                                        value={to}
                                        onChange={event => changeDateFilter("to", event.currentTarget.value)}
                                    />
                                </label>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isFetching && !isLoading && (
                                <p
                                    className="mb-2 text-sm text-muted-foreground"
                                    aria-live="polite"
                                >
                                    Updating trips...
                                </p>
                            )}
                            {closedTrips.data.length ? (
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full min-w-[680px] text-left text-sm">
                                        <thead className="bg-muted/60 text-xs text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Date</th>
                                                <th className="px-4 py-3 font-medium">Trip</th>
                                                <th className="px-4 py-3 font-medium">Distance</th>
                                                <th className="px-4 py-3 font-medium">Earnings</th>
                                                <th className="px-4 py-3 font-medium">Vehicle</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {closedTrips.data.map(trip => (
                                                <tr
                                                    key={trip.id}
                                                    className="hover:bg-muted/30"
                                                >
                                                    <td className="whitespace-nowrap px-4 py-3">
                                                        {trip.started_at ? formatDateOnly(trip.started_at) : "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            className="font-medium hover:underline"
                                                            to={`/trips/${trip.id}`}
                                                        >
                                                            {trip.title}
                                                        </Link>
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3">
                                                        {formatNumberWithSuffix(trip.distance, " km")}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3">
                                                        {trip.price === null ? "—" : formatCurrency(trip.price)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {trip.vehicle
                                                            ? `${trip.vehicle.brand} ${trip.vehicle.model}`
                                                            : "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                                                            Closed
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            aria-label={`View ${trip.title}`}
                                                            className="text-muted-foreground hover:text-foreground"
                                                            to={`/trips/${trip.id}`}
                                                        >
                                                            <ChevronRight className="size-4" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">No closed trips found</p>
                            )}
                            <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="m-0 text-sm text-muted-foreground">
                                    {closedTrips.data.length > 0
                                        ? `Showing ${(closedTrips.current_page - 1) * closedTrips.per_page + 1}–${(closedTrips.current_page - 1) * closedTrips.per_page + closedTrips.data.length}`
                                        : "Showing 0"}{" "}
                                    of {formatNumber(closedTrips.total)} trips
                                </p>
                                <Pagination
                                    page={closedTrips.current_page}
                                    lastPage={closedTrips.last_page}
                                    isFetching={isFetching}
                                    onPreviousPage={() => goToPage(closedTrips.current_page - 1)}
                                    onNextPage={() => goToPage(closedTrips.current_page + 1)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <ConfirmModal
                        isOpen={isDeleteConfirmOpen}
                        title="Delete driver?"
                        message={`Driver "${driver.name}" will be permanently deleted.`}
                        confirmText="Delete driver"
                        isConfirming={isPending}
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setIsDeleteConfirmOpen(false)}
                    />
                </>
            )}
        </main>
    );
};
