import { EntityForm, formControlClass, formFieldClass, formGridClass } from "@/components/shared/EntityForm";
import { Button } from "@/components/ui/button";
import type { Client, ClientPhone, ClientType } from "@/types/clientTypes";
import { useState, type FormEvent } from "react";

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
    const [name, setName] = useState(client?.name ?? "");
    const [type, setType] = useState<ClientType>(client?.type ?? "individual");
    const [email, setEmail] = useState(client?.email ?? "");
    const [address, setAddress] = useState(client?.address ?? "");
    const [notes, setNotes] = useState(client?.notes ?? "");
    const [phones, setPhones] = useState<ClientPhone[]>(client?.phones.length ? client.phones : [{ ...emptyPhone }]);

    const removePhone = (index: number) => {
        setPhones(previous => previous.length === 1 ? [{ ...emptyPhone }] : previous.filter((_, i) => i !== index));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const phonesPayload = phones
            .filter(phone => phone.phone_number.trim() !== "")
            .map(phone => ({ phone_number: phone.phone_number.trim(), label: phone.label?.trim() || null }));

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
        <EntityForm
            title={isEdit ? "Edit client" : "Create client"}
            description={client?.name}
            submitLabel={isEdit ? "Save client" : "Create client"}
            pendingLabel="Saving..."
            isPending={isPending}
            onCancel={onCancel}
            onSubmit={handleSubmit}
        >
            <div className={formGridClass}>
                <label className={formFieldClass}>
                    Name
                    <input className={formControlClass} required value={name} onChange={event => setName(event.currentTarget.value)} />
                </label>
                <label className={formFieldClass}>
                    Email
                    <input className={formControlClass} type="email" value={email} onChange={event => setEmail(event.currentTarget.value)} />
                </label>
                <label className={formFieldClass}>
                    Type
                    {isEdit ? (
                        <input className={formControlClass} value={type} readOnly />
                    ) : (
                        <select className={formControlClass} value={type} onChange={event => setType(event.currentTarget.value as ClientType)}>
                            <option value="individual">Individual</option>
                            <option value="company">Company</option>
                        </select>
                    )}
                </label>
                <label className={formFieldClass}>
                    Address
                    <input className={formControlClass} required value={address} onChange={event => setAddress(event.currentTarget.value)} />
                </label>
            </div>

            <fieldset className="min-w-0 rounded-lg border border-border p-4">
                <legend className="px-1 text-sm font-semibold text-foreground">Phones</legend>
                <div className="grid gap-3">
                    {phones.map((phone, index) => (
                        <div className="grid min-w-0 items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" key={index}>
                            <label className={formFieldClass}>
                                Phone number
                                <input
                                    className={formControlClass}
                                    type="tel"
                                    required
                                    value={phone.phone_number}
                                    onChange={event => {
                                        const value = event.currentTarget.value;
                                        setPhones(previous => previous.map((item, i) => i === index ? { ...item, phone_number: value } : item));
                                    }}
                                />
                            </label>
                            <label className={formFieldClass}>
                                Label
                                <input
                                    className={formControlClass}
                                    value={phone.label ?? ""}
                                    onChange={event => {
                                        const value = event.currentTarget.value;
                                        setPhones(previous => previous.map((item, i) => i === index ? { ...item, label: value } : item));
                                    }}
                                />
                            </label>
                            <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => removePhone(index)}>
                                Remove
                            </Button>
                        </div>
                    ))}
                    <Button className="w-fit" type="button" variant="outline" onClick={() => setPhones(previous => [...previous, { ...emptyPhone }])}>
                        Add phone
                    </Button>
                </div>
            </fieldset>

            <label className={formFieldClass}>
                Notes
                <textarea className={`${formControlClass} min-h-28 resize-y`} value={notes} onChange={event => setNotes(event.currentTarget.value)} />
            </label>
        </EntityForm>
    );
};
