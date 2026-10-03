import { TripPriceCalculator } from "@/components/Trips/TripPriceCalculator";
import type { Driver } from "@/types/driversTypes";
import type { CreateTripData } from "@/types/tripsTypes";
import { useState, type FormEvent } from "react";
type TripCreatePropsType = {
    isCreating: boolean;
    availableDrivers: Driver[];
    errorMessages: string[];
    onSubmit: (data: CreateTripData) => void;
};

const TripCreateForm = ({ isCreating, availableDrivers, errorMessages, onSubmit }: TripCreatePropsType) => {
    const [title, setTitle] = useState("");
    const [distance, setDistance] = useState("");
    const [price, setPrice] = useState("");
    const [driverId, setDriverId] = useState<number>(availableDrivers[0]?.id);
    const [vehicleId, setVehicleId] = useState<number>();

    const handleDriverChange = (value: string) => {
        const valueToNumber = Number(value);
        setDriverId(valueToNumber);
        setVehicleId(undefined);
    };
    const getVehiclesByDriverId = (drivers: Driver[], driverId?: number) =>
        drivers.find(driver => driver.id === driverId)?.vehicles ?? [];

    const selectedDriverId = driverId ?? availableDrivers[0]?.id;
    const vehiclesForDriverId = getVehiclesByDriverId(availableDrivers, selectedDriverId);
    const selectedVehicleId = vehicleId;

    const isSubmitDisabled = title.trim() === "" || selectedDriverId === undefined || selectedVehicleId === undefined;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (selectedDriverId === undefined || selectedVehicleId === undefined) {
            return;
        }
        onSubmit({
            title,
            distance: Number(distance),
            price: Number(price),
            driver_id: selectedDriverId,
            vehicle_id: selectedVehicleId,
        });
    };

    if (availableDrivers.length <= 0) return <p>No availables drivers</p>;

    return (
        <form
            className="trip-edit-form"
            onSubmit={handleSubmit}
        >
            <div className="trip-edit-form__fields">
                <label>
                    Title:
                    <input
                        type="text"
                        name="title"
                        value={title}
                        onChange={e => setTitle(e.currentTarget.value)}
                    />
                </label>
                <label>
                    Distance:
                    <input
                        type="text"
                        name="distance"
                        value={distance}
                        onChange={e => setDistance(e.currentTarget.value)}
                    />
                </label>
                <label>
                    Choose driver:
                    <select
                        onChange={e => handleDriverChange(e.currentTarget.value)}
                        value={selectedDriverId}
                        name="driver"
                    >
                        {availableDrivers.map(driver => (
                            <option
                                key={driver.id}
                                value={driver.id}
                            >
                                {driver.name} - {driver.status}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Choose vehicle:
                    <select
                        onChange={e => {
                            const value = e.currentTarget.value;
                            setVehicleId(value === "" ? undefined : Number(value));
                        }}
                        name="vehicle"
                        value={selectedVehicleId ?? ""}
                        disabled={vehiclesForDriverId.length === 0}
                    >
                        <option value="">Select vehicle</option>
                        {vehiclesForDriverId.map(vehicle => (
                            <option
                                key={vehicle.id}
                                value={vehicle.id}
                            >
                                {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
                            </option>
                        ))}
                    </select>
                    {vehiclesForDriverId.length === 0 && (
                        <p className="trip-form__empty-message">This driver does not have cars yet</p>
                    )}
                </label>

                {errorMessages.length > 0 && (
                    <ul className="error-message">
                        {errorMessages.map(message => (
                            <li key={message}>{message}</li>
                        ))}
                    </ul>
                )}

                <button
                    className="entity-action entity-action--create"
                    disabled={isCreating || isSubmitDisabled}
                    type="submit"
                >
                    {isCreating ? "Creating..." : "Create"}
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

export default TripCreateForm;
