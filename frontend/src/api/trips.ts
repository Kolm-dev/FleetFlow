import { apiClient } from "@/api/client";
import type {
    CreateTripData,
    PaginatedTrips,
    TripActionResponse,
    TripResponse,
    TripsFilters,
    UpdateTripData,
} from "@/types/tripsTypes";

export function getTrips(filters?: TripsFilters) {
    const params = new URLSearchParams();

    if (filters?.status) {
        filters.status.forEach(status => {
            params.append("status[]", status);
        });
    }

    if (filters?.page) {
        params.set("page", filters.page.toString());
    }

    if (filters?.sort) {
        params.set("sort", filters.sort);
    }

    if (filters?.search?.trim()) {
        params.set("search", filters.search.trim());
    }
    const query = params.toString();

    return apiClient<PaginatedTrips>(`/trips${query ? `?${query}` : ""}`);
}

export async function getTrip(id: number) {
    const response = await apiClient<TripResponse>(`/trips/${id}`);
    return response.trip;
}

export function createTrip(data: CreateTripData) {
    return apiClient<TripActionResponse>("/trips", {
        method: "POST",
        data: data,
    });
}

export function updateTrip(data: UpdateTripData, id: number) {
    return apiClient<TripActionResponse>(`/trips/${id}`, {
        method: "PATCH",
        data: data,
    });
}

export function startTrip(id: number) {
    return apiClient<TripActionResponse>(`/trips/${id}/start`, {
        method: "PATCH",
    });
}

export function closeTrip(id: number) {
    return apiClient<TripActionResponse>(`/trips/${id}/close`, {
        method: "PATCH",
    });
}

export function cancelTrip(id: number) {
    return apiClient<TripActionResponse>(`/trips/${id}/cancel`, {
        method: "PATCH",
    });
}

export function deleteTrip(id: number) {
    return apiClient<void>(`/trips/${id}`, {
        method: "DELETE",
    });
}
