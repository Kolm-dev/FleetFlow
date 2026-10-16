import type { TripSort } from "@/types/tripsTypes";

type TripsToolbarProps = {
    searchInput: string;
    sort?: TripSort;
    onSearchChange: (searchValue: string) => void;
    onSortChange: (sort?: TripSort) => void;
};

export const TripsToolbar = ({ searchInput, sort, onSearchChange, onSortChange }: TripsToolbarProps) => (
    <div className="mb-4 grid w-full gap-3 rounded-lg border bg-card p-3 sm:grid-cols-2 sm:gap-4 sm:p-4">
        <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Search
            <input
                className="mt-0 h-10 w-full max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                type="search"
                value={searchInput}
                placeholder="Title or ID"
                onChange={event => onSearchChange(event.target.value)}
            />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Sorting
            <select
                className="mt-0 h-10 w-full max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
