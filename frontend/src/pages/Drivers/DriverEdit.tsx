import { getDriver, updateDriver } from "@/api/drivers";
import { getVehicles, updateVehicle } from "@/api/vehicles";
import { DriverEditForm } from "@/components/Drivers/DriverEditForm";
import { Spinner } from "@/components/Spinner/Spinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { getBackendErrorMessage } from "@/libs/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateDriverData } from "@/types/driversTypes";
import { useNavigate, useParams } from "react-router";
import type { UpdateVehicleData } from "@/types/vehiclesTypes";

export const DriverEdit = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { id: driverId } = useParams();
    const {
        data: driver,
        isLoading,
        error: driverError,
    } = useQuery({
        queryKey: ["driver", driverId],
        queryFn: () => getDriver(parseInt(driverId as string)),
        enabled: !!driverId,
    });
    const {
        data: vehiclesResponse,
        isLoading: isVehiclesLoading,
        error: vehiclesError,
    } = useQuery({
        queryKey: ["vehicles"],
        queryFn: () => getVehicles(),
    });
    const {
        mutate,
        isPending,
        error: updateError,
        isSuccess,
    } = useMutation({
        mutationFn: async (data: { driver: UpdateDriverData; vehicleId?: number }) => {
            const parsedDriverId = parseInt(driverId as string);
            const response = await updateDriver(data.driver, parsedDriverId);

            if (data.vehicleId) {
                const vehicle = vehiclesResponse?.vehicles.find(vehicle => vehicle.id === data.vehicleId);

                if (vehicle && vehicle.driver_id !== parsedDriverId) {
                    const vehicleData: UpdateVehicleData = { driver_id: parsedDriverId };
                    await updateVehicle(vehicleData, data.vehicleId);
                }
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["drivers"],
            });
            queryClient.invalidateQueries({
                queryKey: ["driver", driverId],
            });
            queryClient.invalidateQueries({
                queryKey: ["vehicles"],
            });
        },
    });

    if (isLoading || isVehiclesLoading) return <Spinner />;
    if (driverError) {
        return <ErrorMessage messages={driverError.message} fallbackMessage="Could not load driver." />;
    }
    if (vehiclesError) {
        return <ErrorMessage messages={vehiclesError.message} fallbackMessage="Could not load vehicles." />;
    }
    if (!driver) return <ErrorMessage messages="Driver not found" />;
    if (!vehiclesResponse) return <ErrorMessage messages="Vehicles not found" />;

    if (isSuccess) {
        return (
            <SuccessMessage
                tag="driver"
                successText="Driver updated successfully. Returning to driver details shortly."
                time={2000}
                onComplete={() => navigate(`/drivers/${driverId}`)}
            />
        );
    }

    return (
        <div className="driver-edit-page">
            {updateError && (
                <ErrorMessage messages={getBackendErrorMessage(updateError, "Could not update driver.")} />
            )}
            <DriverEditForm
                onSubmit={(data) => mutate(data)}
                onCancel={() => navigate(`/drivers/${driverId}`)}
                driver={driver}
                vehicles={vehiclesResponse.vehicles}
                isPending={isPending}
            />
        </div>
    );
};
