import type {
    CreateVehicleServiceData,
    VehicleService,
    VehicleServiceType,
} from "@/types/vehicleServicesTypes";
import { VEHICLE_SERVICE_TYPES } from "@/types/vehicleServicesTypes";
import { toDateInputValue } from "@/libs/utils";
import { Button } from "@/components/ui/button";
import { useState, type FormEvent } from "react";

const controlClassName =
    "mt-1.5 h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

type VehicleServiceFormProps = {
    service?: VehicleService;
    isPending: boolean;
    submitText: string;
    onSubmit: (data: CreateVehicleServiceData) => void;
    onCancel: () => void;
};

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
        <form className="grid min-w-0 gap-4" onSubmit={handleSubmit}>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <label className="grid min-w-0 content-start text-sm font-medium">
                    <span>Service date</span>
                    <input
                        className={controlClassName}
                        required
                        name="service_date"
                        type="date"
                        value={serviceDate}
                        onChange={(event) => setServiceDate(event.currentTarget.value)}
                    />
                </label>

                <label className="grid min-w-0 content-start text-sm font-medium">
                    <span>Mileage</span>
                    <input
                        className={controlClassName}
                        required
                        min="0"
                        name="mileage"
                        type="number"
                        value={mileage}
                        onChange={(event) => setMileage(event.currentTarget.value)}
                    />
                </label>

                <label className="grid min-w-0 content-start text-sm font-medium">
                    <span>Type</span>
                    <select
                        className={controlClassName}
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

                <label className="grid min-w-0 content-start text-sm font-medium">
                    <span>Cost (USD)</span>
                    <input
                        className={controlClassName}
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

            <label className="grid min-w-0 text-sm font-medium">
                <span>Notes</span>
                <textarea
                    className="mt-1.5 w-full min-w-0 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                    name="notes"
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.currentTarget.value)}
                />
            </label>

            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                    className="w-full sm:w-auto"
                    variant="outline"
                    disabled={isPending}
                    type="submit"
                >
                    {isPending ? "Saving..." : submitText}
                </Button>
                <Button
                    className="ml-0 w-full sm:w-auto"
                    variant="ghost"
                    disabled={isPending}
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};
