import { tripStatusStyles } from "@/components/Trips/tripStatusStyles";
import type { DriverStatus } from "@/types/driversTypes";

export const driverStatusStyles: Record<DriverStatus, { label: string; badge: string; filter: string; selectedFilter: string }> = {
    on_trip: { label: "On trip", ...tripStatusStyles.pending },
    available: { label: "Available", ...tripStatusStyles.closed },
    unavailable: { label: "Unavailable", ...tripStatusStyles.planned },
};
