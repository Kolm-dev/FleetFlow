import { Button } from "@/components/ui/button";
import { tripStatusStyles } from "@/components/Trips/tripStatusStyles";
import { cn } from "@/lib/utils";
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
    <div className="grid w-full grid-cols-4 gap-2 p-5 border px-3 rounded-md">
        {STATUS_OPTIONS.map(({ label, value }) => (
            <Button
                aria-pressed={selectedStatuses.includes(value)}
                className={cn(
                    "h-8 w-full min-w-0 border px-1 text-xs sm:px-3 sm:text-sm",
                    selectedStatuses.includes(value)
                        ? tripStatusStyles[value].selectedFilter
                        : tripStatusStyles[value].filter
                )}
                key={value}
                type="button"
                variant="outline"
                onClick={() => onStatusChange(value)}
            >
                {label}
            </Button>
        ))}
    </div>
);
