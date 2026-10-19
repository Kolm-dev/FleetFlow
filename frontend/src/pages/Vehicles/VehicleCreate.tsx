import { getDrivers } from "@/api/drivers";
import { createVehicle } from "@/api/vehicles";
import { VehicleForm } from "@/components/Vehicles/VehicleForm";
import { Spinner } from "@/components/Spinner/Spinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { getBackendErrorMessage } from "@/libs/errors";
import type { CreateVehicleData } from "@/types/vehiclesTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

const VehicleCreate = () => {
    const queryClient = useQueryClient();
    const { data: availablesDrivers, isLoading: isDriversLoading, error: driversError } = useQuery({
        queryKey: ["drivers", { status: "available" }],
        queryFn: () => getDrivers({ status: "available" }),
    });
    const navigate = useNavigate();

    const { mutate, isPending, isSuccess, data: createResult, error: createError } = useMutation({
        mutationFn: (data: CreateVehicleData) => createVehicle(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            queryClient.setQueryData(
                ["vehicle", response.vehicle.id],
                response.vehicle,
            );
        },
    });
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

    if (isDriversLoading) return <Spinner />;
    if (driversError) return <ErrorMessage messages={getBackendErrorMessage(driversError, "Could not load drivers.")} />;
    const availableDrivers = availablesDrivers?.drivers;
    if (!availableDrivers?.length) return <p>No available drivers</p>;

    return (
        <>
            {createError && <ErrorMessage messages={getBackendErrorMessage(createError, "Could not create vehicle.")} />}
            <VehicleForm
                mode="create"
                availableDrivers={availableDrivers}
                isPending={isPending}
                onCancel={() => navigate("/vehicles")}
                onSubmit={(data) => mutate(data)}
            />
        </>
    );
};

export default VehicleCreate;
