import { getVehicle, updateVehicle } from "@/api/vehicles";
import { VehicleEditForm } from "@/components/VehicleEditForm";
import type { UpdateVehicleData } from "@/types/vehiclesTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

export const VehicleEdit = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { id: vehicleId } = useParams();
    const {
        data: vehicle,
        // isSuccess
    } = useQuery({
        queryKey: ["vehicle", vehicleId],
        queryFn: () => getVehicle(parseInt(vehicleId as string)),
        enabled: !!vehicleId,
    });
    const {
        mutate,
        isPending,
        // isSuccess: isUpdated,
    } = useMutation({
        mutationFn: (data: UpdateVehicleData) =>
            updateVehicle(data, parseInt(vehicleId as string)),
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
    if (!vehicle) return;

    return (
        <div>
            <VehicleEditForm
                onSubmit={(data) => mutate(data)}
                isPending={isPending}
                vehicle={vehicle}
            />
        </div>
    );
};
