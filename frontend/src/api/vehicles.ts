import { apiClient } from "@/api/client";
import type {
    CreatedVehicleResponse,
    CreateVehicleData,
    UpdateVehicleData,
    Vehicle,
    VehicleResponse,
    VehiclesFilters,
    VehiclesResponse,
} from "@/types/vehiclesTypes";

export function getVehicles(filters?: VehiclesFilters) {
    const params = new URLSearchParams();

    if (filters?.driver_id) {
        params.set("driver_id", filters.driver_id.toString());
    }

    if (filters?.license_plate) {
        params.set("license_plate", filters.license_plate);
    }

    const query = params.toString();

    return apiClient<VehiclesResponse>(`/vehicles${query ? `?${query}` : ""}`);
}

export async function getVehicle(id: number) {
    const response = await apiClient<VehicleResponse>(`/vehicles/${id}`);
    return response.vehicle;
}

export function createVehicle(data: CreateVehicleData) {
    return apiClient<CreatedVehicleResponse>("/vehicles", {
        method: "POST",
        data: data,
    });
}

export function updateVehicle(data: UpdateVehicleData, id: number) {
    return apiClient<Vehicle>(`/vehicles/${id}`, {
        method: "PATCH",
        data: data,
    });
}

export function deleteVehicle(id: number) {
    return apiClient<void>(`/vehicles/${id}`, {
        method: "DELETE",
    });
}
