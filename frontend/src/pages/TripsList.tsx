import { closeTrip, getTrips } from "@/api/trips";
import { TripCard } from "@/components/TripCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { TripSort, TripStatus } from "@/types/tripsTypes";
import TripDetailsPanel from "@/components/TripDetailsPanel";

type PaginationProps = {
    page: number;
    lastPage: number;
    isFetching: boolean;
    onPreviousPage: () => void;
    onNextPage: () => void;
};

const Pagination = ({
    page,
    lastPage,
    isFetching,
    onPreviousPage,
    onNextPage,
}: PaginationProps) => (
    <div>
        <button
            type="button"
            disabled={page === 1 || isFetching}
            onClick={onPreviousPage}
        >
            Previous
        </button>
        <button
            type="button"
            disabled={page === lastPage || isFetching}
            onClick={onNextPage}
        >
            Next
        </button>
    </div>
);

const TripsList = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<TripStatus | undefined>();
    const [sort, setSort] = useState<TripSort | undefined>();
    const [selectedCardId, setSelectedCard] = useState<null | number>(null);
    const queryClient = useQueryClient();

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["trips", { page, status, sort }],
        queryFn: () => getTrips({ page, status, sort }),
    });

    const { mutate } = useMutation({
        mutationFn: (id: number) => closeTrip(id),
        onSuccess: (trip) => {
            queryClient.invalidateQueries({
                queryKey: ["trips"],
            });

            const driverName = trip.driver?.name ?? "Driver";
            const vehicleName = trip.vehicle
                ? `${trip.vehicle.brand} ${trip.vehicle.model}`
                : "vehicle";

            alert(
                `${driverName} and ${vehicleName} are now available and will be back on the road soon.`,
            );
        },
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>{error.message}</p>;
    if (!data) return <p>No trips data.</p>;

    const { data: trips, current_page, last_page, total } = data;
    const goToPreviousPage = () => setPage((currentPage) => currentPage - 1);
    const goToNextPage = () => setPage((currentPage) => currentPage + 1);

    const changeStatus = (status?: TripStatus) => {
        setStatus(status);
        setPage(1);
    };

    const changeSort = (sort?: TripSort) => {
        setSort(sort);
        setPage(1);
    };

    const selectedTrip = trips.find((trip) => trip.id === selectedCardId);
    return (
        <div>
            <p>
                Page {current_page} of {last_page}. Total trips: {total}
            </p>

            <div>
                <button onClick={() => changeStatus()}>All</button>
                <button onClick={() => changeStatus("planned")}>Planned</button>
                <button onClick={() => changeStatus("pending")}>Pending</button>
                <button onClick={() => changeStatus("closed")}>Closed</button>
            </div>

            <select
                value={sort ?? ""}
                onChange={(event) =>
                    changeSort(
                        event.target.value
                            ? (event.target.value as TripSort)
                            : undefined,
                    )
                }
            >
                <option value="">Reset sorting</option>
                <option value="price">Price: High to Low</option>
                <option value="-price">Price: Low to High</option>
                <option value="created_at">Created later</option>
                <option value="-created_at">Created earlier</option>
            </select>

            {trips.map((trip) => (
                <TripCard
                    onClose={() => mutate(trip.id)}
                    key={trip.id}
                    trip={trip}
                    onDetailsClick={() => setSelectedCard(trip.id)}
                />
            ))}
            <>
                {selectedTrip && (
                    <TripDetailsPanel
                        trip={selectedTrip}
                        onClose={() => setSelectedCard(null)}
                    />
                )}
            </>

            <Pagination
                page={page}
                lastPage={last_page}
                isFetching={isFetching}
                onPreviousPage={goToPreviousPage}
                onNextPage={goToNextPage}
            />
        </div>
    );
};

export default TripsList;
