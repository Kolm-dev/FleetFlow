import { tripStatusStyles } from "@/components/Trips/tripStatusStyles";
import type { DriverStatus } from "@/types/driversTypes";

export const driverStatusStyles: Record<DriverStatus, { label: string; badge: string }> = {
    on_trip: { label: "On trip", badge: tripStatusStyles.pending.badge },
    available: { label: "Available", badge: tripStatusStyles.closed.badge },
    unavailable: { label: "Unavailable", badge: tripStatusStyles.planned.badge },
};
