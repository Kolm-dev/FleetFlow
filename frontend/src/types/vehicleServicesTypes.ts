export type VehicleServiceType =
    | "scheduled_maintenance"
    | "oil_change"
    | "inspection"
    | "engine_repair"
    | "transmission_repair"
    | "brake_repair"
    | "electrical_repair"
    | "suspension_repair"
    | "tire_service"
    | "body_repair"
    | "other";

export const VEHICLE_SERVICE_TYPES: Array<{
    value: VehicleServiceType;
    label: string;
}> = [
    { value: "scheduled_maintenance", label: "Scheduled maintenance" },
    { value: "oil_change", label: "Oil change" },
    { value: "inspection", label: "Inspection" },
    { value: "engine_repair", label: "Engine repair" },
    { value: "transmission_repair", label: "Transmission repair" },
    { value: "brake_repair", label: "Brake repair" },
    { value: "electrical_repair", label: "Electrical repair" },
    { value: "suspension_repair", label: "Suspension repair" },
    { value: "tire_service", label: "Tire service" },
    { value: "body_repair", label: "Body repair" },
    { value: "other", label: "Other" },
];

export type VehicleServiceSort = "service_date" | "-service_date" | "mileage" | "-mileage" | "cost" | "-cost";

export interface VehicleService {
    id: number;
    vehicle_id: number;
    service_date: string;
    mileage: number;
    type: VehicleServiceType;
    cost: number;
    notes: string | null;
    created_at?: string;
    updated_at?: string;
}

export type PaginatedVehicleServices = {
    data: VehicleService[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type VehicleServiceStatistics = {
    total_services: number;
    total_service_cost: number;
    average_service_cost: number | null;
    last_service_date: string | null;
    last_service_cost: number | null;
    last_service_mileage: number | null;
};

export type VehicleServicesFilters = {
    types?: VehicleServiceType[];
    sort?: VehicleServiceSort[];
    page?: number;
};

export type CreateVehicleServiceData = {
    service_date: string;
    mileage: number;
    type: VehicleServiceType;
    cost: number;
    notes?: string | null;
};

export type VehicleServiceAttachment = {
    id: number;
    vehicle_service_id: number;
    original_name: string;
    mime_type: string;
    size: number;
    user_id: number | null;
    uploaded_at: string;
};

export type VehicleServiceAttachmentsResponse = {
    data: VehicleServiceAttachment[];
};

export type VehicleServiceAttachmentUploadResponse = VehicleServiceAttachmentsResponse & {
    message: string;
};

export type UpdateVehicleServiceData = Partial<CreateVehicleServiceData>;
