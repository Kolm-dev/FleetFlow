import type { Driver } from "@/types/driversTypes";
import type { Vehicle } from "@/types/vehiclesTypes";
import type { Client } from "@/types/clientTypes";

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
    client?: Client;
    client_id: number;
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
    client_id: number;
};

export type UpdateTripData = Partial<{
    title: string;
    driver_id: number;
    vehicle_id: number;
    distance: number | null;
    price: number | null;
    client_id: number;
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

export type TripEventType =
    | "trip.created"
    | "trip.updated"
    | "trip.started"
    | "trip.closed"
    | "trip.cancelled"
    | "trip.attachment.added"
    | "trip.attachment.deleted"
    | "trip.attachment.renamed"
    | "trip.driver.changed"
    | "trip.deleted";

export type EventFilter = TripEventType | "all";

export type TripEventUser = {
    id: number;
    name: string;
};

export type TripEventFieldChange = {
    old?: unknown;
    new?: unknown;
};

export type TripEventData = {
    title?: string;
    distance?: number | null;
    price?: number | string | null;
    status?: TripStatus;
    old_status?: TripStatus;
    new_status?: TripStatus;
    driver_id?: number;
    client_id?: number;
    old_driver_id?: number;
    new_driver_id?: number;
    vehicle_id?: number;
    attachment_id?: number;
    original_name?: string;
    display_name?: string;
    old_display_name?: string;
    new_display_name?: string;
    fields?: Record<string, TripEventFieldChange>;
    changes?: Record<string, TripEventFieldChange>;
};

export type TripEvent = {
    id: number;
    trip_id: number;
    event_type: TripEventType;
    data: TripEventData | null;
    user: TripEventUser | null;
    created_at: string;
};

export type TripEventsResponse = {
    data: TripEvent[];
};
