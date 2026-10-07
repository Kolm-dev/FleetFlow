import { deleteClient, getClients } from "@/api/clients";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Spinner } from "@/components/Spinner/Spinner";
import { useDebounce } from "@/hooks/useDebounce";
import { getBackendErrorMessage } from "@/libs/errors";
import type { Client, ClientType } from "@/types/clientTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { NavLink, useNavigate } from "react-router";

const ClientsList = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [type, setType] = React.useState<ClientType | "all">("all");
    const [nameInput, setNameInput] = React.useState("");
    const [clientToDelete, setClientToDelete] = React.useState<Client | null>(null);
    const [deleteErrorMessage, setDeleteErrorMessage] = React.useState<string | null>(null);
    const debouncedName = useDebounce(nameInput, 700);
    const nameInputRef = React.useRef<HTMLInputElement>(null);

    const {
        data: clientsData,
        isPending,
        error,
    } = useQuery({
        queryKey: ["clients", { name: debouncedName, type }],
        queryFn: () => getClients({ name: debouncedName, type: type === "all" ? undefined : type }),
    });

    React.useEffect(() => {
        if (debouncedName.trim() !== "") {
            nameInputRef.current?.focus();
        }
    }, [clientsData, debouncedName]);

    const {
        mutate: removeClient,
        isPending: isDeleting,
    } = useMutation({
        mutationFn: (id: number) => deleteClient(id),
        onSuccess: () => {
            setClientToDelete(null);
            setDeleteErrorMessage(null);
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
        onError: error => {
            setClientToDelete(null);
            setDeleteErrorMessage(getBackendErrorMessage(error, "Could not delete client."));
        },
    });

    const handleDelete = (client: Client) => {
        setDeleteErrorMessage(null);
        setClientToDelete(client);
    };

    const handleConfirmDelete = () => {
        if (!clientToDelete) return;

        removeClient(clientToDelete.id);
    };

    const copyCellText = (text: string) => {
        void navigator.clipboard.writeText(text);
    };

    if (isPending) return <Spinner text="Loading clients..." />;

    if (error) return <div>Error loading clients</div>;

    const clients = clientsData?.data ?? [];

    return (
        <div className="clients-page">
            <header className="page-header entity-list-header">
                <div>
                    <h2>Clients</h2>
                    <p>Total found: {clients.length}</p>
                </div>
                <NavLink
                    className="create-link entity-action--create"
                    to="/clients/create"
                >
                    Create client
                </NavLink>
            </header>

            <div className="entity-search clients-search">
                <label>
                    Search clients
                    <input
                        ref={nameInputRef}
                        type="search"
                        placeholder="Client name"
                        value={nameInput}
                        onChange={e => setNameInput(e.currentTarget.value)}
                    />
                </label>
                <label>
                    Type
                    <select
                        name="type"
                        value={type}
                        onChange={e => setType(e.target.value as ClientType | "all")}
                    >
                        <option value="all">All</option>
                        <option value="individual">Individual</option>
                        <option value="company">Company</option>
                    </select>
                </label>
            </div>

            <div className="clients-type-actions">
                <button
                    className={type === "all" ? "is-active" : undefined}
                    onClick={() => setType("all")}
                >
                    All
                </button>
                <button
                    className={type === "individual" ? "is-active" : undefined}
                    onClick={() => setType("individual")}
                >
                    Individual
                </button>
                <button
                    className={type === "company" ? "is-active" : undefined}
                    onClick={() => setType("company")}
                >
                    Company
                </button>
            </div>
            {deleteErrorMessage && <div className="error-message">{deleteErrorMessage}</div>}

            <table className="clients-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Email</th>
                        <th>Phone(s)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client: Client, _i) => (
                        <tr key={client.id}>
                            <td
                                className="clients-table__copy-cell"
                                data-copy-label="Copy"
                                onClick={() => copyCellText(client.name)}
                            >
                                {_i + 1}. {client.name}
                            </td>
                            <td
                                className="clients-table__copy-cell"
                                data-copy-label="Copy"
                                onClick={() => copyCellText(client.type)}
                            >
                                {client.type}
                            </td>
                            <td
                                className="clients-table__copy-cell"
                                data-copy-label="Copy"
                                onClick={() => copyCellText(client.email ?? "")}
                            >
                                {client.email ?? "-"}
                            </td>
                            <td
                                className="clients-table__copy-cell"
                                data-copy-label="Copy"
                                onClick={() => copyCellText(client.phones.map(phone => phone.phone_number).join(", "))}
                            >
                                {client.phones.length ? client.phones.map(phone => phone.phone_number).join(", ") : "-"}
                            </td>
                            <td>
                                <div className="clients-table__actions">
                                    <button
                                        className="entity-action entity-action--details"
                                        onClick={() => navigate(`/clients/${client.id}`)}
                                    >
                                        Open
                                    </button>
                                    <button
                                        className="entity-action entity-action--edit"
                                        onClick={() => navigate(`/clients/${client.id}/edit`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="entity-action entity-action--delete"
                                        disabled={isDeleting}
                                        onClick={() => handleDelete(client)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {clients.length === 0 && <p className="empty-state">No clients found</p>}

            <ConfirmModal
                isOpen={clientToDelete !== null}
                title="Delete client?"
                message={
                    clientToDelete ? `Client "${clientToDelete.name}" will be permanently deleted.` : undefined
                }
                confirmText="Delete client"
                isConfirming={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setClientToDelete(null)}
            />
        </div>
    );
};

export default ClientsList;
