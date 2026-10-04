import type { EventFilter, TripEventType } from "@/types/tripsTypes";

type EventFiltersProps = {
    eventTitles: Record<TripEventType, string>;
    selectedType: EventFilter;
    search: string;
    onTypeChange: (type: EventFilter) => void;
    onSearchChange: (search: string) => void;
};

const EventFilters = ({ eventTitles, selectedType, onTypeChange, search, onSearchChange }: EventFiltersProps) => {
    const typeOptions = Object.entries(eventTitles) as [TripEventType, string][];

    return (
        <div className="trip-event-filters">
            <label>
                Type
                <select
                    value={selectedType}
                    onChange={event => onTypeChange(event.target.value as EventFilter)}
                >
                    <option value="all">All</option>
                    {typeOptions.map(([type, title]) => (
                        <option
                            key={type}
                            value={type}
                        >
                            {title}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Search
                <input
                    type="search"
                    value={search}
                    onChange={event => onSearchChange(event.target.value)}
                    placeholder="Search events..."
                />
            </label>
        </div>
    );
};

export default EventFilters;
