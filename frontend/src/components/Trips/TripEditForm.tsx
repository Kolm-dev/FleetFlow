import { TripPriceCalculator } from "@/components/Trips/TripPriceCalculator";
import { toNullableNumber } from "@/libs/utils";
import type { Driver } from "@/types/driversTypes";
import type { Trip, UpdateTripData } from "@/types/tripsTypes";
import type React from "react";
import { useState } from "react";

type TripFormEditProps = {
    trip: Trip;
    availableDrivers: Driver[];
    isPending: boolean;
    errorMessages: string[];
    onSubmit: (data: UpdateTripData) => void;
};

const getDriversForSelect = (drivers: Driver[], currentDriverId: number) =>
    drivers.filter(
        (driver) =>
            driver.status === "available" || driver.id === currentDriverId,
    );

const getVehiclesByDriverId = (drivers: Driver[], driverId?: number) =>
    drivers.find((driver) => driver.id === driverId)?.vehicles ?? [];

export const TripEditForm = ({
    trip,
    onSubmit,
    availableDrivers,
    isPending,
    errorMessages,
}: TripFormEditProps) => {
    const [title, setTitle] = useState(trip.title);
    const [distance, setDistance] = useState(trip.distance?.toString() ?? "");
    const [price, setPrice] = useState(trip.price?.toString() ?? "");
    const [driverId, setDriverId] = useState<number | undefined>(
        trip.driver_id,
    );
    const [vehicleId, setVehicleId] = useState<number | undefined>(
        trip.vehicle_id,
    );
    const canEditAssignment = trip.status === "planned";

    const filteredDriversForSelect = getDriversForSelect(
        availableDrivers,
        trip.driver_id,
    );
    const driversForSelect =
        trip.driver && !filteredDriversForSelect.some(driver => driver.id === trip.driver?.id)
            ? [...filteredDriversForSelect, trip.driver]
            : filteredDriversForSelect;
    const driverVehicles = getVehiclesByDriverId(availableDrivers, driverId);
    const vehiclesForSelect =
        trip.vehicle && driverId === trip.driver_id && !driverVehicles.some(vehicle => vehicle.id === trip.vehicle?.id)
            ? [...driverVehicles, trip.vehicle]
            : driverVehicles;

    const handleDriverId = (value: string) => {
        const nextDriverId = Number(value);
        setDriverId(nextDriverId);
        setVehicleId(undefined);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (canEditAssignment && (driverId === undefined || vehicleId === undefined)) return;

        const data: UpdateTripData = {
            distance: toNullableNumber(distance),
            price: toNullableNumber(price),
            title,
        };

        if (canEditAssignment) {
            data.driver_id = driverId;
            data.vehicle_id = vehicleId;
        }

        onSubmit(data);
    };
    return (
        <form
            className="trip-edit-form"
            onSubmit={handleSubmit}
        >
            <div className="trip-edit-form__fields">
                <label>
                    Title
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.currentTarget.value)}
                    />
                </label>
                <label>
                    Distance
                    <input
                        type="text"
                        value={distance}
                        onChange={e => setDistance(e.currentTarget.value)}
                    />
                </label>

                <label>
                    Driver
                    <select
                        value={driverId ?? ""}
                        onChange={event => handleDriverId(event.currentTarget.value)}
                        disabled={!canEditAssignment}
                    >
                        {driversForSelect.map(driver => (
                            <option
                                key={driver.id}
                                value={driver.id}
                            >
                                {driver.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Vehicle
                    <select
                        value={vehicleId ?? ""}
                        onChange={event => {
                            const value = event.currentTarget.value;
                            setVehicleId(value === "" ? undefined : Number(value));
                        }}
                        disabled={!canEditAssignment || vehiclesForSelect.length === 0}
                    >
                        {canEditAssignment && <option value="">Select vehicle</option>}
                        {vehiclesForSelect.map(vehicle => (
                            <option
                                key={vehicle.id}
                                value={vehicle.id}
                            >
                                {vehicle.brand} {vehicle.model} -{vehicle.license_plate}
                            </option>
                        ))}
                    </select>
                </label>
                {vehiclesForSelect.length === 0 && <p>No vehicles for this driver</p>}
                <label>
                    Status
                    <select
                        value={trip.status}
                        disabled
                    >
                        <option value="planned">Planned</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </label>
                {errorMessages.length > 0 && (
                    <ul className="error-message">
                        {errorMessages.map(message => (
                            <li key={message}>{message}</li>
                        ))}
                    </ul>
                )}
                <button
                    className="entity-action entity-action--update"
                    type="submit"
                    disabled={isPending || (canEditAssignment && (driverId === undefined || vehicleId === undefined))}
                >
                    {isPending ? "Saving..." : "Save"}
                </button>
            </div>
            <TripPriceCalculator
                distance={distance}
                price={price}
                onPriceChange={setPrice}
            />
        </form>
    );
};
