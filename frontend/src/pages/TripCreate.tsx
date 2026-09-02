import { getDrivers } from "@/api/drivers";
import { createTrip } from "@/api/trips";
import TripCreateForm from "@/components/TripCreateForm";
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

    const {
        mutate,
        isPending: isCreating,
    } = useMutation({
        mutationFn: (trip: CreateTripData) => createTrip(trip),
        onSuccess: (createdTrip) => {
            queryClient.invalidateQueries({
                queryKey: ["trips"],
            });
            navigate("/trips", {
                state: {
                    selectedTripId: createdTrip.id
                },
            });
        },
    });

    const availableDrivers = data?.drivers ?? [];

    return (
        <>
            <TripCreateForm
                availableDrivers={availableDrivers}
                isCreating={isCreating}
                onSubmit={(newTrip) => mutate(newTrip)}
            />
        </>
    );
};
