import { deleteDriver, getDriverDetails } from "@/api/drivers";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";
import {
    formatCurrency,
    formatNumber,
    formatNumberWithSuffix,
    getValidPage,
} from "@/libs/utils";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";

const DRIVER_PHOTO_PLACEHOLDER = "/icons/non-photo.svg";

export const DriverCard = () => {
    const { driverId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const page = getValidPage(searchParams.get("page"));
    const { mutate, isError, error, isPending, isSuccess } = useMutation({
        mutationFn: (id: number) => deleteDriver(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["drivers"],
            });
        },
    });

    const {
        isLoading,
        isFetching,
        data,
        error: driverError,
    } = useQuery({
        enabled: !!driverId,
        queryKey: ["driver", driverId, { page }],
        queryFn: () => getDriverDetails(parseInt(driverId as string), { page }),
        placeholderData: keepPreviousData,
    });
    const driver = data?.driver;
    const statistics = data?.statistics;
    const closedTrips = data?.closed_trips;

    const goToPage = (nextPage: number) => {
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);
            nextParams.set("page", nextPage.toString());
            return nextParams;
        });
    };

    useEffect(() => {
        if (!isSuccess) return;

        const intervalId = window.setInterval(() => {
            setRedirectCountdown((currentCountdown) => {
                const nextCountdown = Number(
                    (currentCountdown - 0.1).toFixed(1),
                );

                return Math.max(nextCountdown, 0);
            });
        }, 100);

        return () => window.clearInterval(intervalId);
    }, [isSuccess]);

    useEffect(() => {
        if (isSuccess && redirectCountdown <= 0) {
            navigate("/drivers");
        }
    }, [isSuccess, navigate, redirectCountdown]);

    const handleConfirmDelete = () => {
        if (!driverId) return;

        setIsDeleteConfirmOpen(false);
        mutate(parseInt(driverId));
    };

    if (isSuccess) {
        return (
            <div className="success-message">
                <p>
                    {driver?.name} - {driver?.phone_number} was successfully
                    deleted!
                </p>
                <p>
                    Redirecting to drivers list in{" "}
                    {redirectCountdown.toFixed(1)}s
                </p>
            </div>
        );
    }

    return (
        <div>
            {isError && <div>{error.message}</div>}

            {driverError && (
                <p className="error-message">{driverError.message}</p>
            )}

            {isLoading && <Spinner />}

            {!isLoading && !driver && !driverError && (
                <p className="error-message">Driver not found</p>
            )}

            {driver && statistics && closedTrips && (
                <>
                    <div className="page-header">
                        <h1>{driver.name}</h1>
                    </div>

                    <div className="driver-profile">
                        <div className="driver-profile__content">
                            <h2>Driver details</h2>
                            <dl className="driver-profile__details">
                                <div>
                                    <dt>ID</dt>
                                    <dd>{driver.id}</dd>
                                </div>
                                <div>
                                    <dt>Phone number</dt>
                                    <dd>{driver.phone_number}</dd>
                                </div>
                                <div>
                                    <dt>Status</dt>
                                    <dd>
                                        {driver.status === "on_trip"
                                            ? "on trip"
                                            : driver.status}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        <img
                            className="driver-profile__photo"
                            src={driver.photo ?? DRIVER_PHOTO_PLACEHOLDER}
                            alt={driver.photo ? driver.name : "No driver photo"}
                        />
                    </div>

                    <div className="driver-vehicles">
                        <h2>Assigned vehicles - {driver.vehicles.length}</h2>
                        {driver.vehicles.length > 0 ? (
                            <ul className="driver-vehicles__list">
                                {driver.vehicles.map((vehicle) => (
                                    <li
                                        className="driver-vehicles__item"
                                        key={vehicle.id}
                                    >
                                        <Link
                                            className="driver-vehicles__link"
                                            to={`/vehicles/${vehicle.id}`}
                                        >
                                            {vehicle.brand} {vehicle.model}
                                        </Link>
                                        <span className="driver-vehicles__meta">
                                            <span>{vehicle.license_plate}</span>
                                            <span>
                                                {vehicle.year ??
                                                    "Year not specified"}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state">No assigned vehicles</p>
                        )}
                    </div>

                    <div>
                        <h2>Statistics</h2>
                        <div className="driver-statistics">
                            <div className="driver-statistics__item">
                                <span>Completed trips</span>
                                <strong>
                                    {formatNumber(
                                        statistics.closed_trips_count,
                                    )}
                                </strong>
                            </div>
                            <div className="driver-statistics__item">
                                <span>Total distance</span>
                                <strong>
                                    {formatNumber(statistics.total_distance)} km
                                </strong>
                            </div>
                            <div className="driver-statistics__item">
                                <span>Total earnings</span>
                                <strong>
                                    {formatCurrency(statistics.total_earnings)}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2>Closed trips - {closedTrips.total}</h2>
                        {isFetching && !isLoading && (
                            <p className="trips-updating">Updating trips...</p>
                        )}
                        {closedTrips.data.length > 0 ? (
                            <div className="driver-closed-trips">
                                {closedTrips.data.map((trip) => (
                                    <div
                                        className="driver-closed-trip"
                                        key={trip.id}
                                    >
                                        <p>
                                            <strong>{trip.title}</strong>
                                        </p>
                                        <p>
                                            Distance:{" "}
                                            {formatNumberWithSuffix(
                                                trip.distance,
                                                " km",
                                            )}{" "}
                                            | Earnings:{" "}
                                            {trip.price === null
                                                ? "Not specified"
                                                : formatCurrency(trip.price)}
                                        </p>
                                        {trip.vehicle && (
                                            <p>
                                                Vehicle: {trip.vehicle.brand}{" "}
                                                {trip.vehicle.model} (
                                                {trip.vehicle.license_plate})
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-state">
                                No closed trips found
                            </p>
                        )}
                        <Pagination
                            page={closedTrips.current_page}
                            lastPage={closedTrips.last_page}
                            isFetching={isFetching}
                            onPreviousPage={() =>
                                goToPage(closedTrips.current_page - 1)
                            }
                            onNextPage={() =>
                                goToPage(closedTrips.current_page + 1)
                            }
                        />
                    </div>

                    <div>
                        <h2>Actions</h2>
                        <div className="entity-actions">
                            <button
                                className="entity-action entity-action--driver entity-action--edit"
                                type="button"
                                hidden={isSuccess}
                                onClick={() =>
                                    navigate(`/drivers/${driverId}/edit`)
                                }
                            >
                                Edit
                            </button>
                            <button
                                className="entity-action entity-action--driver entity-action--delete"
                                type="button"
                                disabled={isPending}
                                hidden={isSuccess}
                                onClick={() => setIsDeleteConfirmOpen(true)}
                            >
                                {isPending ? (
                                    <Spinner text="DELETING..." />
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                        <ConfirmModal
                            isOpen={isDeleteConfirmOpen}
                            title="Delete driver?"
                            message={`Driver "${driver.name}" will be permanently deleted.`}
                            confirmText="Delete driver"
                            isConfirming={isPending}
                            onConfirm={handleConfirmDelete}
                            onCancel={() => setIsDeleteConfirmOpen(false)}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
