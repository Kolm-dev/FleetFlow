import type { TripStatus } from "@/types/tripsTypes";

type TripsStatusFilterProps = {
    onStatusChange: (status?: TripStatus) => void;
};

export const TripsStatusFilter = ({ onStatusChange }: TripsStatusFilterProps) => (
    <div className="status-filter-actions">
        <button onClick={() => onStatusChange()}>All</button>
        <button onClick={() => onStatusChange("planned")}>Planned</button>
        <button onClick={() => onStatusChange("pending")}>Pending</button>
        <button onClick={() => onStatusChange("closed")}>Closed</button>
        <button onClick={() => onStatusChange("cancelled")}>Cancelled</button>
    </div>
);
