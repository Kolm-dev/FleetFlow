import { useState } from "react";
import type { FormEvent } from "react";
import type { Client, ClientPhone, ClientType } from "@/types/clientTypes";

export type ClientFormData = {
    name: string;
    type: ClientType;
    email: string | null;
    address: string;
    notes: string | null;
    phones: ClientPhone[];
};

type ClientFormProps = {
    client?: Client;
    isPending?: boolean;
    onCancel: () => void;
    onSubmit: (data: ClientFormData) => void;
};

const emptyPhone: ClientPhone = { phone_number: "", label: null };

export const ClientForm = ({ client, isPending = false, onCancel, onSubmit }: ClientFormProps) => {
    const isEdit = client !== undefined;
    const initialPhones = client?.phones.length ? client.phones : [{ ...emptyPhone }];

    const [name, setName] = useState(client?.name ?? "");
    const [type, setType] = useState<ClientType>(client?.type ?? "individual");
    const [email, setEmail] = useState(client?.email ?? "");
    const [address, setAddress] = useState(client?.address ?? "");
    const [notes, setNotes] = useState(client?.notes ?? "");
    const [phones, setPhones] = useState<ClientPhone[]>(initialPhones);

    const removePhone = (index: number) => {
        setPhones(prev => (prev.length === 1 ? [{ ...emptyPhone }] : prev.filter((_, i) => i !== index)));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const phonesPayload = phones
            .filter(p => p.phone_number.trim() !== "")
            .map(p => ({
                phone_number: p.phone_number.trim(),
                label: p.label?.trim() || null,
            }));

        onSubmit({
            name: name.trim(),
            type,
            email: email.trim() || null,
            address: address.trim(),
            notes: notes.trim() || null,
            phones: phonesPayload,
        });
    };

    return (
        <form className="client-form" onSubmit={handleSubmit}>
            <header className="client-form__header">
                <h1>{isEdit ? "Edit Client" : "Create Client"}</h1>
                {isEdit && <p>{client.name}</p>}
            </header>

            <div className="client-form__fields">
                <div>
                    <label htmlFor="client-name">Name</label>
                    <input
                        id="client-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="client-email">Email</label>
                    <input
                        id="client-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="client-type">Type</label>
                    {isEdit ? (
                        <input
                            id="client-type"
                            type="text"
                            value={type}
                            readOnly
                        />
                    ) : (
                        <select
                            id="client-type"
                            value={type}
                            onChange={e => setType(e.target.value as ClientType)}
                        >
                            <option value="individual">Individual</option>
                            <option value="company">Company</option>
                        </select>
                    )}
                </div>

                <div>
                    <label htmlFor="client-address">Address</label>
                    <input
                        id="client-address"
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        required
                    />
                </div>
            </div>

            <fieldset className="client-form__phones">
                <legend>Phones</legend>
                {phones.map((phone, index) => (
                    <div className="client-form__phone-row" key={index}>
                        <input
                            type="tel"
                            placeholder="Phone number"
                            value={phone.phone_number}
                            onChange={e =>
                                setPhones(prev =>
                                    prev.map((item, i) =>
                                        i === index ? { ...item, phone_number: e.target.value } : item,
                                    ),
                                )
                            }
                            required
                        />
                        <input
                            type="text"
                            placeholder="Label"
                            value={phone.label ?? ""}
                            onChange={e =>
                                setPhones(prev =>
                                    prev.map((item, i) =>
                                        i === index ? { ...item, label: e.target.value } : item,
                                    ),
                                )
                            }
                        />
                        <button
                            className="entity-action entity-action--delete"
                            type="button"
                            onClick={() => removePhone(index)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    className="entity-action entity-action--create"
                    type="button"
                    onClick={() => setPhones(prev => [...prev, { ...emptyPhone }])}
                >
                    Add phone
                </button>
            </fieldset>

            <div className="client-form__notes">
                <label htmlFor="client-notes">Notes</label>
                <textarea
                    id="client-notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
            </div>

            <footer className="client-form__actions">
                <button className="entity-action entity-action--update" type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : isEdit ? "Save" : "Create"}
                </button>
                <button type="button" onClick={onCancel} disabled={isPending}>
                    Cancel
                </button>
            </footer>
        </form>
    );
};
