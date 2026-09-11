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

            <br />
            <button onClick={() => navigate(`/trips/${trip.id}/edit`)}>
                Edit
            </button>
            {trip.status !== "closed" && (
                <button onClick={() => onClose(trip.id)}>Close</button>
            )}
            <button onClick={() => onDetailsClick()}>Details</button>
        </div>
    );
};
