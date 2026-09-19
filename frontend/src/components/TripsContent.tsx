import { TripCard } from "@/components/TripCard";
import type { Trip } from "@/types/tripsTypes";

type TripsContentProps = {
    trips: Trip[];
    onCloseTrip: (tripId: number) => void;
    onDetailsClick: (tripId: number) => void;
    onStartTrip: (tripId: number) => void;
};

export const TripsContent = ({ trips, onCloseTrip, onStartTrip, onDetailsClick }: TripsContentProps) => {
    if (trips.length === 0) {
        return <p className="empty-state">No trips found</p>;
    }

    return trips.map(trip => (
        <TripCard
            onStart={() => onStartTrip(trip.id)}
            onClose={() => onCloseTrip(trip.id)}
            key={trip.id}
            trip={trip}
            onDetailsClick={() => onDetailsClick(trip.id)}
        />
    ));
};
