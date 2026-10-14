import { getClients } from "@/api/clients";
import { getDrivers } from "@/api/drivers";
import { createTrip } from "@/api/trips";
import TripCreateForm from "@/components/Trips/TripCreateForm";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { tripEventsQueryKey } from "@/hooks/useTripEvents";
import { getBackendErrorMessages } from "@/libs/errors";
import type { CreateTripData } from "@/types/tripsTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

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
        isSuccess,
        data: createResult,
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
        },
    });

    const availableDrivers = data?.drivers ?? [];
    const clients = clientsData?.data ?? [];
    const errorMessages = getBackendErrorMessages(createError, "Could not create trip. Please try again.");

    if (isSuccess && createResult) {
        return (
            <SuccessMessage
                tag="trip"
                successText="Trip created successfully. Opening the trips list shortly."
                time={2000}
                onComplete={() => navigate("/trips", { state: { selectedTripId: createResult.trip.id } })}
            />
        );
    }

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
