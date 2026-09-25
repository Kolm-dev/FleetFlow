import type { UpdateVehicleData, Vehicle } from "@/types/vehiclesTypes";
import { useState } from "react";

type PropsEditForm = {
    onSubmit: (data: UpdateVehicleData) => void;
    onCancel: () => void;
    vehicle: Vehicle;
    isPending?: boolean;
};

export const VehicleEditForm = (props: PropsEditForm) => {
    const { vehicle, isPending = false, onSubmit, onCancel } = props;
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
        <form className="vehicle-edit-form" onSubmit={handleSubmit}>
            <header className="vehicle-edit-form__header">
                <p>Edit vehicle</p>
                <h1>
                    {vehicle.brand} {vehicle.model}
                </h1>
                <span>{vehicle.license_plate}</span>
            </header>

            <section className="vehicle-edit-form__fields">
                <label>
                    Brand
                    <input
                        required
                        autoComplete="organization"
                        name="brand"
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.currentTarget.value)}
                    />
                </label>

                <label>
                    Model
                    <input
                        required
                        name="model"
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.currentTarget.value)}
                    />
                </label>

                <label>
                    License plate
                    <input
                        required
                        autoCapitalize="characters"
                        name="licensePlate"
                        type="text"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.currentTarget.value)}
                    />
                </label>

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
            </section>

            <footer className="vehicle-edit-form__actions">
                <button
                    className="entity-action entity-action--update"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? "Saving..." : "Save vehicle"}
                </button>
                <button
                    className="vehicle-edit-form__cancel"
                    type="button"
                    disabled={isPending}
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </footer>
        </form>
    );
};
