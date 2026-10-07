import { createClient } from "@/api/clients";
import { ClientForm } from "@/components/Clients/ClientForm";
import type { ClientFormData } from "@/components/Clients/ClientForm";
import { getBackendErrorMessage } from "@/libs/errors";
import type { CreateClientData } from "@/types/clientTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export const ClientCreate = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate, isPending, error } = useMutation({
        mutationFn: (data: CreateClientData) => createClient(data),
        onSuccess: response => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            navigate(`/clients/${response.data.id}`);
        },
    });

    const handleSubmit = (data: ClientFormData) => {
        mutate(data);
    };

    return (
        <div>
            {error && <p className="error-message">{getBackendErrorMessage(error, "Could not create client.")}</p>}
            <ClientForm
                isPending={isPending}
                onCancel={() => navigate("/clients")}
                onSubmit={handleSubmit}
            />
        </div>
    );
};
