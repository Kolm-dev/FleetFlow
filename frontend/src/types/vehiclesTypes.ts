import type { Driver } from "@/types/driversTypes";
import type { VehicleServiceStatistics } from "@/types/vehicleServicesTypes";

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
    search?: string;
    page?: number;
};

export type VehiclesResponse = {
    total: number;
    vehicles: Vehicle[];
    current_page: number;
    last_page: number;
    per_page: number;
};

export type VehicleResponse = {
    vehicle: Vehicle;
    service_statistics: VehicleServiceStatistics;
};

export type VehicleActionResponse = {
    message: string;
    vehicle: Vehicle;
};

export type UpdateVehicleData = Partial<CreateVehicleData>;
