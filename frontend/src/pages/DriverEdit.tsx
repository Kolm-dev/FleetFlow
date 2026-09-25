import { getDriver, updateDriver } from "@/api/drivers";
import { DriverEditForm } from "@/components/DriverEditForm";
import { Spinner } from "@/components/Spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateDriverData } from "@/types/driversTypes";
import { useNavigate, useParams } from "react-router";

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
        mutate,
        isPending,
        error: updateError,
    } = useMutation({
        mutationFn: (data: UpdateDriverData) =>
            updateDriver(data, parseInt(driverId as string)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["drivers"],
            });
            queryClient.invalidateQueries({
                queryKey: ["driver", driverId],
            });
            navigate(`/drivers/${driverId}`);
        },
    });

    if (isLoading) return <Spinner />;
    if (driverError) {
        return <p className="error-message">{driverError.message}</p>;
    }
    if (!driver) return <p className="error-message">Driver not found</p>;

    return (
        <div className="driver-edit-page">
            {updateError && (
                <p className="error-message">{updateError.message}</p>
            )}
            <DriverEditForm
                onSubmit={(data) => mutate(data)}
                onCancel={() => navigate(`/drivers/${driverId}`)}
                driver={driver}
                isPending={isPending}
            />
        </div>
    );
};
