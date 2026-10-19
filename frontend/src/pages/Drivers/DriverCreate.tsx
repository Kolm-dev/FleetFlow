import { createDriver } from "@/api/drivers";
import { DriverForm } from "@/components/Drivers/DriverForm";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { getBackendErrorMessage } from "@/libs/errors";
import type { CreateDriverData } from "@/types/driversTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export const DriverCreate = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { mutate, isPending, isSuccess, data: createResult, error: createError } = useMutation({
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
        <>
            {createError && <ErrorMessage messages={getBackendErrorMessage(createError, "Could not create driver.")} />}
            <DriverForm
                mode="create"
                isPending={isPending}
                onCancel={() => navigate("/drivers")}
                onSubmit={(data) => mutate(data)}
            />
        </>
    );
};
