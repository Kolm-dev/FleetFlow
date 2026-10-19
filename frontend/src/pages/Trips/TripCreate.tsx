import { getClients } from "@/api/clients";
import { getDrivers } from "@/api/drivers";
import { createTrip } from "@/api/trips";
import { TripForm } from "@/components/Trips/TripForm";
import { Spinner } from "@/components/Spinner/Spinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { tripEventsQueryKey } from "@/hooks/useTripEvents";
import { getBackendErrorMessages } from "@/libs/errors";
import type { CreateTripData } from "@/types/tripsTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export const TripCreate = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data, isLoading: isDriversLoading, error: driversError } = useQuery({
        queryKey: ["drivers", { status: "available" }],
        queryFn: () => getDrivers({ status: "available" }),
    });
    const { data: clientsData, isLoading: isClientsLoading, error: clientsError } = useQuery({
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

    if (isDriversLoading || isClientsLoading) return <Spinner />;
    if (driversError) return <ErrorMessage messages={getBackendErrorMessages(driversError, "Could not load drivers.")} />;
    if (clientsError) return <ErrorMessage messages={getBackendErrorMessages(clientsError, "Could not load clients.")} />;

    return (
        <>
            <TripForm
                mode="create"
                availableDrivers={availableDrivers}
                clients={clients}
                isPending={isCreating}
                errorMessages={errorMessages}
                onCancel={() => navigate("/trips")}
                onSubmit={(newTrip) => mutate(newTrip)}
            />
        </>
    );
};
