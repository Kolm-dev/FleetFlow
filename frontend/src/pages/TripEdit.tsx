import { getDrivers } from "@/api/drivers";
import { getTrip, updateTrip } from "@/api/trips";
import { TripEditForm } from "@/components/TripEditForm";
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

    const { mutate, isPending } = useMutation({
        mutationFn: (data: UpdateTripData) =>
            updateTrip(data, tripId as number),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trips"] });
            queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
            navigate("/trips");
        },
    });

    if (tripId === undefined || Number.isNaN(tripId))
        return <p>Invalid trip id</p>;
    if (isTripLoading || isDriversLoading) return <p>Loading...</p>;
    if (!trip) return <p>Trip not found</p>;
    if (!driversResponse) return <p>No drivers data</p>;

    return (
        <TripEditForm
            trip={trip}
            availableDrivers={driversResponse.drivers}
            isPending={isPending}
            onSubmit={(data) => mutate(data)}
        />
    );
};

export default TripEdit;
