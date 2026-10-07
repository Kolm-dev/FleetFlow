import { deleteClient, getClient } from "@/api/clients";
import { Spinner } from "@/components/Spinner/Spinner";
import { getBackendErrorMessage } from "@/libs/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

const ClientCard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { clientId } = useParams();
    const id = Number(clientId);

    const {
        data,
        isLoading,
        error: clientError,
    } = useQuery({
        queryKey: ["client", id],
        queryFn: () => getClient(id),
        enabled: Number.isFinite(id),
    });

    const {
        mutate: removeClient,
        isPending: isDeleting,
        error: deleteError,
    } = useMutation({
        mutationFn: () => deleteClient(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            navigate("/clients");
        },
    });

    if (!Number.isFinite(id)) return <p>Invalid client id</p>;
    if (isLoading) return <Spinner text="Loading client..." />;
    if (clientError) return <p>{clientError.message}</p>;
    if (!data?.data) return <p>Client not found</p>;

    const client = data.data;

    return (
        <div className="client-card-page">
            <header className="page-header entity-list-header">
                <div>
                    <h2>{client.name}</h2>
                    <p>Client details</p>
                </div>
                <button className="entity-action entity-action--details" onClick={() => navigate("/clients")}>
                    Back
                </button>
            </header>
            <dl className="client-details">
                <dt>Type</dt>
                <dd>{client.type}</dd>
                <dt>Email</dt>
                <dd>{client.email ?? "-"}</dd>
                <dt>Address</dt>
                <dd>{client.address ?? "-"}</dd>
                <dt>Notes</dt>
                <dd>{client.notes ?? "-"}</dd>
                <dt>Phones</dt>
                <dd>
                    {client.phones.length
                        ? client.phones.map(phone => (
                              <div key={`${phone.phone_number}-${phone.label ?? ""}`}>
                                  {phone.phone_number}
                                  {phone.label ? ` (${phone.label})` : ""}
                              </div>
                          ))
                        : "-"}
                </dd>
            </dl>
            {deleteError && (
                <p className="error-message">{getBackendErrorMessage(deleteError, "Could not delete client.")}</p>
            )}
            <button className="entity-action entity-action--edit" onClick={() => navigate(`/clients/${client.id}/edit`)}>
                Edit
            </button>
            <button
                className="entity-action entity-action--delete"
                disabled={isDeleting}
                onClick={() => {
                    if (window.confirm(`Delete client "${client.name}"?`)) {
                        removeClient();
                    }
                }}
            >
                Delete
            </button>
        </div>
    );
};

export default ClientCard;
