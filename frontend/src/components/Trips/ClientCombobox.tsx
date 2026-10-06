import type { Client } from "@/types/clientTypes";
import { useMemo, useState } from "react";

type ClientComboboxProps = {
    clients: Client[];
    disabled?: boolean;
    value?: number;
    onChange: (clientId: number | undefined) => void;
};

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

    const selectClient = (client: Client) => {
        setSearch(client.name);
        setIsOpen(false);
        onChange(client.id);
    };

    return (
        <div className="client-combobox">
            <label>
                Client
                <input
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
                <div className="client-combobox__options">
                    {filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                            <button
                                key={client.id}
                                type="button"
                                onMouseDown={event => event.preventDefault()}
                                onClick={() => selectClient(client)}
                            >
                                <span>{client.name}</span>
                                <small>{client.type}</small>
                            </button>
                        ))
                    ) : (
                        <p>No clients found</p>
                    )}
                </div>
            )}
        </div>
    );
};
