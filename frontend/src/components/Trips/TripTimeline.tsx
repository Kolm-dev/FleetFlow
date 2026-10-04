import { Spinner } from "@/components/Spinner/Spinner";
import EventFilters from "@/components/Trips/EventFilters";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTripEvents } from "@/hooks/useTripEvents";
import { formatCurrency, formatDateTime, formatNullableValue } from "@/libs/utils";
import type {
    EventFilter,
    TripEvent,
    TripEventData,
    TripEventFieldChange,
    TripEventType,
    TripStatus,
} from "@/types/tripsTypes";
import { useState } from "react";

const eventTitles: Record<TripEventType, string> = {
    "trip.created": "Trip created",
    "trip.updated": "Trip updated",
    "trip.started": "Trip started",
    "trip.closed": "Trip closed",
    "trip.cancelled": "Trip cancelled",
    "trip.driver.changed": "Driver changed",
    "trip.attachment.added": "Attachment uploaded",
    "trip.attachment.deleted": "Attachment deleted",
    "trip.attachment.renamed": "Attachment renamed",
    "trip.deleted": "Trip deleted",
};

const fieldLabels: Record<string, string> = {
    title: "Title",
    driver_id: "Driver ID",
    vehicle_id: "Vehicle ID",
    distance: "Distance",
    price: "Price",
    status: "Status",
    completed_at: "Completed at",
};

const statusLabels: Record<TripStatus, string> = {
    planned: "Planned",
    pending: "Pending",
    closed: "Closed",
    cancelled: "Cancelled",
};

const getFieldLabel = (field: string) =>
    fieldLabels[field] ??
    field
        .split("_")
        .filter(Boolean)
        .map(part => part[0]?.toUpperCase() + part.slice(1))
        .join(" ");

const isTripStatus = (value: unknown): value is TripStatus =>
    value === "planned" || value === "pending" || value === "closed" || value === "cancelled";

const formatEventValue = (field: string, value: unknown) => {
    if (value === null || value === undefined || value === "") return "-";

    if (field === "price") {
        return formatCurrency(value as number | string | null | undefined);
    }

    if (field === "distance") {
        return `${formatNullableValue(value as number | string)} km`;
    }

    if (field === "status" || field === "old_status" || field === "new_status") {
        return isTripStatus(value) ? statusLabels[value] : String(value);
    }

    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number" || typeof value === "string") return String(value);

    return "Changed";
};

const getChanges = (data: TripEventData | null): Record<string, TripEventFieldChange> => {
    if (!data) return {};

    return data.fields ?? data.changes ?? {};
};

const getStatusChangeText = (data: TripEventData | null) => {
    if (!data?.old_status && !data?.new_status) return null;

    return `${formatEventValue("old_status", data.old_status)} -> ${formatEventValue("new_status", data.new_status)}`;
};

const getEventDetails = (event: TripEvent) => {
    const { data } = event;

    if (event.event_type === "trip.updated") {
        const changes = Object.entries(getChanges(data));

        if (changes.length === 0) return ["Trip fields were updated."];

        return changes.map(([field, change]) => {
            return `${getFieldLabel(field)}: ${formatEventValue(field, change.old)} -> ${formatEventValue(field, change.new)}`;
        });
    }

    if (
        event.event_type === "trip.started" ||
        event.event_type === "trip.closed" ||
        event.event_type === "trip.cancelled"
    ) {
        const statusChangeText = getStatusChangeText(data);

        return statusChangeText ? [`Status: ${statusChangeText}`] : [];
    }

    if (event.event_type === "trip.created") {
        const details = [];

        if (data?.title) details.push(`Title: ${data.title}`);
        if (data?.distance !== undefined && data?.distance !== null) {
            details.push(`Distance: ${formatEventValue("distance", data.distance)}`);
        }
        if (data?.price !== undefined && data?.price !== null) {
            details.push(`Price: ${formatEventValue("price", data.price)}`);
        }
        if (data?.status) details.push(`Status: ${formatEventValue("status", data.status)}`);
        if (data?.driver_id !== undefined && data?.driver_id !== null) details.push(`Driver ID: ${data.driver_id}`);
        if (data?.vehicle_id !== undefined && data?.vehicle_id !== null) details.push(`Vehicle ID: ${data.vehicle_id}`);

        return details;
    }

    if (event.event_type === "trip.driver.changed") {
        return [
            `Driver ID: ${formatEventValue("old_driver_id", data?.old_driver_id)} -> ${formatEventValue("new_driver_id", data?.new_driver_id)}`,
        ];
    }

    if (event.event_type === "trip.attachment.renamed") {
        return [
            `Name: ${formatEventValue("old_display_name", data?.old_display_name)} -> ${formatEventValue("new_display_name", data?.new_display_name)}`,
        ];
    }

    if (event.event_type === "trip.attachment.added" || event.event_type === "trip.attachment.deleted") {
        const fileName = data?.display_name ?? data?.original_name;

        return fileName ? [`File: ${fileName}`] : [];
    }

    return Object.entries(data ?? {})
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${getFieldLabel(key)}: ${formatEventValue(key, value)}`);
};

export const TripTimeline = ({ tripId }: { tripId: number }) => {
    const [selectedType, setSelectedType] = useState<EventFilter>("all");
    const [search, setSearch] = useState("");
    const { data, isLoading, isFetching, error } = useTripEvents(tripId);
    const [isExpanded, setIsExpanded] = useLocalStorage("trip-history-expanded", true);
    const events = data?.data ?? [];
    const contentId = `trip-history-content-${tripId}`;
    const normalizedSearch = search.trim().toLowerCase();
    const visibleEvents = events
        .filter(event => selectedType === "all" || event.event_type === selectedType)
        .map(event => ({ event, details: getEventDetails(event) }))
        .filter(({ event, details }) => {
            if (!normalizedSearch) return true;

            return [eventTitles[event.event_type], event.user?.name ?? "System", ...details].some(text =>
                text.toLowerCase().includes(normalizedSearch)
            );
        });

    return (
        <section className="trip-page__section trip-timeline-section">
            <header className="trip-timeline__header">
                <div>
                    <h2>Trip history</h2>
                    <span>{isLoading ? "Loading..." : `${events.length} events`}</span>
                </div>
                <div className="trip-timeline__actions">
                    {isFetching && !isLoading && <span className="trip-timeline__refreshing">Updating...</span>}
                    <button
                        className="trip-attachments__toggle"
                        type="button"
                        aria-controls={contentId}
                        aria-expanded={isExpanded}
                        onClick={() => setIsExpanded(currentValue => !currentValue)}
                    >
                        <span aria-hidden="true">{isExpanded ? "▲" : "▼"}</span>
                        {isExpanded ? "Hide history" : "Show history"}
                    </button>
                </div>
            </header>

            {isExpanded && (
                <div id={contentId}>
                    {isLoading && <Spinner text="Loading trip history..." />}

                    {!isLoading && error && <p className="error-message">{error.message}</p>}

                    {!isLoading && !error && events.length === 0 && (
                        <p className="trip-details-empty">No history events yet.</p>
                    )}

                    {!isLoading && !error && events.length > 0 && (
                        <>
                            <EventFilters
                                eventTitles={eventTitles}
                                selectedType={selectedType}
                                onTypeChange={setSelectedType}
                                search={search}
                                onSearchChange={setSearch}
                            />

                            {visibleEvents.length === 0 ? (
                                <p className="trip-details-empty">No events match the filters.</p>
                            ) : (
                                <ol className="trip-timeline">
                                    {visibleEvents.map(({ event, details }) => (
                                        <li
                                            className="trip-timeline__item"
                                            key={event.id}
                                        >
                                            <div className="trip-timeline__marker" />
                                            <article className="trip-timeline__content">
                                                <div className="trip-timeline__main">
                                                    <h3>{eventTitles[event.event_type]}</h3>
                                                    <time dateTime={event.created_at}>
                                                        {formatDateTime(event.created_at, {
                                                            hour12: false,
                                                            locale: "en-GB",
                                                            timeZone: "Europe/Kiev",
                                                        })}
                                                    </time>
                                                </div>
                                                <p className="trip-timeline__actor">{event.user?.name ?? "System"}</p>
                                                {details.length > 0 && (
                                                    <ul className="trip-timeline__details">
                                                        {details.map(detail => (
                                                            <li key={detail}>{detail}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </article>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </>
                    )}
                </div>
            )}
        </section>
    );
};
