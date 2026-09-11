import { apiClient } from "@/api/client";
import type {
    CreateTripData,
    PaginatedTrips,
    Trip,
    TripResponse,
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

export async function getTrip(id: number) {
    const response = await apiClient<TripResponse>(`/trips/${id}`);
    return response.trip;
}

export function createTrip(data: CreateTripData) {
    return apiClient<Trip>("/trips", {
        method: "POST",
        data: data,
    });
}

export function updateTrip(data: UpdateTripData, id: number) {
    return apiClient<Trip>(`/trips/${id}`, {
        method: "PATCH",
        data: data,
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
