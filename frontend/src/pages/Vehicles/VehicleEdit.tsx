import { getVehicle, updateVehicle } from "@/api/vehicles";
import { Spinner } from "@/components/Spinner/Spinner";
import { VehicleEditForm } from "@/components/Vehicles/VehicleEditForm";
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
    } = useMutation({
        mutationFn: (data: UpdateVehicleData) => updateVehicle(data, parseInt(vehicleId as string)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["vehicles"],
            });
            queryClient.invalidateQueries({
                queryKey: ["vehicle", vehicleId],
            });
            navigate(`/vehicles/${vehicleId}`);
        },
    });

    if (isLoading) return <Spinner />;
    if (vehicleError) {
        return <p className="error-message">{vehicleError.message}</p>;
    }
    if (!vehicle) return <p className="error-message">Vehicle not found</p>;

    return (
        <div className="vehicle-edit-page">
            {updateError && <p className="error-message">{updateError.message}</p>}
            <VehicleEditForm
                onSubmit={data => mutate(data)}
                onCancel={() => navigate(`/vehicles/${vehicleId}`)}
                isPending={isPending}
                vehicle={vehicle}
            />
        </div>
    );
};
