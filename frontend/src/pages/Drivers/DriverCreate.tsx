import { createDriver } from "@/api/drivers";
import { DriverCreateForm } from "@/components/Drivers/DriverCreateForm";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import type { CreateDriverData } from "@/types/driversTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export const DriverCreate = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { mutate, isPending, isSuccess, data: createResult } = useMutation({
        mutationFn: (data: CreateDriverData) => createDriver(data),
        onSuccess() {
            queryClient.invalidateQueries({
                queryKey: ["drivers"],
            });

        },
    });

    if (isSuccess && createResult) {
        return (
            <SuccessMessage
                tag="driver"
                successText="Driver created successfully. Opening driver details shortly."
                time={2000}
                onComplete={() => navigate(`/drivers/${createResult.driver.id}`)}
            />
        );
    }

    return (
        <DriverCreateForm
            isPending={isPending}
            onSubmit={(data) => mutate(data)}
        />
    );
};
