import type {
    CreateVehicleServiceData,
    VehicleService,
    VehicleServiceType,
} from "@/types/vehicleServicesTypes";
import { VEHICLE_SERVICE_TYPES } from "@/types/vehicleServicesTypes";
import { useState, type FormEvent } from "react";

type VehicleServiceFormProps = {
    service?: VehicleService;
    isPending: boolean;
    submitText: string;
    onSubmit: (data: CreateVehicleServiceData) => void;
    onCancel: () => void;
};

const toDateInputValue = (value?: string) => value?.slice(0, 10) ?? "";

export const VehicleServiceForm = ({
    service,
    isPending,
    submitText,
    onSubmit,
    onCancel,
}: VehicleServiceFormProps) => {
    const [serviceDate, setServiceDate] = useState(
        toDateInputValue(service?.service_date),
    );
    const [mileage, setMileage] = useState(service?.mileage.toString() ?? "");
    const [type, setType] = useState<VehicleServiceType>(
        service?.type ?? "scheduled_maintenance",
    );
    const [cost, setCost] = useState(service?.cost.toString() ?? "");
    const [notes, setNotes] = useState(service?.notes ?? "");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        onSubmit({
            service_date: serviceDate,
            mileage: Number(mileage),
            type,
            cost: Number(cost),
            notes: notes.trim() || null,
        });
    };

    return (
        <form className="vehicle-service-form" onSubmit={handleSubmit}>
            <div className="vehicle-service-form__fields">
                <label>
                    Service date
                    <input
                        required
                        name="service_date"
                        type="date"
                        value={serviceDate}
                        onChange={(event) => setServiceDate(event.currentTarget.value)}
                    />
                </label>

                <label>
                    Mileage
                    <input
                        required
                        min="0"
                        name="mileage"
                        type="number"
                        value={mileage}
                        onChange={(event) => setMileage(event.currentTarget.value)}
                    />
                </label>

                <label>
                    Type
                    <select
                        name="type"
                        value={type}
                        onChange={(event) =>
                            setType(event.currentTarget.value as VehicleServiceType)
                        }
                    >
                        {VEHICLE_SERVICE_TYPES.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Cost (USD)
                    <input
                        required
                        min="0"
                        name="cost"
                        step="0.01"
                        type="number"
                        value={cost}
                        onChange={(event) => setCost(event.currentTarget.value)}
                    />
                </label>
            </div>

            <label>
                Notes
                <textarea
                    name="notes"
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.currentTarget.value)}
                />
            </label>

            <div className="vehicle-service-form__actions">
                <button
                    className="entity-action entity-action--update"
                    disabled={isPending}
                    type="submit"
                >
                    {isPending ? "Saving..." : submitText}
                </button>
                <button
                    className="vehicle-service-form__cancel"
                    disabled={isPending}
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};
