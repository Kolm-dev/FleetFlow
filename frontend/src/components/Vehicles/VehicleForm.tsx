import { EntityForm, formControlClass, formFieldClass, formGridClass } from "@/components/shared/EntityForm";
import type { Driver } from "@/types/driversTypes";
import type { CreateVehicleData, FuelType, UpdateVehicleData, Vehicle } from "@/types/vehiclesTypes";
import { useState, type FormEvent } from "react";

type VehicleFormProps = {
    isPending: boolean;
    onCancel: () => void;
} & (
    | { mode: "create"; availableDrivers: Driver[]; onSubmit: (data: CreateVehicleData) => void }
    | { mode: "edit"; vehicle: Vehicle; onSubmit: (data: UpdateVehicleData) => void }
);

export const VehicleForm = (props: VehicleFormProps) => {
    const vehicle = props.mode === "edit" ? props.vehicle : undefined;
    const [brand, setBrand] = useState(vehicle?.brand ?? "");
    const [model, setModel] = useState(vehicle?.model ?? "");
    const [licensePlate, setLicensePlate] = useState(vehicle?.license_plate ?? "");
    const [year, setYear] = useState(vehicle?.year?.toString() ?? "");
    const [fuelType, setFuelType] = useState<FuelType>(vehicle?.fuel_type ?? "diesel");
    const [fuelConsumption, setFuelConsumption] = useState(vehicle?.fuel_consumption.toString() ?? "10");
    const [driverId, setDriverId] = useState<number | undefined>(
        props.mode === "create" ? props.availableDrivers[0]?.id : vehicle?.driver_id ?? undefined,
    );

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsedYear = year === "" ? null : Number(year);
        const parsedConsumption = Number(fuelConsumption);

        if (parsedYear !== null && (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear())) return;
        if (!Number.isFinite(parsedConsumption) || parsedConsumption <= 0) return;

        const vehicleData = {
            brand: brand.trim(),
            model: model.trim(),
            license_plate: licensePlate.trim(),
            year: parsedYear,
            fuel_consumption: parsedConsumption,
        };

        if (props.mode === "edit") {
            props.onSubmit(vehicleData);
        } else if (driverId !== undefined) {
            props.onSubmit({ ...vehicleData, driver_id: driverId, fuel_type: fuelType });
        }
    };

    return (
        <EntityForm
            title={vehicle ? "Edit vehicle" : "Create vehicle"}
            description={vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.license_plate}` : undefined}
            submitLabel={vehicle ? "Save vehicle" : "Create vehicle"}
            pendingLabel={vehicle ? "Saving..." : "Creating..."}
            isPending={props.isPending}
            onCancel={props.onCancel}
            onSubmit={handleSubmit}
            submitDisabled={props.mode === "create" && driverId === undefined}
        >
            <div className={formGridClass}>
                <label className={formFieldClass}>
                    Brand
                    <input className={formControlClass} required autoComplete="organization" name="brand" value={brand} onChange={event => setBrand(event.currentTarget.value)} />
                </label>
                <label className={formFieldClass}>
                    Model
                    <input className={formControlClass} required name="model" value={model} onChange={event => setModel(event.currentTarget.value)} />
                </label>
                <label className={formFieldClass}>
                    License plate
                    <input className={formControlClass} required maxLength={8} autoCapitalize="characters" name="license_plate" value={licensePlate} onChange={event => setLicensePlate(event.currentTarget.value)} />
                </label>
                <label className={formFieldClass}>
                    Year
                    <input className={formControlClass} name="year" type="number" min={1900} max={new Date().getFullYear()} value={year} onChange={event => setYear(event.currentTarget.value)} />
                </label>
                <label className={formFieldClass}>
                    Fuel type
                    <select className={formControlClass} value={fuelType} disabled={props.mode === "edit"} onChange={event => setFuelType(event.currentTarget.value as FuelType)}>
                        <option value="diesel">Diesel</option>
                        <option value="gasoline">Gasoline</option>
                    </select>
                </label>
                <label className={formFieldClass}>
                    Fuel consumption (L/100 km)
                    <input className={formControlClass} required name="fuel_consumption" type="number" min="0.1" step="0.1" value={fuelConsumption} onChange={event => setFuelConsumption(event.currentTarget.value)} />
                </label>
                <label className={`${formFieldClass} sm:col-span-2`}>
                    Assigned driver
                    {props.mode === "create" ? (
                        <select className={formControlClass} value={driverId ?? ""} onChange={event => setDriverId(Number(event.currentTarget.value))}>
                            {props.availableDrivers.map(driver => (
                                <option key={driver.id} value={driver.id}>{driver.name}</option>
                            ))}
                        </select>
                    ) : (
                        <input className={formControlClass} value={vehicle?.driver?.name ?? "Unassigned"} disabled readOnly />
                    )}
                </label>
            </div>
        </EntityForm>
    );
};
