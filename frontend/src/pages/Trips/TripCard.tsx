import { cancelTrip, getTrip } from "@/api/trips";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Spinner } from "@/components/Spinner/Spinner";
import { TripAttachmentsSection } from "@/components/Trips/TripAttachmentsSection";
import { TripTimeline } from "@/components/Trips/TripTimeline";
import { tripEventsQueryKey } from "@/hooks/useTripEvents";
import { formatCurrency, formatDateTime, formatNullableValue } from "@/libs/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

type TripActionErrorResponse = {
    message?: string;
};

export const TripCard = () => {
    const { tripId } = useParams();
    const numericTripId = Number(tripId);
    const isValidTripId = Number.isInteger(numericTripId) && numericTripId > 0;
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    const {
        data: trip,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["trip", numericTripId],
        queryFn: () => getTrip(numericTripId),
        enabled: isValidTripId,
    });

    const cancelMutation = useMutation({
        mutationFn: () => cancelTrip(numericTripId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["trip", numericTripId],
            });
            queryClient.invalidateQueries({
                queryKey: tripEventsQueryKey(numericTripId),
            });
            queryClient.invalidateQueries({ queryKey: ["trips"] });
            queryClient.invalidateQueries({ queryKey: ["drivers"] });
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
            setIsCancelConfirmOpen(false);
        },
    });

    if (!isValidTripId) {
        return <div className="error-message">Invalid trip ID.</div>;
    }
    if (isLoading) return <Spinner text="Wait. Loading trip details..." />;
    if (error) return <div className="error-message">{error.message}</div>;
    if (!trip) return <div className="error-message">Trip not found</div>;

    const canCancel = trip.status === "planned" || trip.status === "pending";

    return (
        <div className="trip-page">
            <header className="page-header trip-page__header">
                <div>
                    <p>Trip #{trip.id}</p>
                    <h1>{trip.title}</h1>
                </div>

                <div className="trip-page__actions">
                    <Link
                        className="create-link trip-page__back"
                        to="/trips"
                    >
                        <span aria-hidden="true">↩️</span> Back to trips
                    </Link>
                    <button
                        className="entity-action entity-action--trip entity-action--edit"
                        type="button"
                        onClick={() => navigate(`/trips/${trip.id}/edit`)}
                    >
                        Edit trip
                    </button>
                    {canCancel && (
                        <button
                            className="trip-details-cancel"
                            type="button"
                            disabled={cancelMutation.isPending}
                            onClick={() => setIsCancelConfirmOpen(true)}
                        >
                            {cancelMutation.isPending ? "Cancelling..." : "Cancel trip"}
                        </button>
                    )}
                </div>
            </header>

            {cancelMutation.isSuccess && <p className="success-message">{cancelMutation.data.message}</p>}
            {cancelMutation.isError && (
                <p className="error-message">
                    {axios.isAxiosError<TripActionErrorResponse>(cancelMutation.error)
                        ? (cancelMutation.error.response?.data.message ?? cancelMutation.error.message)
                        : cancelMutation.error.message}
                </p>
            )}

            <section className="trip-page__section">
                <h2>Trip details</h2>
                <dl className="trip-details-grid">
                    <div>
                        <dt>Status</dt>
                        <dd>{trip.status}</dd>
                    </div>
                    <div>
                        <dt>Distance</dt>
                        <dd>{formatNullableValue(trip.distance)}</dd>
                    </div>
                    <div>
                        <dt>Price</dt>
                        <dd>{formatCurrency(trip.price)}</dd>
                    </div>
                    <div>
                        <dt>Created</dt>
                        <dd>
                            {formatDateTime(trip.created_at, {
                                hour12: false,
                                locale: "en-GB",
                                timeZone: "Europe/Kiev",
                            })}
                        </dd>
                    </div>
                    <div>
                        <dt>Driver ID</dt>
                        <dd>{trip.driver_id}</dd>
                    </div>
                    <div>
                        <dt>Vehicle ID</dt>
                        <dd>{trip.vehicle_id}</dd>
                    </div>
                    <div>
                        <dt>Client ID</dt>
                        <dd>{trip.client_id}</dd>
                    </div>
                </dl>
            </section>

            <section className="trip-page__section">
                <h2>Client</h2>
                {trip.client ? (
                    <dl className="trip-details-grid">
                        <div>
                            <dt>Name</dt>
                            <dd>{trip.client.name}</dd>
                        </div>
                        <div>
                            <dt>Type</dt>
                            <dd>{trip.client.type}</dd>
                        </div>
                        <div>
                            <dt>Email</dt>
                            <dd>{trip.client.email ?? "-"}</dd>
                        </div>
                        <div>
                            <dt>Address</dt>
                            <dd>{trip.client.address ?? "-"}</dd>
                        </div>
                        <div>
                            <dt>{trip.client.phones?.length > 1 ? "Phones" : "Phone"}</dt>
                            <dd>
                                {trip.client.phones?.length ? (
                                    trip.client.phones.map(phone => {
                                        const phoneNumber = phone.phone_number ?? phone.phone;

                                        return (
                                            <div key={`${phoneNumber}-${phone.label ?? ""}`}>
                                                {phone.label ? `${phoneNumber} [${phone.label}]` : phoneNumber}
                                            </div>
                                        );
                                    })
                                ) : (
                                    "-"
                                )}
                            </dd>
                        </div>
                    </dl>
                ) : (
                    <p className="trip-details-empty">No client data.</p>
                )}
            </section>

            <section className="trip-page__section">
                <h2>Driver</h2>
                {trip.driver ? (
                    <dl className="trip-details-grid">
                        <div>
                            <dt>Name</dt>
                            <dd>{trip.driver.name}</dd>
                        </div>
                        <div>
                            <dt>Phone</dt>
                            <dd>{trip.driver.phone_number}</dd>
                        </div>
                        <div>
                            <dt>Status</dt>
                            <dd>{trip.driver.status === "on_trip" ? "on trip" : trip.driver.status}</dd>
                        </div>
                    </dl>
                ) : (
                    <p className="trip-details-empty">No driver data.</p>
                )}
            </section>

            <section className="trip-page__section">
                <h2>Vehicle</h2>
                {trip.vehicle ? (
                    <dl className="trip-details-grid">
                        <div>
                            <dt>Brand</dt>
                            <dd>{trip.vehicle.brand}</dd>
                        </div>
                        <div>
                            <dt>Model</dt>
                            <dd>{trip.vehicle.model}</dd>
                        </div>
                        <div>
                            <dt>License plate</dt>
                            <dd>{trip.vehicle.license_plate}</dd>
                        </div>
                        <div>
                            <dt>Year</dt>
                            <dd>{formatNullableValue(trip.vehicle.year)}</dd>
                        </div>
                    </dl>
                ) : (
                    <p className="trip-details-empty">No vehicle data.</p>
                )}
            </section>
            <section className="trip-page__section">
                <TripAttachmentsSection tripId={trip.id} />
            </section>
            <TripTimeline tripId={trip.id} />
            <ConfirmModal
                isOpen={isCancelConfirmOpen}
                title="Cancel trip?"
                message={`Trip "${trip.title}" will be cancelled and the driver will become available.`}
                confirmText="Cancel trip"
                onConfirm={() => cancelMutation.mutate()}
                onCancel={() => setIsCancelConfirmOpen(false)}
            />
        </div>
    );
};
