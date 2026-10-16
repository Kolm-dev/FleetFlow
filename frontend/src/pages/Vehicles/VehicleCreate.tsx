import { getDrivers } from "@/api/drivers";
import { createVehicle } from "@/api/vehicles";
import { VehicleCreateForm } from "@/components/Vehicles/VehicleCreateForm";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import type { CreateVehicleData } from "@/types/vehiclesTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

const VehicleCreate = () => {
    const queryClient = useQueryClient();
    const { data: availablesDrivers } = useQuery({
        queryKey: ["drivers", { status: "available" }],
        queryFn: () => getDrivers({ status: "available" }),
    });
    const navigate = useNavigate();

    const { mutate, isPending, isSuccess, data: createResult } = useMutation({
        mutationFn: (data: CreateVehicleData) => createVehicle(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            queryClient.setQueryData(
                ["vehicle", response.vehicle.id],
                response.vehicle,
            );
        },
    });
    const availableDrivers = availablesDrivers?.drivers;
    if (!availableDrivers?.length) return <p>No available drivers</p>;
    if (isSuccess && createResult) {
        return (
            <SuccessMessage
                tag="vehicle"
                successText="Vehicle created successfully. Opening vehicle details shortly."
                time={2000}
                onComplete={() => navigate(`/vehicles/${createResult.vehicle.id}`)}
            />
        );
    }

    return (
        <>
            <VehicleCreateForm
                availableDrivers={availableDrivers}
                isPending={isPending}
                onSubmit={(data) => mutate(data)}
            />
        </>
    );
};

export default VehicleCreate;
