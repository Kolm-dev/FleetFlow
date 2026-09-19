import type { Trip } from "@/types/tripsTypes";
import { useNavigate } from "react-router";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useState } from "react";

type TripCardProps = {
    trip: Trip;
    onStart: (id: number) => void;
    onClose: (id: number) => void;
    onDelete: (id: number) => void;
    onDetailsClick: () => void;
};

const formatValue = (value: number | null) => value ?? "-";

export const TripCard = ({ onStart, onClose, onDelete, onDetailsClick, trip }: TripCardProps) => {
    const navigate = useNavigate();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const isActiveTrip = trip.status === "pending";

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
                Distance: {formatValue(trip.distance)}km | Price:
                {formatValue(trip.price)}
            </p>

            <div className="trip-card__actions">
                <button
                    className="button-control"
                    onClick={() => navigate(`/trips/${trip.id}/edit`)}
                >
                    Edit
                </button>
                {trip.status === "planned" && (
                    <button
                        className="button-control"
                        onClick={() => onStart(trip.id)}
                    >
                        Start
                    </button>
                )}
                {trip.status !== "closed" && (
                    <button
                        className="button-control"
                        onClick={() => onClose(trip.id)}
                    >
                        Close
                    </button>
                )}
                <button
                    className="button-control"
                    onClick={onDetailsClick}
                >
                    Details
                </button>
                <button
                    className="button-control"
                    disabled={isActiveTrip}
                    title={isActiveTrip ? "Active trips cannot be deleted." : "Delete trip"}
                    onClick={() => setIsDeleteConfirmOpen(true)}
                >
                    Delete
                </button>
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
