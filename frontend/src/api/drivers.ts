import { apiClient } from "@/api/client";
import type {
    CreateDriverData,
    DriverActionResponse,
    DriverDetailsFilters,
    DriverDetailsResponse,
    DriverResponse,
    DriversFilters,
    DriversResponse,
    UpdateDriverData,
} from "@/types/driversTypes";

export function getDrivers(filters?: DriversFilters) {
    const params = new URLSearchParams();

    if (filters?.status) {
        params.set("status", filters.status);
    }

    if (filters?.search?.trim()) {
        params.set("search", filters.search.trim());
    }

    if (filters?.page) {
        params.set("page", filters.page.toString());
    }

    const query = params.toString();

    return apiClient<DriversResponse>(`/drivers${query ? `?${query}` : ""}`);
}

export async function getDriver(id: number) {
    const response = await apiClient<DriverResponse>(`/drivers/${id}`);
    return response.driver;
}

export function getDriverDetails(id: number, filters?: DriverDetailsFilters) {
    const params = new URLSearchParams();

    if (filters?.page) {
        params.set("page", filters.page.toString());
    }

    const query = params.toString();

    return apiClient<DriverDetailsResponse>(
        `/drivers/${id}${query ? `?${query}` : ""}`,
    );
}

export function createDriver(data: CreateDriverData) {
    return apiClient<DriverActionResponse>("/drivers", {
        method: "POST",
        data: data,
    });
}

export function updateDriver(data: UpdateDriverData, id: number) {
    return apiClient<DriverActionResponse>(`/drivers/${id}`, {
        method: "PATCH",
        data: data,
    });
}

export function deleteDriver(id: number) {
    return apiClient<void>(`/drivers/${id}`, {
        method: "DELETE",
    });
}
