import { closeTrip, cancelTrip, getTrips } from "@/api/trips";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";
import TripDetailsPanel from "@/components/TripDetailsPanel";
import { TripsContent } from "@/components/TripsContent";
import { TripsHeader } from "@/components/TripsHeader";
import { TripsStatusFilter } from "@/components/TripsStatusFilter";
import { TripsToolbar } from "@/components/TripsToolbar";
import { useSuccessMessageScroll } from "@/hooks/useSuccessMessageScroll";
import { useTripsFilters } from "@/hooks/useTripsFilters";
import type { Trip } from "@/types/tripsTypes";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const getCloseTripSuccessMessage = (trip: Trip) => {
    const driverName = trip.driver?.name ?? "Driver";
    const vehicleName = trip.vehicle ? `${trip.vehicle.brand} ${trip.vehicle.model}` : "vehicle";

    return `${driverName} and ${vehicleName} are now available and will be back on the road soon.`;
};

const TripsList = () => {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [selectedCardId, setSelectedCard] = useState<null | number>(null);
    const queryClient = useQueryClient();
    const {
        page,
        status,
        sort,
        search,
        searchInput,
        changeStatus,
        changeSort,
        changeSearchInput,
        goToPreviousPage,
        goToNextPage,
    } = useTripsFilters();
    const { successMessageRef, scrollReturnPositionRef } = useSuccessMessageScroll(successMessage);

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["trips", { page, status, sort, search }],
        queryFn: () => getTrips({ page, status, sort, search }),
        placeholderData: keepPreviousData,
    });

    const { mutate: closeTripMutation } = useMutation({
        mutationFn: (id: number) => closeTrip(id),
        onSuccess: ({ trip }) => {
            scrollReturnPositionRef.current = window.scrollY;

            queryClient.invalidateQueries({
                queryKey: ["trips"],
            });

            setSuccessMessage(getCloseTripSuccessMessage(trip));
        },
    });

    const { mutate: cancelTripMutation } = useMutation({
        mutationFn: (id: number) => cancelTrip(id),
        onSuccess: ({ message }) => {
            scrollReturnPositionRef.current = window.scrollY;

            queryClient.invalidateQueries({
                queryKey: ["trips"],
            });

            setSelectedCard(null);
            setSuccessMessage(message);
        },
    });

    if (isLoading) return <Spinner />;
    if (error) return <p>{error.message}</p>;
    if (!data) return <p>No trips data.</p>;

    const { data: trips, current_page, last_page, total } = data;
    const selectedTrip = trips.find(trip => trip.id === selectedCardId);

    return (
        <div>
            <TripsHeader
                currentPage={current_page}
                lastPage={last_page}
                total={total}
            />

            <TripsStatusFilter onStatusChange={changeStatus} />

            {successMessage && (
                <p
                    ref={successMessageRef}
                    className="success-message"
                >
                    {successMessage}
                </p>
            )}

            <TripsToolbar
                searchInput={searchInput}
                sort={sort}
                onSearchChange={changeSearchInput}
                onSortChange={changeSort}
            />

            {isFetching && !isLoading && <p className="trips-updating">Updating trips...</p>}

            <TripsContent
                trips={trips}
                onCloseTrip={closeTripMutation}
                onDetailsClick={setSelectedCard}
            />

            {selectedTrip && (
                <TripDetailsPanel
                    trip={selectedTrip}
                    onClose={() => setSelectedCard(null)}
                    onCancelled={() => cancelTripMutation(selectedTrip.id)}
                />
            )}

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
