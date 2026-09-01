import type { Driver } from "@/types/driversTypes";

export interface Vehicle {
    id: number;
    brand: string;
    model: string;
    license_plate: string;
    year: number | null;
    driver_id: number;
    driver: Driver;
}

export type CreateVehicleData = {
    brand: string;
    model: string;
    license_plate: string;
    driver_id: number;
    year?: number | null;
};

export type VehiclesFilters = {
    driver_id?: number;
    license_plate?: string;
};

export type VehiclesResponse = {
    total: number;
    vehicles: Vehicle[];
};

export type CreatedVehicleResponse = {
    message: string;
    vehicle: Vehicle;
};

export type UpdateVehicleData = Partial<CreateVehicleData>;
