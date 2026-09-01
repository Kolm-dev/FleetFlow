import { apiClient } from "@/api/client";
import type {
    CreateDriverData,
    CreatedDriver,
    Driver,
    DriversFilters,
    DriversResponse,
    UpdateDriverData,
} from "@/types/driversTypes";

export function getDrivers(filters?: DriversFilters) {
    const params = new URLSearchParams();

    if (filters?.status) {
        params.set("status", filters.status);
    }

    const query = params.toString();

    return apiClient<DriversResponse>(`/drivers${query ? `?${query}` : ""}`);
}

export function getDriver(id: number) {
    return apiClient<Driver>(`/drivers/${id}`);
}

export function createDriver(data: CreateDriverData) {
    return apiClient<CreatedDriver>("/drivers", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateDriver(data: UpdateDriverData, id: number) {
    return apiClient<Driver>(`/drivers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function deleteDriver(id: number) {
    return apiClient<void>(`/drivers/${id}`, {
        method: "DELETE",
    });
}
