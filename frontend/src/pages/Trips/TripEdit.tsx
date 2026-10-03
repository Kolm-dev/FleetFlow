import { getDrivers } from "@/api/drivers";
import { getTrip, updateTrip } from "@/api/trips";
import { Spinner } from "@/components/Spinner/Spinner";
import { TripEditForm } from "@/components/Trips/TripEditForm";
import { tripEventsQueryKey } from "@/hooks/useTripEvents";
import type { UpdateTripData } from "@/types/tripsTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useParams } from "react-router";

type TripEditErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

const getTripEditErrorMessages = (error: Error | null) => {
    if (!error) return [];

    if (axios.isAxiosError<TripEditErrorResponse>(error)) {
        const errors = error.response?.data.errors;
        const validationMessages = errors ? Object.values(errors).flat() : [];

        if (validationMessages.length > 0) {
            return validationMessages;
        }

        const message = error.response?.data.message;
        if (message) {
            return [message];
        }
    }

    return ["Could not update trip. Please try again."];
};

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
    if (isTripLoading || isDriversLoading) return <Spinner />;
    if (!trip) return <p className="error-message">Trip not found</p>;
    if (!driversResponse)
        return <p className="error-message">No drivers data</p>;

    return (
        <TripEditForm
            trip={trip}
            availableDrivers={driversResponse.drivers}
            isPending={isPending}
            errorMessages={getTripEditErrorMessages(updateError)}
            onSubmit={(data) => mutate(data)}
        />
    );
};

export default TripEdit;
