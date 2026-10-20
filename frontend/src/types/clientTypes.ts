export type ClientType = "individual" | "company";

export type ClientPhone = {
    phone_number: string;
    label: string | null;
};

export type ClientFilters = {
    name?: string;
    type?: ClientType | null;
};

export type Client = {
    id: number;
    name: string;
    email: string | null;
    address: string | null;
    notes: string | null;
    type: ClientType;
    phones: ClientPhone[];
};

/** Client embedded in a trip response; phones may be absent if the relation was not loaded. */
export type TripClient = Omit<Client, "phones"> & {
    phones?: ClientPhone[];
};

export type ClientsResponse = {
    data: Client[];
};

export type ClientResponse = {
    data: Client;
};

export type CreateClientData = {
    type: ClientType;
    name: string;
    email?: string | null;
    address: string;
    notes?: string | null;
    phones: ClientPhone[];
};

export type UpdateClientData = Partial<{
    email: string | null;
    address: string;
    notes: string | null;
    phones: ClientPhone[];
}>;
