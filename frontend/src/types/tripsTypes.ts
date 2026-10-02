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

export type TripStatus = "closed" | "pending" | "planned" | "cancelled";
export type TripSort = "price" | "-price" | "created_at" | "-created_at";

export type TripsFilters = {
    status?: TripStatus[];
    page?: number;
    sort?: TripSort;
    search?: string;
};

export type PaginatedTrips = {
    data: Trip[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type TripResponse = {
    trip: Trip;
};

export type TripActionResponse = {
    message: string;
    trip: Trip;
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

export type TripAttachmentKind = "image" | "document" | "text";

export type TripAttachment = {
    id: number;
    trip_id: number;
    original_name: string;
    mime_type: string;
    size: number;
    kind: TripAttachmentKind;
    can_preview: boolean;
    created_at: string;
    display_name: string;
};

export type TripAttachmentsResponse = {
    data: TripAttachment[];
};

export type UploadTripAttachmentsResponse = {
    message: string;
    data: TripAttachment[];
};

export type TripAttachmentsCreateResponse = {
    message: string;
    data: TripAttachment[];
};
