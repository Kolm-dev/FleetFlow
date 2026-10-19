import { EntityForm, formControlClass, formFieldClass, formGridClass } from "@/components/shared/EntityForm";
import { isHttpUrl } from "@/libs/utils";
import type { CreateDriverData, Driver, DriverStatus, UpdateDriverData } from "@/types/driversTypes";
import type { Vehicle } from "@/types/vehiclesTypes";
import { useState, type FormEvent } from "react";

type DriverFormProps = {
    isPending: boolean;
    onCancel: () => void;
} & (
    | { mode: "create"; onSubmit: (data: CreateDriverData) => void }
    | { mode: "edit"; driver: Driver; vehicles: Vehicle[]; onSubmit: (data: { driver: UpdateDriverData; vehicleId?: number }) => void }
);

const DRIVER_PHOTO_PLACEHOLDER = "/icons/non-photo.svg";

export const DriverForm = (props: DriverFormProps) => {
    const driver = props.mode === "edit" ? props.driver : undefined;
    const [name, setName] = useState(driver?.name ?? "");
    const [phone, setPhone] = useState(driver?.phone_number ?? "");
    const [photo, setPhoto] = useState(driver?.photo ?? "");
    const [status, setStatus] = useState<DriverStatus>(driver?.status ?? "available");
    const [vehicleId, setVehicleId] = useState<number | undefined>(driver?.vehicles[0]?.id);
    const [isPreviewError, setIsPreviewError] = useState(false);
    const canPreviewPhoto = isHttpUrl(photo) && !isPreviewError;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const driverData = {
            name: name.trim(),
            phone_number: phone.trim(),
            photo: photo.trim() || null,
        };

        if (props.mode === "edit") {
            props.onSubmit({ driver: driverData, vehicleId });
        } else {
            props.onSubmit({ ...driverData, status });
        }
    };

    return (
        <EntityForm
            title={driver ? "Edit driver" : "Create driver"}
            description={driver?.name}
            submitLabel={driver ? "Save driver" : "Create driver"}
            pendingLabel={driver ? "Saving..." : "Creating..."}
            isPending={props.isPending}
            onCancel={props.onCancel}
            onSubmit={handleSubmit}
        >
            <div className={formGridClass}>
                <label className={formFieldClass}>
                    Name
                    <input className={formControlClass} required autoComplete="name" name="name" value={name} onChange={event => setName(event.currentTarget.value)} />
                </label>
                <label className={formFieldClass}>
                    Phone number
                    <input className={formControlClass} required autoComplete="tel" name="phone_number" type="tel" value={phone} onChange={event => setPhone(event.currentTarget.value)} />
                </label>
                <label className={formFieldClass}>
                    Status
                    {driver ? (
                        <input className={formControlClass} value={status === "on_trip" ? "On trip" : status} disabled readOnly />
                    ) : (
                        <select className={formControlClass} value={status} onChange={event => setStatus(event.currentTarget.value as DriverStatus)}>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    )}
                </label>
                {props.mode === "edit" && (
                    <label className={formFieldClass}>
                        Assigned vehicle
                        <select
                            className={formControlClass}
                            value={vehicleId ?? ""}
                            onChange={event => setVehicleId(event.currentTarget.value ? Number(event.currentTarget.value) : undefined)}
                        >
                            <option value="">No vehicle change</option>
                            {props.vehicles.map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <label className={`${formFieldClass} sm:col-span-2`}>
                    Photo URL
                    <input
                        className={formControlClass}
                        name="photo"
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={photo}
                        onChange={event => {
                            setPhoto(event.currentTarget.value);
                            setIsPreviewError(false);
                        }}
                    />
                </label>
            </div>
            <figure className="m-0 flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3">
                <img
                    className="size-20 rounded-md border border-border bg-background object-cover"
                    src={canPreviewPhoto ? photo : DRIVER_PHOTO_PLACEHOLDER}
                    alt={canPreviewPhoto ? `Preview of ${name}` : ""}
                    onError={() => setIsPreviewError(true)}
                />
                <figcaption className="text-sm text-muted-foreground">
                    {canPreviewPhoto ? "Photo preview" : "Enter a photo URL to preview it"}
                </figcaption>
            </figure>
        </EntityForm>
    );
};
