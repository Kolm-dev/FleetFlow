import { ConfirmModal } from "@/components/ConfirmModal";
import {
    formatCurrency,
    formatDateTime,
    formatNullableValue,
} from "@/libs/utils";
import type { Trip } from "@/types/tripsTypes";
import { useState } from "react";

export type TripDetailsType = {
    onClose: () => void;
    onCancelled: () => void;
    trip: Trip;
};

const TripDetailsPanel = ({ onClose, onCancelled, trip }: TripDetailsType) => {
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    const canCancel = trip.status !== "closed" && trip.status !== "cancelled";

    const handleConfirmCancel = () => {
        setIsCancelConfirmOpen(false);
        onCancelled();
    };

    return (
        <div className="trip-details-overlay">
            <div className="trip-details-modal">
                <div className="trip-details-header">
                    <div>
                        <p className="trip-details-label">Trip #{trip.id} </p>

                        <div className="trip-details-title-row">
                            <h2>{trip.title}</h2>
                            {canCancel && (
                                <button
                                    type="button"
                                    className="trip-details-cancel"
                                    onClick={() =>
                                        setIsCancelConfirmOpen(true)
                                    }
                                >
                                    Cancel trip
                                </button>
                            )}
                        </div>
                    </div>
                    <button className="trip-details-close" onClick={onClose}>
                        Close
                    </button>
                </div>

                <div className="trip-details-section">
                    <h3>Trip details</h3>
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
                    </dl>
                </div>

                <div className="trip-details-section">
                    <h3>Driver</h3>
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
                                <dd>{trip.driver.status}</dd>
                            </div>
                        </dl>
                    ) : (
                        <p className="trip-details-empty">No driver data.</p>
                    )}
                </div>

                <div className="trip-details-section">
                    <h3>Vehicle</h3>
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
                </div>

                <ConfirmModal
                    isOpen={isCancelConfirmOpen}
                    title="Cancel trip?"
                    message={`Trip "${trip.title}" will be cancelled and the driver will become available.`}
                    confirmText="Cancel trip"
                    onConfirm={handleConfirmCancel}
                    onCancel={() => setIsCancelConfirmOpen(false)}
                />
            </div>
        </div>
    );
};

export default TripDetailsPanel;
