import { getClients } from "@/api/clients";
import { getDrivers } from "@/api/drivers";
import { createTrip } from "@/api/trips";
import TripCreateForm from "@/components/Trips/TripCreateForm";
import { tripEventsQueryKey } from "@/hooks/useTripEvents";
import type { CreateTripData } from "@/types/tripsTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router";

type TripCreateErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

const getTripCreateErrorMessages = (error: Error | null) => {
    if (!error) return [];

    if (axios.isAxiosError<TripCreateErrorResponse>(error)) {
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

    return ["Could not create trip. Please try again."];
};

export const TripCreate = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data } = useQuery({
        queryKey: ["drivers"],
        queryFn: () => getDrivers({ status: "available" }),
    });
    const { data: clientsData } = useQuery({
        queryKey: ["clients"],
        queryFn: () => getClients(),
    });

    const {
        mutate,
        isPending: isCreating,
        error: createError,
    } = useMutation({
        mutationFn: (trip: CreateTripData) => createTrip(trip),
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: ["trips"],
            });
            queryClient.invalidateQueries({
                queryKey: tripEventsQueryKey(response.trip.id),
            });
            queryClient.invalidateQueries({
                queryKey: ["drivers"],
            });
            queryClient.invalidateQueries({
                queryKey: ["vehicles"],
            });
            queryClient.invalidateQueries({
                queryKey: ["stats"],
            });
            navigate("/trips", {
                state: {
                    selectedTripId: response.trip.id,
                },
            });
        },
    });

    const availableDrivers = data?.drivers ?? [];
    const clients = clientsData?.data ?? [];
    const errorMessages = getTripCreateErrorMessages(createError);

    return (
        <>
            <TripCreateForm
                availableDrivers={availableDrivers}
                clients={clients}
                isCreating={isCreating}
                errorMessages={errorMessages}
                onSubmit={(newTrip) => mutate(newTrip)}
            />
        </>
    );
};
