import type { CreateDriverData, DriverStatus } from "@/types/driversTypes";
import React, { useState } from "react";

type DriverCreateFormProps = {
    isPending?: boolean;
    onSubmit: (data: CreateDriverData) => void;
};

export const DriverCreateForm = ({
    isPending = false,
    onSubmit,
}: DriverCreateFormProps) => {
    const [photo, setPhoto] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState<DriverStatus>("available");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        onSubmit({
            name,
            phone_number: phone,
            status,
            photo: photo.trim() || null,
        });
    };

    return (
        <form action="#" onSubmit={handleSubmit} method="post">
            <label htmlFor="name">
                Name
                <input
                    id="name"
                    name="name"
                    onChange={(e) => setName(e.currentTarget.value)}
                    value={name}
                />
            </label>

            <label htmlFor="phone">
                Phone number
                <input
                    id="phone"
                    name="phone"
                    value={phone}
                    type="tel"
                    onChange={(e) => setPhone(e.currentTarget.value)}
                />
            </label>

            <label htmlFor="photo">
                Photo
                <input
                    id="photo"
                    name="photo"
                    type="url"
                    value={photo}
                    onChange={(e) => setPhoto(e.currentTarget.value)}
                />
            </label>

            <select
                value={status}
                onChange={(e) =>
                    setStatus(e.currentTarget.value as DriverStatus)
                }
            >
                <option value="available">Available</option>
                <option value="on_trip">On trip</option>
                <option value="unavailable">Unavailable</option>
            </select>

            <button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create!"}
            </button>
        </form>
    );
};
