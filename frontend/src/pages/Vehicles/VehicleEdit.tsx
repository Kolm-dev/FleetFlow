import { getVehicle, updateVehicle } from "@/api/vehicles";
import { Spinner } from "@/components/Spinner/Spinner";
import { VehicleForm } from "@/components/Vehicles/VehicleForm";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { getBackendErrorMessage } from "@/libs/errors";
import type { UpdateVehicleData } from "@/types/vehiclesTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

export const VehicleEdit = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { id: vehicleId } = useParams();
    const {
        data,
        isLoading,
        error: vehicleError,
    } = useQuery({
        queryKey: ["vehicle", vehicleId],
        queryFn: () => getVehicle(parseInt(vehicleId as string)),
        enabled: !!vehicleId,
    });
    const vehicle = data?.vehicle;
    const {
        mutate,
        isPending,
        error: updateError,
        isSuccess,
    } = useMutation({
        mutationFn: (data: UpdateVehicleData) => updateVehicle(data, parseInt(vehicleId as string)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["vehicles"],
            });
            queryClient.invalidateQueries({
                queryKey: ["vehicle", vehicleId],
            });
        },
    });

    if (isLoading) return <Spinner />;
    if (vehicleError) {
        return <ErrorMessage messages={vehicleError.message} fallbackMessage="Could not load vehicle." />;
    }
    if (!vehicle) return <ErrorMessage messages="Vehicle not found" />;

    if (isSuccess) {
        return (
            <SuccessMessage
                tag="vehicle"
                successText="Vehicle updated successfully. Returning to vehicle details shortly."
                time={2000}
                onComplete={() => navigate(`/vehicles/${vehicleId}`)}
            />
        );
    }

    return (
        <div className="vehicle-edit-page">
            {updateError && (
                <ErrorMessage messages={getBackendErrorMessage(updateError, "Could not update vehicle.")} />
            )}
            <VehicleForm
                mode="edit"
                onSubmit={data => mutate(data)}
                onCancel={() => navigate(`/vehicles/${vehicleId}`)}
                isPending={isPending}
                vehicle={vehicle}
            />
        </div>
    );
};
