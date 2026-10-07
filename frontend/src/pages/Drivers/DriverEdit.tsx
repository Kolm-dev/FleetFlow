import { getDriver, updateDriver } from "@/api/drivers";
import { getVehicles, updateVehicle } from "@/api/vehicles";
import { DriverEditForm } from "@/components/Drivers/DriverEditForm";
import { Spinner } from "@/components/Spinner/Spinner";
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
            navigate(`/drivers/${driverId}`);
        },
    });

    if (isLoading || isVehiclesLoading) return <Spinner />;
    if (driverError) {
        return <p className="error-message">{driverError.message}</p>;
    }
    if (vehiclesError) {
        return <p className="error-message">{vehiclesError.message}</p>;
    }
    if (!driver) return <p className="error-message">Driver not found</p>;
    if (!vehiclesResponse) return <p className="error-message">Vehicles not found</p>;

    return (
        <div className="driver-edit-page">
            {updateError && (
                <p className="error-message">{getBackendErrorMessage(updateError, "Could not update driver.")}</p>
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
