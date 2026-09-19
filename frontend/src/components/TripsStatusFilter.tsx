import type { TripStatus } from "@/types/tripsTypes";

type TripsStatusFilterProps = {
    selectedStatuses: TripStatus[];
    onStatusChange: (status: TripStatus) => void;
};

const STATUS_OPTIONS: { label: string; value: TripStatus }[] = [
    { label: "Planned", value: "planned" },
    { label: "Pending", value: "pending" },
    { label: "Closed", value: "closed" },
    { label: "Cancelled", value: "cancelled" },
];

export const TripsStatusFilter = ({ selectedStatuses, onStatusChange }: TripsStatusFilterProps) => (
    <div className="status-filter-actions">
        {STATUS_OPTIONS.map(({ label, value }) => (
            <label
                className="status-filter-checkbox"
                key={value}
            >
                <input
                    type="checkbox"
                    checked={selectedStatuses.includes(value)}
                    onChange={() => onStatusChange(value)}
                />
                {label}
            </label>
        ))}
    </div>
);
