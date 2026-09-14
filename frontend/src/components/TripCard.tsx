import type { Trip } from "@/types/tripsTypes";
import { useNavigate } from "react-router";

type TripCardProps = {
    trip: Trip;
    onClose: (id: number) => void;
    onDetailsClick: () => void;
};

const formatValue = (value: number | null) => value ?? "-";

export const TripCard = ({ onClose, onDetailsClick, trip }: TripCardProps) => {
    const navigate = useNavigate();
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
                {trip.status !== "closed" && (
                    <button
                        className="button-control"
                        onClick={() => onClose(trip.id)}
                    >
                        Close
                    </button>
                )}
                <button className="button-control" onClick={onDetailsClick}>
                    Details
                </button>
            </div>
        </div>
    );
};
