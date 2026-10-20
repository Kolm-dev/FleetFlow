import { CreateEntityButton } from "@/components/shared/CreateEntityButton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { NoAvailableDrivers } from "@/components/shared/NoAvailableDrivers";
import { EntityForm, formControlClass, formFieldClass, formGridClass } from "@/components/shared/EntityForm";
import { ClientCombobox } from "@/components/Trips/ClientCombobox";
import { TripPriceCalculator } from "@/components/Trips/TripPriceCalculator";
import { toNullableNumber } from "@/libs/utils";
import type { Client } from "@/types/clientTypes";
import type { Driver } from "@/types/driversTypes";
import type { CreateTripData, Trip, UpdateTripData } from "@/types/tripsTypes";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";

type TripFormProps = {
    availableDrivers: Driver[];
    clients: Client[];
    isPending: boolean;
    errorMessages: string[];
    onCancel: () => void;
} & (
    | { mode: "create"; onSubmit: (data: CreateTripData) => void }
    | { mode: "edit"; trip: Trip; onSubmit: (data: UpdateTripData) => void }
);

export const TripForm = (props: TripFormProps) => {
    const trip = props.mode === "edit" ? props.trip : undefined;
    const [title, setTitle] = useState(trip?.title ?? "");
    const [distance, setDistance] = useState(trip?.distance?.toString() ?? "");
    const [price, setPrice] = useState(trip?.price?.toString() ?? "");
    const defaultDriver = props.availableDrivers.find(driver => driver.vehicles?.length) ?? props.availableDrivers[0];
    const [driverId, setDriverId] = useState<number | undefined>(trip?.driver_id ?? defaultDriver?.id);
    const [vehicleId, setVehicleId] = useState<number | undefined>(trip?.vehicle_id);
    const [clientId, setClientId] = useState<number | undefined>(trip?.client_id ?? props.clients[0]?.id);
    const canEditAssignment = !trip || trip.status === "planned";

    const clientsForSelect = trip?.client && !props.clients.some(client => client.id === trip.client?.id)
        ? [...props.clients, trip.client]
        : props.clients;
    const availableDrivers = trip
        ? props.availableDrivers.filter(driver => driver.status === "available" || driver.id === trip.driver_id)
        : props.availableDrivers;
    const driversForSelect = trip?.driver && !availableDrivers.some(driver => driver.id === trip.driver?.id)
        ? [...availableDrivers, trip.driver]
        : availableDrivers;
    const driverVehicles = props.availableDrivers.find(driver => driver.id === driverId)?.vehicles ?? [];
    const vehiclesForSelect = trip?.vehicle && driverId === trip.driver_id && !driverVehicles.some(vehicle => vehicle.id === trip.vehicle?.id)
        ? [...driverVehicles, trip.vehicle]
        : driverVehicles;

    const isInvalid = title.trim() === "" || !Number.isInteger(Number(distance)) || Number(distance) <= 0 ||
        (canEditAssignment && (driverId === undefined || vehicleId === undefined || clientId === undefined));

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isInvalid) return;

        const values = {
            title: title.trim(),
            distance: Number(distance),
            price: toNullableNumber(price),
        };

        if (props.mode === "edit") {
            const data: UpdateTripData = { ...values };
            if (canEditAssignment) {
                data.driver_id = driverId;
                data.vehicle_id = vehicleId;
                data.client_id = clientId;
            }
            props.onSubmit(data);
        } else if (driverId !== undefined && vehicleId !== undefined && clientId !== undefined) {
            props.onSubmit({ ...values, driver_id: driverId, vehicle_id: vehicleId, client_id: clientId });
        }
    };

    if (!trip && props.availableDrivers.length === 0) {
        return <NoAvailableDrivers context="trip" />;
    }
    if (!trip && props.clients.length === 0) {
        return (
            <div className="grid justify-items-start gap-3">
                <p className="m-0">No clients. Add a client before creating a trip.</p>
                <CreateEntityButton entity="client" to="/clients/create" />
            </div>
        );
    }

    return (
        <EntityForm
            title={trip ? "Edit trip" : "Create trip"}
            description={trip?.title}
            submitLabel={trip ? "Save trip" : "Create trip"}
            pendingLabel={trip ? "Saving..." : "Creating..."}
            isPending={props.isPending}
            onCancel={props.onCancel}
            onSubmit={handleSubmit}
            submitDisabled={isInvalid}
        >
            <div className={formGridClass}>
                <label className={`${formFieldClass} sm:col-span-2`}>
                    Title
                    <input className={formControlClass} required name="title" value={title} onChange={event => setTitle(event.currentTarget.value)} />
                </label>
                <label className={formFieldClass}>
                    Distance (km)
                    <input className={formControlClass} required type="number" min="1" step="1" name="distance" value={distance} onChange={event => setDistance(event.currentTarget.value)} />
                </label>
                {trip && (
                    <label className={formFieldClass}>
                        Status
                        <input className={formControlClass} value={trip.status} disabled readOnly />
                    </label>
                )}
                <div className="min-w-0 sm:col-span-2">
                    <ClientCombobox clients={clientsForSelect} disabled={!canEditAssignment} value={clientId} onChange={setClientId} />
                </div>
                <label className={formFieldClass}>
                    Driver
                    <select
                        className={formControlClass}
                        value={driverId ?? ""}
                        disabled={!canEditAssignment}
                        onChange={event => {
                            setDriverId(Number(event.currentTarget.value));
                            setVehicleId(undefined);
                        }}
                    >
                        {driversForSelect.map(driver => (
                            <option key={driver.id} value={driver.id}>{driver.name}</option>
                        ))}
                    </select>
                </label>
                <label className={formFieldClass}>
                    Vehicle
                    <select
                        className={formControlClass}
                        value={vehicleId ?? ""}
                        disabled={!canEditAssignment || vehiclesForSelect.length === 0}
                        onChange={event => setVehicleId(event.currentTarget.value ? Number(event.currentTarget.value) : undefined)}
                    >
                        {canEditAssignment && <option value="">Select vehicle</option>}
                        {vehiclesForSelect.map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} - {vehicle.license_plate}</option>
                        ))}
                    </select>
                    {vehiclesForSelect.length === 0 && (
                        <span className="text-xs text-destructive">
                            This driver has no vehicles. <Link to="/vehicles/create">Add a vehicle</Link>
                        </span>
                    )}
                </label>
            </div>
            <TripPriceCalculator distance={distance} price={price} onPriceChange={setPrice} />
            <ErrorMessage messages={props.errorMessages} />
        </EntityForm>
    );
};
