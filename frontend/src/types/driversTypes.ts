import type { DriverStatistics } from "@/types/statsTypes";
import type { PaginatedTrips } from "@/types/tripsTypes";
import type { Vehicle } from "@/types/vehiclesTypes";

export type DriverStatus = "available" | "on_trip" | "unavailable";

export interface Driver {
    id: number;
    name: string;
    phone_number: string;
    status: DriverStatus;
    photo?: string | null;
    vehicles: Vehicle[];
}

export type CreateDriverData = {
    name: string;
    phone_number: string;
    status?: DriverStatus;
    photo?: string | null;
};

export type DriversFilters = {
    status?: DriverStatus;
    search?: string;
    page?: number;
};

export type DriverDetailsFilters = {
    page?: number;
};

export type DriversResponse = {
    total: number;
    drivers: Driver[];
    current_page: number;
    last_page: number;
    per_page: number;
};

export type DriverResponse = {
    driver: Driver;
};

export type DriverActionResponse = {
    message: string;
    driver: Driver;
};

export type UpdateDriverData = Partial<CreateDriverData>;

export type DriverDetailsResponse = {
    driver: Driver;
    statistics: DriverStatistics;
    closed_trips: PaginatedTrips;
};
