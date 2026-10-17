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

    const { mutate, isPending, error, isSuccess } = useMutation({
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
            {isSuccess ? (
                <SuccessMessage
                    tag="client"
                    successText="Client created successfully. Returning to the clients list shortly."
                    time={2000}
                    onComplete={() => navigate("/clients")}
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
