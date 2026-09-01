import { apiClient } from "@/api/client";
import type {
    CreateTripData,
    PaginatedTrips,
    Trip,
    TripsFilters,
    UpdateTripData,
} from "@/types/tripsTypes";

export function getTrips(filters?: TripsFilters) {
    const params = new URLSearchParams();

    if (filters?.status) {
        params.set("status", filters.status);
    }

    if (filters?.page) {
        params.set("page", filters.page.toString());
    }

    if (filters?.sort) {
        params.set("sort", filters.sort);
    }

    const query = params.toString();

    return apiClient<PaginatedTrips>(`/trips${query ? `?${query}` : ""}`);
}

export function getTrip(id: number) {
    return apiClient<Trip>(`/trips/${id}`);
}

export function createTrip(data: CreateTripData) {
    return apiClient<Trip>("/trips", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateTrip(data: UpdateTripData, id: number) {
    return apiClient<Trip>(`/trips/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function closeTrip(id: number) {
    return apiClient<Trip>(`/trips/${id}/close`, {
        method: "PATCH",
    });
}

export function deleteTrip(id: number) {
    return apiClient<void>(`/trips/${id}`, {
        method: "DELETE",
    });
}
