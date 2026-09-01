import { getDriver, updateDriver } from "@/api/drivers";
import { DriverEditForm } from "@/components/DriverEditForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateDriverData } from "@/types/driversTypes";
// import React from "react";
import { useNavigate, useParams } from "react-router";

export const DriverEdit = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { id: driverId } = useParams();
    const { data: driver } = useQuery({
        queryKey: ["driver", driverId],
        queryFn: () => getDriver(parseInt(driverId as string)),
        enabled: !!driverId,
    });
    const {
        mutate,
        isPending,
        isSuccess: isUpdated,
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

    return (
        <div>
            {driver && (
                <DriverEditForm
                    onSubmit={(data) => mutate(data)}
                    driver={driver}
                    isPending={isPending}
                />
            )}

            {isUpdated && <p>Driver updated</p>}
        </div>
    );
};
