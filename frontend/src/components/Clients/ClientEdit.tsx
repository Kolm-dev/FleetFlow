import { getClient, updateClient } from "@/api/clients";
import { ClientForm } from "@/components/Clients/ClientForm";
import type { ClientFormData } from "@/components/Clients/ClientForm";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { Spinner } from "@/components/Spinner/Spinner";
import { getBackendErrorMessage } from "@/libs/errors";
import type { UpdateClientData } from "@/types/clientTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

export const ClientEdit = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams();
    const clientId = Number(id);

    const {
        data,
        isLoading,
        error: clientError,
    } = useQuery({
        queryKey: ["client", clientId],
        queryFn: () => getClient(clientId),
        enabled: Number.isFinite(clientId),
    });

    const {
        mutate,
        isPending,
        error: updateError,
        isSuccess,
        data: updateResult,
    } = useMutation({
        mutationFn: (data: UpdateClientData) => updateClient(clientId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client", clientId] });
        },
    });

    const handleSubmit = (data: ClientFormData) => {
        mutate({
            email: data.email,
            address: data.address,
            notes: data.notes,
            phones: data.phones,
        });
    };

    if (!Number.isFinite(clientId)) return <p>Invalid client id</p>;
    if (isLoading) return <Spinner text="Loading client..." />;
    if (clientError) return <p>{clientError.message}</p>;
    if (!data?.data) return <p>Client not found</p>;

    return (
        <div>
            {updateError && (
                <ErrorMessage messages={getBackendErrorMessage(updateError, "Could not update client.")} />
            )}
            {isSuccess && updateResult ? (
                <SuccessMessage
                    tag="client"
                    successText="Client updated successfully. Returning to client details shortly."
                    time={2000}
                    onComplete={() => navigate(`/clients/${updateResult.data.id}`)}
                />
            ) : (
                <ClientForm
                    client={data.data}
                    isPending={isPending}
                    onCancel={() => navigate(`/clients/${clientId}`)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};
