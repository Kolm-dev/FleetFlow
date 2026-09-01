import type { UpdateVehicleData, Vehicle } from "@/types/vehiclesTypes";
import { useState } from "react";

type PropsEditForm = {
    onSubmit: (data: UpdateVehicleData) => void;
    vehicle: Vehicle;
    isPending?: boolean;
};

export const VehicleEditForm = (props: PropsEditForm) => {
    const { vehicle, isPending = false, onSubmit } = props;
    const [brand, setBrand] = useState(vehicle.brand);
    const [model, setModel] = useState(vehicle.model);
    const [licensePlate, setLicensePlate] = useState(vehicle.license_plate);
    const [year, setYear] = useState(vehicle.year?.toString() ?? "");

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const correctYear = year === "" ? null : Number(year);

        if (correctYear !== null && Number.isNaN(correctYear)) return;
        if (correctYear !== null && correctYear < 1900) return;
        if (correctYear !== null && correctYear > new Date().getFullYear()) {
            return;
        }

        onSubmit({
            brand,
            model,
            license_plate: licensePlate,
            year: correctYear,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <h1>
                    Edit {vehicle.brand} {vehicle.model}
                </h1>
                <p>License plate: {vehicle.license_plate}</p>
            </div>

            <div>
                <label>
                    Brand
                    <input
                        name="brand"
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.currentTarget.value)}
                    />
                </label>
            </div>

            <div>
                <label>
                    Model
                    <input
                        name="model"
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.currentTarget.value)}
                    />
                </label>
            </div>

            <div>
                <label>
                    License plate
                    <input
                        name="licensePlate"
                        type="text"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.currentTarget.value)}
                    />
                </label>
            </div>

            <div>
                <label>
                    Year
                    <input
                        name="year"
                        type="number"
                        min={1900}
                        max={new Date().getFullYear()}
                        value={year}
                        onChange={(e) => setYear(e.currentTarget.value)}
                    />
                </label>
            </div>

            <div>
                <button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save vehicle"}
                </button>
            </div>
        </form>
    );
};
