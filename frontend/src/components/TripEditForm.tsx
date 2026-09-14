import { calculateTripPrice } from "@/api/pricing";
import type { Driver } from "@/types/driversTypes";
import type { Trip, TripStatus, UpdateTripData } from "@/types/tripsTypes";
import type React from "react";
import { useState } from "react";

type TripFormEditProps = {
    trip: Trip;
    availableDrivers: Driver[];
    isPending: boolean;
    onSubmit: (data: UpdateTripData) => void;
};

const toNullableNumber = (str: string) => {
    const trimmedValue = str.trim();

    if (trimmedValue === "") {
        return null;
    }

    const numberValue = Number(trimmedValue);

    return Number.isFinite(numberValue) ? numberValue : null;
};

const getDriversForSelect = (drivers: Driver[], currentDriverId: number) =>
    drivers.filter(
        (driver) =>
            driver.status === "available" || driver.id === currentDriverId,
    );

const getVehiclesByDriverId = (drivers: Driver[], driverId?: number) =>
    drivers.find((driver) => driver.id === driverId)?.vehicles ?? [];

type PriceCalculationStatus = "idle" | "loading" | "success" | "error";

export const TripEditForm = ({
    trip,
    onSubmit,
    availableDrivers,
    isPending,
}: TripFormEditProps) => {
    const [title, setTitle] = useState(trip.title);
    const [distance, setDistance] = useState(trip.distance?.toString() ?? "");
    const [price, setPrice] = useState(trip.price?.toString() ?? "");
    const [recommendedPrice, setRecommendedPrice] = useState<number | null>(
        null,
    );
    const [priceCalculationStatus, setPriceCalculationStatus] =
        useState<PriceCalculationStatus>("idle");
    const [isManualPrice, setIsManualPrice] = useState(false);
    const [status, setStatus] = useState<TripStatus>(trip.status);
    const [driverId, setDriverId] = useState<number | undefined>(
        trip.driver_id,
    );
    const [vehicleId, setVehicleId] = useState<number | undefined>(
        trip.vehicle_id,
    );

    const driversForSelect = getDriversForSelect(
        availableDrivers,
        trip.driver_id,
    );
    const vehiclesForSelect = getVehiclesByDriverId(availableDrivers, driverId);

    const handleDriverId = (value: string) => {
        const nextDriverId = Number(value);
        setDriverId(nextDriverId);

        const driver = availableDrivers.find(
            (driver) => driver.id === nextDriverId,
        );
        const firstVehicle = driver?.vehicles[0];

        setVehicleId(firstVehicle?.id);
    };

    const handlePriceChange = (value: string) => {
        setPrice(value);

        if (recommendedPrice === null) return;

        setIsManualPrice(toNullableNumber(value) !== recommendedPrice);
    };

    const handleRecalculatePrice = async () => {
        const distanceValue = toNullableNumber(distance);

        if (distanceValue === null || distanceValue <= 0) {
            setRecommendedPrice(null);
            setPriceCalculationStatus("error");
            return;
        }

        setPriceCalculationStatus("loading");
        setIsManualPrice(false);

        try {
            const response = await calculateTripPrice(distanceValue);
            const nextRecommendedPrice = response.recommended_price;

            setRecommendedPrice(nextRecommendedPrice);
            setPriceCalculationStatus("success");
            setIsManualPrice(toNullableNumber(price) !== nextRecommendedPrice);
        } catch {
            setRecommendedPrice(null);
            setPriceCalculationStatus("error");
        }
    };

    const handleUseRecommendedPrice = () => {
        if (recommendedPrice === null) return;

        setPrice(recommendedPrice.toString());
        setIsManualPrice(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (driverId === undefined || vehicleId === undefined) return;

        onSubmit({
            distance: toNullableNumber(distance),
            price: toNullableNumber(price),
            title,
            status,
            driver_id: driverId,
            vehicle_id: vehicleId,
        });
    };
    return (
        <form className="trip-edit-form" onSubmit={handleSubmit}>
            <div className="trip-edit-form__fields">
                <label>
                    Title
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                    />
                </label>
                <label>
                    Distance
                    <input
                        type="text"
                        value={distance}
                        onChange={(e) => setDistance(e.currentTarget.value)}
                    />
                </label>
                <label>
                    Status
                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(event.currentTarget.value as TripStatus)
                        }
                    >
                        <option value="planned">Planned</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                    </select>
                </label>
                <label>
                    Driver
                    <select
                        value={driverId ?? ""}
                        onChange={(event) =>
                            handleDriverId(event.currentTarget.value)
                        }
                    >
                        {driversForSelect.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                                {driver.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Vehicle
                    <select
                        value={vehicleId ?? ""}
                        onChange={(event) =>
                            setVehicleId(Number(event.currentTarget.value))
                        }
                        disabled={vehiclesForSelect.length === 0}
                    >
                        {vehiclesForSelect.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.brand} {vehicle.model} -
                                {vehicle.license_plate}
                            </option>
                        ))}
                    </select>
                </label>
                {vehiclesForSelect.length === 0 && (
                    <p>No vehicles for this driver</p>
                )}
                <button
                    type="submit"
                    disabled={
                        isPending ||
                        driverId === undefined ||
                        vehicleId === undefined
                    }
                >
                    {isPending ? "Saving..." : "Save"}
                </button>
            </div>
            <aside className="trip-price-tools">
                <h2>Price recommendation</h2>
                <p className="trip-price-tools__distance">
                    Distance: <strong>{distance || "not specified"} km</strong>
                </p>
                <label>
                    Price
                    <input
                        type="number"
                        value={price}
                        onChange={(e) =>
                            handlePriceChange(e.currentTarget.value)
                        }
                    />
                </label>

                <button
                    type="button"
                    onClick={handleRecalculatePrice}
                    disabled={priceCalculationStatus === "loading"}
                >
                    {priceCalculationStatus === "loading"
                        ? "Recalculating..."
                        : "Recalculate"}
                </button>

                <div className="trip-price-tools__status">
                    {priceCalculationStatus === "idle" && (
                        <p>
                            Recommended price has not been calculated yet. You
                            can keep your own price.
                        </p>
                    )}

                    {priceCalculationStatus === "loading" && (
                        <p>Calculating recommended price...</p>
                    )}

                    {priceCalculationStatus === "success" &&
                        recommendedPrice !== null && (
                            <>
                                <p>
                                    Recommended price:{" "}
                                    <strong>{recommendedPrice} ₴</strong>
                                </p>
                                <p>
                                    Price to save:{" "}
                                    <strong>{price || "not specified"}</strong>
                                </p>
                                {isManualPrice && (
                                    <p className="trip-price-tools__manual">
                                        You changed the calculated price
                                        manually.
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={handleUseRecommendedPrice}
                                    disabled={
                                        toNullableNumber(price) ===
                                        recommendedPrice
                                    }
                                >
                                    Use recommended
                                </button>
                            </>
                        )}

                    {priceCalculationStatus === "error" && (
                        <p className="error-message">
                            Cannot calculate price. Enter trip distance first.
                        </p>
                    )}
                </div>
            </aside>
        </form>
    );
};
