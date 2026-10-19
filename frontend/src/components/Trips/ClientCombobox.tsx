import type { Client } from "@/types/clientTypes";
import { formControlClass, formFieldClass } from "@/components/shared/EntityForm";
import { useMemo, useState } from "react";

type ClientComboboxProps = {
    clients: ClientOption[];
    disabled?: boolean;
    value?: number;
    onChange: (clientId: number | undefined) => void;
};

type ClientOption = Pick<Client, "id" | "name" | "type">;

export const ClientCombobox = ({ clients, disabled = false, value, onChange }: ClientComboboxProps) => {
    const selectedClient = clients.find(client => client.id === value);
    const [search, setSearch] = useState(selectedClient?.name ?? "");
    const [isOpen, setIsOpen] = useState(false);

    const filteredClients = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
            return clients;
        }

        return clients.filter(client => client.name.toLowerCase().includes(normalizedSearch));
    }, [clients, search]);

    const selectClient = (client: ClientOption) => {
        setSearch(client.name);
        setIsOpen(false);
        onChange(client.id);
    };

    return (
        <div className="relative min-w-0">
            <label className={formFieldClass}>
                Client
                <input
                    className={formControlClass}
                    type="search"
                    value={search}
                    placeholder="Type client name"
                    disabled={disabled}
                    onFocus={() => setIsOpen(true)}
                    onChange={event => {
                        setSearch(event.currentTarget.value);
                        setIsOpen(true);
                        onChange(undefined);
                    }}
                />
            </label>

            {isOpen && !disabled && (
                <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
                    {filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                            <button
                                className="m-0 flex w-full items-center justify-between gap-2 rounded-sm border-0 bg-transparent px-3 py-2 text-left text-sm text-popover-foreground hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                                key={client.id}
                                type="button"
                                onMouseDown={event => event.preventDefault()}
                                onClick={() => selectClient(client)}
                            >
                                <span>{client.name}</span>
                                <small className="text-muted-foreground">{client.type}</small>
                            </button>
                        ))
                    ) : (
                        <p className="m-0 p-2 text-sm text-muted-foreground">No clients found</p>
                    )}
                </div>
            )}
        </div>
    );
};
