import { deleteClient, getClients } from "@/api/clients";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Spinner } from "@/components/Spinner/Spinner";
import { CreateEntityButton } from "@/components/shared/CreateEntityButton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { getBackendErrorMessage } from "@/libs/errors";
import type { Client, ClientType } from "@/types/clientTypes";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, FileText, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const CLIENT_TYPES: { value: ClientType | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "individual", label: "Individual" },
    { value: "company", label: "Company" },
];

const AVATAR_STYLES = [
    "bg-blue-50 text-blue-900",
    "bg-emerald-50 text-emerald-800",
    "bg-amber-50 text-amber-900",
    "bg-violet-50 text-violet-900",
];

const ClientsList = () => {
    const queryClient = useQueryClient();
    const [type, setType] = React.useState<ClientType | "all">("all");
    const [nameInput, setNameInput] = React.useState("");
    const [clientToDelete, setClientToDelete] = React.useState<Client | null>(null);
    const [deleteErrorMessage, setDeleteErrorMessage] = React.useState<string | null>(null);
    const [deleteSuccessMessage, setDeleteSuccessMessage] = React.useState<string | null>(null);
    const debouncedName = useDebounce(nameInput, 700);

    const { data: clientsData, isPending, isFetching, error } = useQuery({
        queryKey: ["clients", { name: debouncedName, type }],
        queryFn: () => getClients({ name: debouncedName, type: type === "all" ? undefined : type }),
        placeholderData: keepPreviousData,
    });

    const { mutate: removeClient, isPending: isDeleting } = useMutation({
        mutationFn: (id: number) => deleteClient(id),
        onSuccess: () => {
            setClientToDelete(null);
            setDeleteErrorMessage(null);
            setDeleteSuccessMessage("Client deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
        onError: error => {
            setClientToDelete(null);
            setDeleteErrorMessage(getBackendErrorMessage(error, "Could not delete client."));
        },
    });

    const copyText = (text: string) => {
        void navigator.clipboard.writeText(text);
    };

    if (isPending) return <Spinner text="Loading clients..." />;
    if (error) return <ErrorMessage messages={getBackendErrorMessage(error, "Error loading clients.")} />;

    const clients = clientsData?.data ?? [];

    return (
        <div className="space-y-4">
            <header className="page-header entity-list-header">
                <div>
                    <h2 className="m-0 text-xl font-semibold tracking-tight text-foreground">Clients</h2>
                    <p className="m-0 mt-1 text-sm text-muted-foreground">Total clients: {clients.length}</p>
                </div>
                <CreateEntityButton entity="client" to="/clients/create" />
            </header>

            <Card className="gap-0 py-0">
                <CardContent className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <label className="m-0 grid min-w-0 gap-1.5 text-sm font-medium text-foreground" htmlFor="client-search">
                        Search clients
                        <input
                            id="client-search"
                            className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            type="search"
                            placeholder="Client name"
                            value={nameInput}
                            onChange={event => setNameInput(event.currentTarget.value)}
                        />
                    </label>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter clients by type">
                        {CLIENT_TYPES.map(option => (
                            <Button
                                key={option.value}
                                type="button"
                                variant={type === option.value ? "default" : "outline"}
                                aria-pressed={type === option.value}
                                onClick={() => setType(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {isFetching && <p className="m-0 text-sm text-muted-foreground" role="status">Searching clients...</p>}
            {deleteErrorMessage && <ErrorMessage messages={deleteErrorMessage} />}
            {deleteSuccessMessage && (
                <SuccessMessage
                    tag="client"
                    successText={deleteSuccessMessage}
                    onComplete={() => setDeleteSuccessMessage(null)}
                />
            )}

            <p className="m-0 flex items-center mb-4 gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <Copy className="size-4 shrink-0" aria-hidden="true" />
                Click a client name, email, or phone number to copy it to the clipboard.
            </p>

            <div className="grid gap-4 lg:grid-cols-2">
                {clients.map(client => {
                    const initials = client.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");

                    return (
                        <Card key={client.id} className="h-full gap-0 rounded-2xl border border-border py-0 shadow-sm">
                            <CardContent className="flex h-full min-w-0 flex-col gap-5 p-5 sm:p-6">
                                <div className="flex min-w-0 items-start gap-4">
                                    <div className={cn("flex size-16 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold sm:size-18", AVATAR_STYLES[client.id % AVATAR_STYLES.length])} aria-hidden="true">
                                        {initials || "?"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="m-0 text-sm text-muted-foreground">Client #{client.id}</p>
                                        <button
                                            type="button"
                                            className="mt-1 flex max-w-full items-center gap-2 border-0 bg-transparent p-0 text-left text-lg font-semibold leading-tight text-foreground hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                                            title="Copy client name"
                                            aria-label={"Copy name " + client.name}
                                            onClick={() => copyText(client.name)}
                                        >
                                            <span className="min-w-0 wrap-break-word">{client.name}</span>
                                            <Copy className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                        </button>
                                        <span className="mt-2 inline-flex rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                                            {client.type === "company" ? "Company" : "Individual"}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                                    <div className="grid min-w-0 content-start gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                            {client.email ? (
                                                <button type="button" className="min-w-0 border-0 bg-transparent p-0 text-left text-sm text-foreground hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring" title="Copy email" onClick={() => copyText(client.email ?? "")}>
                                                    <span className="wrap-break-word">{client.email}</span>
                                                </button>
                                            ) : <span className="text-sm text-muted-foreground">—</span>}
                                        </div>
                                        <div className="flex min-w-0 items-start gap-3">
                                            <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                            {client.phones.length > 0 ? (
                                                <div className="grid min-w-0 gap-2">
                                                    {client.phones.map((phone, index) => (
                                                        <button key={phone.phone_number + "-" + index} type="button" className="min-w-0 border-0 bg-transparent p-0 text-left text-sm text-foreground hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring" title="Copy phone number" onClick={() => copyText(phone.phone_number)}>
                                                            <span className="wrap-break-word">{phone.phone_number}{phone.label && " (" + phone.label + ")"}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : <span className="text-sm text-muted-foreground">—</span>}
                                        </div>
                                        <div className="flex min-w-0 items-start gap-3">
                                            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                            <span className="min-w-0 wrap-break-word text-sm text-foreground">{client.address || "—"}</span>
                                        </div>
                                    </div>
                                    <div className="flex min-w-0 gap-3 border-t pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                                        <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                        <div className="min-w-0">
                                            <p className="m-0 text-sm text-muted-foreground">Notes</p>
                                            <p className="m-0 mt-1 wrap-break-word whitespace-pre-wrap text-sm text-foreground">{client.notes || "—"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
                                    <Link className={cn(buttonVariants({ variant: "secondary" }), "min-w-20 no-underline")} to={"/clients/" + client.id + "/edit"}>Edit</Link>
                                    <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => {
                                        setDeleteErrorMessage(null);
                                        setDeleteSuccessMessage(null);
                                        setClientToDelete(client);
                                    }}>
                                        <Trash2 aria-hidden="true" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {clients.length === 0 && <p className="empty-state">No clients found</p>}
            </div>

            <ConfirmModal
                isOpen={clientToDelete !== null}
                title="Delete client?"
                message={clientToDelete ? "Client \"" + clientToDelete.name + "\" will be permanently deleted." : undefined}
                confirmText="Delete client"
                isConfirming={isDeleting}
                onConfirm={() => clientToDelete && removeClient(clientToDelete.id)}
                onCancel={() => setClientToDelete(null)}
            />
        </div>
    );
};

export default ClientsList;
