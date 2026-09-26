import { createDriver } from "@/api/drivers";
import { DriverCreateForm } from "@/components/Drivers/DriverCreateForm";
import type { CreateDriverData } from "@/types/driversTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export const DriverCreate = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: CreateDriverData) => createDriver(data),
        onSuccess(response) {
            queryClient.invalidateQueries({
                queryKey: ["drivers"],
            });

            navigate(`/drivers/${response.driver.id}`);
        },
    });

    return (
        <DriverCreateForm
            isPending={isPending}
            onSubmit={(data) => mutate(data)}
        />
    );
};
