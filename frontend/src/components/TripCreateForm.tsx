import type { Driver } from "@/types/driversTypes";
import type { CreateTripData, TripStatus } from "@/types/tripsTypes";
import { useState, type FormEvent } from "react";
type TripCreatePropsType = {
    isCreating: boolean;
    availableDrivers: Driver[];
    onSubmit: (data: CreateTripData) => void;
};

const TripCreateForm = ({
    isCreating,
    availableDrivers,
    onSubmit,
}: TripCreatePropsType) => {
    const [title, setTitle] = useState("");
    const [distance, setDistance] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState<TripStatus>("planned");
    const [driverId, setDriverId] = useState<number>(availableDrivers[0]?.id);
    const [vehicleId, setVehicleId] = useState<number>();

    const handleDriverChange = (value: string) => {
        const valueToNumber = Number(value);
        setDriverId(valueToNumber);
        const selectedDriver = availableDrivers.find(
            (driver) => driver.id === valueToNumber,
        );
        const firstVehicleDriver = selectedDriver?.vehicles[0];
        setVehicleId(firstVehicleDriver?.id);
    };
    const getVehiclesByDriverId = (drivers: Driver[], driverId?: number) =>
        drivers.find((driver) => driver.id === driverId)?.vehicles ?? [];

    const selectedDriverId = driverId ?? availableDrivers[0]?.id;
    const vehiclesForDriverId = getVehiclesByDriverId(
        availableDrivers,
        selectedDriverId,
    );
    const selectedVehicleId = vehicleId ?? vehiclesForDriverId[0]?.id;

    const isSubmitDisabled =
        title.trim() === "" ||
        selectedDriverId === undefined ||
        selectedVehicleId === undefined;

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
            status,
        });
    };

    if (availableDrivers.length <= 0) return <p>No availables drivers</p>;

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Title:
                <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                />
            </label>
            <label>
                Distance:
                <input
                    type="text"
                    name="distance"
                    value={distance}
                    onChange={(e) => setDistance(e.currentTarget.value)}
                />
            </label>
            <label>
                Price:
                <input
                    type="text"
                    name="price"
                    value={price}
                    onChange={(e) => setPrice(e.currentTarget.value)}
                />
            </label>
            <label>
                Choose driver:
                <select
                    onChange={(e) => handleDriverChange(e.currentTarget.value)}
                    value={selectedDriverId}
                    name="driver"
                >
                    {availableDrivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                            {driver.name} - {driver.status}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Choose vehicle:
                <select
                    onChange={(e) =>
                        setVehicleId(Number(e.currentTarget.value))
                    }
                    name="vehicle"
                    value={selectedVehicleId}
                    disabled={vehiclesForDriverId.length === 0}
                >
                    {vehiclesForDriverId.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.brand} {vehicle.model} -
                            {vehicle.license_plate}
                        </option>
                    ))}
                </select>
                {vehiclesForDriverId.length === 0 && (
                    <p className="trip-form__empty-message">
                        This driver does not have cars yet
                    </p>
                )}
            </label>
            <label>
                Status
                <select
                    disabled={!!(vehiclesForDriverId.length === 0)}
                    value={status}
                    onChange={(e) =>
                        setStatus(e.currentTarget.value as TripStatus)
                    }
                    name="vehicle"
                >
                    <option value="planned">Planned</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                </select>
            </label>

            <button disabled={isSubmitDisabled} type="submit">
                {isCreating ? "Creating..." : "Create"}
            </button>
        </form>
    );
};

export default TripCreateForm;
