import type { TripSort } from "@/types/tripsTypes";

type TripsToolbarProps = {
    searchInput: string;
    sort?: TripSort;
    onSearchChange: (searchValue: string) => void;
    onSortChange: (sort?: TripSort) => void;
};

export const TripsToolbar = ({ searchInput, sort, onSearchChange, onSortChange }: TripsToolbarProps) => (
    <div className="trips-toolbar">
        <label>
            Search
            <input
                type="search"
                value={searchInput}
                placeholder="Title or ID"
                onChange={event => onSearchChange(event.target.value)}
            />
        </label>

        <label>
            Sorting
            <select
                value={sort ?? ""}
                onChange={event => onSortChange(event.target.value ? (event.target.value as TripSort) : undefined)}
            >
                <option value="">Reset sorting</option>
                <option value="price">Price: Low to Hight</option>
                <option value="-price">Price: High to Low</option>
                <option value="created_at">Created later</option>
                <option value="-created_at">Created earlier</option>
            </select>
        </label>
    </div>
);
