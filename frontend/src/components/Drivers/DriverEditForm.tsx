import type {
    Driver,
    UpdateDriverData,
} from "@/types/driversTypes";
import { isHttpUrl } from "@/libs/utils";
import type { FormEvent } from "react";
import { useState } from "react";
import type { Vehicle } from "@/types/vehiclesTypes";

const DRIVER_PHOTO_PLACEHOLDER = "/icons/non-photo.svg";

const formatDriverStatus = (status: Driver["status"]) => {
    return status === "on_trip" ? "On trip" : status;
};

type DriverEditFormProps = {
    driver: Driver;
    vehicles: Vehicle[];
    isPending?: boolean;
    onSubmit: (data: { driver: UpdateDriverData; vehicleId?: number }) => void;
    onCancel: () => void;
};

export const DriverEditForm = ({
    driver,
    vehicles,
    isPending = false,
    onSubmit,
    onCancel,
}: DriverEditFormProps) => {
    const [name, setName] = useState(driver.name);
    const [phoneNumber, setPhoneNumber] = useState(driver.phone_number);
    const [photo, setPhoto] = useState(driver.photo ?? "");
    const [vehicleId, setVehicleId] = useState<number | undefined>(driver.vehicles[0]?.id);
    const [isPreviewError, setIsPreviewError] = useState(false);
    const canPreviewPhoto = isHttpUrl(photo) && !isPreviewError;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        onSubmit({
            driver: {
                name,
                phone_number: phoneNumber,
                photo: photo.trim() || null,
            },
            vehicleId,
        });
    };

    return (
        <form className="driver-edit-form" onSubmit={handleSubmit}>
            <header className="driver-edit-form__header">
                <p>Edit driver</p>
                <h1>{driver.name}</h1>
                <span>{driver.phone_number}</span>
            </header>

            <section className="driver-edit-form__body">
                <div className="driver-edit-form__fields">
                    <label>
                        Name
                        <input
                            required
                            autoComplete="name"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.currentTarget.value)}
                        />
                    </label>

                    <label>
                        Phone
                        <input
                            required
                            autoComplete="tel"
                            name="phone_number"
                            type="tel"
                            value={phoneNumber}
                            onChange={(event) =>
                                setPhoneNumber(event.currentTarget.value)
                            }
                        />
                    </label>

                    <label>
                        Status
                        <input
                            name="status"
                            value={formatDriverStatus(driver.status)}
                            aria-label={`Current status: ${formatDriverStatus(driver.status)}`}
                            disabled
                        />
                    </label>

                    <label className="driver-edit-form__photo-url">
                        Photo URL
                        <input
                            name="photo"
                            placeholder="https://example.com/photo.jpg"
                            type="url"
                            value={photo}
                            onChange={(event) => {
                                setPhoto(event.currentTarget.value);
                                setIsPreviewError(false);
                            }}
                        />
                    </label>

                    <label>
                        Assigned vehicle
                        <select
                            value={vehicleId ?? ""}
                            onChange={event => {
                                const value = event.currentTarget.value;
                                setVehicleId(value === "" ? undefined : Number(value));
                            }}
                        >
                            <option value="">Do not assign vehicle</option>
                            {vehicles.map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <figure className="driver-photo-preview">
                    <img
                        src={canPreviewPhoto ? photo : DRIVER_PHOTO_PLACEHOLDER}
                        alt={canPreviewPhoto ? `Preview of ${name}` : "No photo preview"}
                        onError={() => setIsPreviewError(true)}
                    />
                    <figcaption>
                        {canPreviewPhoto ? "Photo preview" : "Enter a valid image URL"}
                    </figcaption>
                </figure>
            </section>

            <footer className="driver-edit-form__actions">
                <button
                    className="entity-action entity-action--update"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? "Saving..." : "Save driver"}
                </button>
                <button
                    className="driver-edit-form__cancel"
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
