import type { Driver } from "@/types/driversTypes";
import type { VehicleServiceStatistics } from "@/types/vehicleServicesTypes";

export type FuelType = "diesel" | "gasoline";



export interface Vehicle {
    id: number;
    brand: string;
    model: string;
    license_plate: string;
    year: number | null;
    fuel_type: FuelType;
    driver_id: number | null;
    fuel_consumption: number;
    driver: Driver | null;
}

export type CreateVehicleData = {
    brand: string;
    model: string;
    license_plate: string;
    fuel_type: FuelType;
    fuel_consumption?: number
    driver_id: number;
    year?: number | null;
};

export type VehiclesFilters = {
    driver_id?: number;
    license_plate?: string;
    search?: string;
    page?: number;
    driver_assignment?: VehicleDriverAssignment;
};

export type VehicleDriverAssignment = "assigned" | "unassigned";

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
