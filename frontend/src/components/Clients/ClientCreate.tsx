import { createClient } from "@/api/clients";
import { ClientForm } from "@/components/Clients/ClientForm";
import type { ClientFormData } from "@/components/Clients/ClientForm";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { getBackendErrorMessage } from "@/libs/errors";
import type { CreateClientData } from "@/types/clientTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export const ClientCreate = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate, isPending, error, isSuccess, data } = useMutation({
        mutationFn: (data: CreateClientData) => createClient(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
    });

    const handleSubmit = (data: ClientFormData) => {
        mutate(data);
    };

    return (
        <div>
            {error && <ErrorMessage messages={getBackendErrorMessage(error, "Could not create client.")} />}
            {isSuccess && data ? (
                <SuccessMessage
                    tag="client"
                    successText="Client created successfully. Opening client details shortly."
                    time={2000}
                    onComplete={() => navigate(`/clients/${data.data.id}`)}
                />
            ) : (
                <ClientForm
                    isPending={isPending}
                    onCancel={() => navigate("/clients")}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};
