import type {
    Driver,
    DriverStatus,
    UpdateDriverData,
} from "@/types/driversTypes";
import { isHttpUrl } from "@/libs/utils";
import type { FormEvent } from "react";
import { useState } from "react";

const DRIVER_PHOTO_PLACEHOLDER = "/icons/non-photo.svg";

type DriverEditFormProps = {
    driver: Driver;
    isPending?: boolean;
    onSubmit: (data: UpdateDriverData) => void;
    onCancel: () => void;
};

export const DriverEditForm = ({
    driver,
    isPending = false,
    onSubmit,
    onCancel,
}: DriverEditFormProps) => {
    const [name, setName] = useState(driver.name);
    const [phoneNumber, setPhoneNumber] = useState(driver.phone_number);
    const [status, setStatus] = useState<DriverStatus>(
        driver.status ?? "available",
    );
    const [photo, setPhoto] = useState(driver.photo ?? "");
    const [isPreviewError, setIsPreviewError] = useState(false);
    const canPreviewPhoto = isHttpUrl(photo) && !isPreviewError;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        onSubmit({
            name,
            phone_number: phoneNumber,
            status,
            photo: photo.trim() || null,
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
                        <select
                            name="status"
                            value={status}
                            onChange={(event) =>
                                setStatus(event.currentTarget.value as DriverStatus)
                            }
                        >
                            <option value="available">Available</option>
                            <option value="on_trip">On trip</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
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
