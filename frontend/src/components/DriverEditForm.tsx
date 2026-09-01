import type {
    Driver,
    DriverStatus,
    UpdateDriverData,
} from "@/types/driversTypes";
import type { FormEvent } from "react";
import { useState } from "react";

type DriverEditFormProps = {
    driver: Driver;
    isPending?: boolean;
    onSubmit: (data: UpdateDriverData) => void;
};

export const DriverEditForm = ({
    driver,
    isPending = false,
    onSubmit,
}: DriverEditFormProps) => {
    const [name, setName] = useState(driver.name);
    const [phoneNumber, setPhoneNumber] = useState(driver.phone_number);
    const [status, setStatus] = useState<DriverStatus>(
        driver.status ?? "available",
    );
    const [photo, setPhoto] = useState(driver.photo ?? "");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        onSubmit({
            name,
            phone_number: phoneNumber,
            status,
            photo: photo,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Name
                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                />
            </label>

            <label>
                Phone
                <input
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

            <label>
                Photo URL
                <input
                    type="url"
                    value={photo ?? ""}
                    onChange={(event) => setPhoto(event.currentTarget.value)}
                />
            </label>

            <button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
            </button>
        </form>
    );
};
