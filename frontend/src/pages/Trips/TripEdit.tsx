import { getClients } from "@/api/clients";
import { getDrivers } from "@/api/drivers";
import { getTrip, updateTrip } from "@/api/trips";
import { Spinner } from "@/components/Spinner/Spinner";
import { TripEditForm } from "@/components/Trips/TripEditForm";
import { tripEventsQueryKey } from "@/hooks/useTripEvents";
import { getBackendErrorMessages } from "@/libs/errors";
import type { UpdateTripData } from "@/types/tripsTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

const TripEdit = () => {
    const { tripsId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const tripId = tripsId ? Number(tripsId) : undefined;

    const { data: trip, isLoading: isTripLoading } = useQuery({
        queryKey: ["trip", tripId],
        queryFn: () => getTrip(tripId as number),
        enabled: tripId !== undefined,
    });

    const { data: driversResponse, isLoading: isDriversLoading } = useQuery({
        queryKey: ["drivers"],
        queryFn: () => getDrivers(),
    });
    const { data: clientsResponse, isLoading: isClientsLoading } = useQuery({
        queryKey: ["clients"],
        queryFn: () => getClients(),
    });

    const { mutate, isPending, error: updateError } = useMutation({
        mutationFn: (data: UpdateTripData) =>
            updateTrip(data, tripId as number),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trips"] });
            queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
            queryClient.invalidateQueries({ queryKey: tripEventsQueryKey(tripId as number) });
            queryClient.invalidateQueries({ queryKey: ["drivers"] });
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
            navigate("/trips");
        },
    });

    if (tripId === undefined || Number.isNaN(tripId))
        return <p className="error-message">Invalid trip id</p>;
    if (isTripLoading || isDriversLoading || isClientsLoading) return <Spinner />;
    if (!trip) return <p className="error-message">Trip not found</p>;
    if (!driversResponse)
        return <p className="error-message">No drivers data</p>;
    if (!clientsResponse)
        return <p className="error-message">No clients data</p>;

    return (
        <TripEditForm
            trip={trip}
            availableDrivers={driversResponse.drivers}
            clients={clientsResponse.data}
            isPending={isPending}
            errorMessages={getBackendErrorMessages(updateError, "Could not update trip. Please try again.")}
            onSubmit={(data) => mutate(data)}
        />
    );
};

export default TripEdit;
