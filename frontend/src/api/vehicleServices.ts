import { apiClient } from "@/api/client";
import type {
    CreateVehicleServiceData,
    PaginatedVehicleServices,
    UpdateVehicleServiceData,
    VehicleService,
    VehicleServicesFilters,
} from "@/types/vehicleServicesTypes";

export function getVehicleServices(
    vehicleId: number,
    filters?: VehicleServicesFilters,
) {
    const params = new URLSearchParams();

    filters?.types?.forEach((type) => params.append("types[]", type));
    filters?.sort?.forEach((sort) => params.append("sort[]", sort));

    if (filters?.page) {
        params.set("page", filters.page.toString());
    }

    const query = params.toString();

    return apiClient<PaginatedVehicleServices>(
        `/vehicles/${vehicleId}/services${query ? `?${query}` : ""}`,
    );
}

export function createVehicleService(
    vehicleId: number,
    data: CreateVehicleServiceData,
) {
    return apiClient<VehicleService>(`/vehicles/${vehicleId}/services`, {
        method: "POST",
        data,
    });
}

export function updateVehicleService(
    vehicleId: number,
    serviceId: number,
    data: UpdateVehicleServiceData,
) {
    return apiClient<{ message: string; service: VehicleService }>(
        `/vehicles/${vehicleId}/services/${serviceId}`,
        {
            method: "PATCH",
            data,
        },
    );
}

export function deleteVehicleService(vehicleId: number, serviceId: number) {
    return apiClient<{ message: string }>(
        `/vehicles/${vehicleId}/services/${serviceId}`,
        { method: "DELETE" },
    );
}
