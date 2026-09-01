import type { Driver } from "@/types/driversTypes";
import type { CreateVehicleData } from "@/types/vehiclesTypes";
import { useState } from "react";

type PropsCreateFormType = {
    availableDrivers: Driver[];
    onSubmit: (data: CreateVehicleData) => void;
    isPending: boolean;
};

export const VehicleCreateForm = ({
    availableDrivers,
    isPending,
    onSubmit,
}: PropsCreateFormType) => {
    const [driverId, setDriverId] = useState(availableDrivers[0].id);
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [year, setYear] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const correctYear = year === "" ? null : Number(year);
        if (correctYear !== null && Number.isNaN(correctYear)) return;
        if (correctYear !== null && correctYear < 1900) return;
        if (correctYear !== null && correctYear > new Date().getFullYear())
            return;
        onSubmit({
            brand,
            model,
            license_plate: licensePlate,
            year: correctYear,
            driver_id: Number(driverId),
        });
    };
    return (
        <form action="#" onSubmit={handleSubmit} method="post">
            <label htmlFor="brand">
                Brand
                <input
                    name="brand"
                    onChange={(e) => setBrand(e.currentTarget.value)}
                    value={brand}
                />
            </label>

            <label htmlFor="model">
                Model
                <input
                    name="model"
                    value={model}
                    onChange={(e) => setModel(e.currentTarget.value)}
                />
            </label>

            <label htmlFor="year">
                Year
                <input
                    name="year"
                    type="number"
                    value={year}
                    min={1900}
                    max={new Date().getFullYear()}
                    onChange={(e) => setYear(e.currentTarget.value)}
                />
            </label>
            <label htmlFor="licensePlate">
                License plate
                <input
                    type="text"
                    onChange={(e) => setLicensePlate(e.currentTarget.value)}
                    name="licensePlate"
                    value={licensePlate}
                />
            </label>
            <label>
                Availables drivers
                <select
                    onChange={(e) => setDriverId(Number(e.currentTarget.value))}
                    name="drivers"
                    value={driverId}
                >
                    {availableDrivers.map((driver) => {
                        return (
                            <option key={driver.id} value={driver.id}>
                                {driver.name}
                            </option>
                        );
                    })}
                </select>
            </label>

            <button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create!"}
            </button>
        </form>
    );
};
