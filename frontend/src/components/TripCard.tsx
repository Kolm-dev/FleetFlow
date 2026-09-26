import type { Trip } from "@/types/tripsTypes";
import { useNavigate } from "react-router";
import { ConfirmModal } from "@/components/ConfirmModal";
import { formatCurrency, formatNullableValue } from "@/libs/utils";
import { useState } from "react";

type TripCardProps = {
    trip: Trip;
    onStart: (id: number) => void;
    onClose: (id: number) => void;
    onDelete: (id: number) => void;
    onDetailsClick: () => void;
};

export const TripCard = ({ onStart, onClose, onDelete, onDetailsClick, trip }: TripCardProps) => {
    const navigate = useNavigate();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const isActiveTrip = trip.status === "pending";
    const canStart = trip.status === "planned";
    const canClose = trip.status === "pending";

    const handleConfirmDelete = () => {
        onDelete(trip.id);
        setIsDeleteConfirmOpen(false);
    };

    return (
        <div>
            <p>
                {trip.title} - {trip.status}
            </p>
            <p>
                Distance: {formatNullableValue(trip.distance)}km | Price:
                {formatCurrency(trip.price)}
            </p>

            <div className="trip-card__actions">
                {(canStart || canClose) && (
                    <div className="trip-card__action-group trip-card__action-group--controls">
                        {canStart && (
                            <button
                                className="entity-action entity-action--trip entity-action--start"
                                type="button"
                                onClick={() => onStart(trip.id)}
                            >
                                Start
                            </button>
                        )}
                        {canClose && (
                            <button
                                className="entity-action entity-action--trip entity-action--close"
                                type="button"
                                onClick={() => onClose(trip.id)}
                            >
                                Close
                            </button>
                        )}
                    </div>
                )}

                <div className="trip-card__action-group trip-card__action-group--crud">
                    <button
                        className="entity-action entity-action--trip entity-action--details"
                        type="button"
                        onClick={onDetailsClick}
                    >
                        Details
                    </button>
                    <button
                        className="entity-action entity-action--trip entity-action--edit"
                        type="button"
                        onClick={() => navigate(`/trips/${trip.id}/edit`)}
                    >
                        Edit
                    </button>
                    <button
                        className="entity-action entity-action--trip entity-action--delete"
                        type="button"
                        disabled={isActiveTrip}
                        title={isActiveTrip ? "Active trips cannot be deleted." : "Delete trip"}
                        onClick={() => setIsDeleteConfirmOpen(true)}
                    >
                        Delete
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                title="Delete trip?"
                message={`Trip "${trip.title}" will be permanently deleted.`}
                confirmText="Delete trip"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteConfirmOpen(false)}
            />
        </div>
    );
};
