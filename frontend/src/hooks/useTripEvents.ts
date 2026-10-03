import { getTripEvents } from "@/api/trips";
import { useQuery } from "@tanstack/react-query";

export const tripEventsQueryKey = (tripId: number) => ["trip-events", tripId] as const;

export const useTripEvents = (tripId: number) => {
    return useQuery({
        queryKey: tripEventsQueryKey(tripId),
        queryFn: () => getTripEvents(tripId),
        enabled: Number.isInteger(tripId) && tripId > 0,
    });
};
