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
