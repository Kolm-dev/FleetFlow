import type { Driver } from "@/types/driversTypes";
import type { Vehicle } from "@/types/vehiclesTypes";

export interface Trip {
    id: number;
    title: string;
    driver_id: number;
    vehicle_id: number;
    distance: number | null;
    price: number | null;
    status: TripStatus;
    created_at?: string;
    driver?: Driver;
    vehicle?: Vehicle;
}

export type TripStatus = "closed" | "pending" | "planned";
export type TripSort = "price" | "-price" | "created_at" | "-created_at";

export type TripsFilters = {
    status?: TripStatus;
    page?: number;
    sort?: TripSort;
};

export type PaginatedTrips = {
    data: Trip[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type CreateTripData = {
    title: string;
    driver_id: number;
    vehicle_id: number;
    distance?: number | null;
    price?: number | null;
    status?: TripStatus;
};

export type UpdateTripData = Partial<{
    title: string;
    driver_id: number;
    vehicle_id: number;
    distance: number | null;
    price: number | null;
    status: TripStatus;
}>;
