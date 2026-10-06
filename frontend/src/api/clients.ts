import { apiClient } from "@/api/client";
import type {
    ClientFilters,
    ClientResponse,
    ClientsResponse,
    CreateClientData,
    UpdateClientData,
} from "@/types/clientTypes";

export const getClients = (filters?: ClientFilters) => {
    const params = new URLSearchParams();

    if (filters?.name?.trim()) {
        params.set("name", filters.name.trim());
    }
    if (filters?.type) {
        params.set("type", filters.type);
    }

    return apiClient<ClientsResponse>("/clients", { method: "GET", params });
};

export const getClient = (id: number) => {
    return apiClient<ClientResponse>(`/clients/${id}`, { method: "GET" });
};

export const createClient = (data: CreateClientData) => {
    return apiClient<ClientResponse>("/clients", { method: "POST", data });
};

export const updateClient = (id: number, data: UpdateClientData) => {
    return apiClient<ClientResponse>(`/clients/${id}`, { method: "PATCH", data });
};

export const deleteClient = (id: number) => {
    return apiClient<void>(`/clients/${id}`, { method: "DELETE" });
};
