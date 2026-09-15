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
};

export type DriversResponse = {
    total: number;
    drivers: Driver[];
};

export type DriverResponse = {
    driver: Driver;
};

export type DriverActionResponse = {
    message: string;
    driver: Driver;
};

export type UpdateDriverData = Partial<CreateDriverData>;
