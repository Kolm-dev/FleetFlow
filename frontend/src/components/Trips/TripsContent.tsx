import { TripCard } from "@/components/Trips/TripCard";
import type { Trip } from "@/types/tripsTypes";

type TripsContentProps = {
    trips: Trip[];
    onCancelTrip: (tripId: number) => void;
    onCloseTrip: (tripId: number) => void;
    onDeleteTrip: (tripId: number) => void;
    onDetailsClick: (tripId: number) => void;
    onStartTrip: (tripId: number) => void;
};

export const TripsContent = ({
    trips,
    onCancelTrip,
    onCloseTrip,
    onDeleteTrip,
    onStartTrip,
    onDetailsClick,
}: TripsContentProps) => {
    if (trips.length === 0) {
        return <p className="empty-state">No trips found</p>;
    }

    return trips.map(trip => (
        <TripCard
            onStart={() => onStartTrip(trip.id)}
            onCancel={() => onCancelTrip(trip.id)}
            onClose={() => onCloseTrip(trip.id)}
            onDelete={() => onDeleteTrip(trip.id)}
            key={trip.id}
            trip={trip}
            onDetailsClick={() => onDetailsClick(trip.id)}
        />
    ));
};
