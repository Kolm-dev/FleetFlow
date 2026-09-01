import type { Trip } from "@/types/tripsTypes";
import { useNavigate } from "react-router";

type TripCardProps = {
    trip: Trip;
    onClose: (id: number) => void;
    onDetailsClick: () => void;
};

const formatValue = (value: number | null) => value ?? "-";

// const getDriverName = (trip: Trip) => trip.driver?.name ?? "-";

// const getVehicleName = (trip: Trip) =>
//     trip.vehicle
//         ? `${trip.vehicle.brand} ${trip.vehicle.model}`
//         : trip.vehicle_id;

export const TripCard = ({ onClose, onDetailsClick, trip }: TripCardProps) => {
    const navigate = useNavigate();
    return (
        <div>
            <p>
                {trip.title} - {trip.status}
            </p>
            <p>
                Distance: {formatValue(trip.distance)} | Price:
                {formatValue(trip.price)}
            </p>
            {/* <p>
                Driver: {getDriverName(trip)} | ID: {trip.driver_id} | Vehicle:
                {getVehicleName(trip)}
            </p> */}
            <br />
            <button onClick={() => navigate(`/trips/${trip.id}/edit`)}>
                Edit
            </button>
            <button onClick={() => onClose(trip.id)}>Close</button>
            <button onClick={() => onDetailsClick()}>Details</button>
        </div>
    );
};
