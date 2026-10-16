import type { Trip } from "@/types/tripsTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tripStatusStyles } from "@/components/Trips/tripStatusStyles";
import { Link, useNavigate } from "react-router";
import { ConfirmModal } from "@/components/ConfirmModal";
import { formatCurrency, formatDateOnly, formatNullableValue } from "@/libs/utils";
import { useState } from "react";

type TripCardProps = {
    trip: Trip;
    onCancel: (id: number) => void;
    onStart: (id: number) => void;
    onClose: (id: number) => void;
    onDelete: (id: number) => void;
    onDetailsClick: () => void;
};

export const TripCard = ({ onStart, onCancel, onClose, onDelete, onDetailsClick, trip }: TripCardProps) => {
    const navigate = useNavigate();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const isActiveTrip = trip.status === "pending";
    const canStart = trip.status === "planned";
    const canClose = trip.status === "pending";
    const canCancel = trip.status === "planned" || trip.status === "pending";

    const handleConfirmDelete = () => {
        onDelete(trip.id);
        setIsDeleteConfirmOpen(false);
    };

    return (
        <>
            <Card className="h-full min-w-0 gap-0 py-0">
                <CardContent className="flex h-full min-w-0 flex-col gap-5 p-4 sm:p-5">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Trip #{trip.id}
                            </p>
                            <Link
                                className="wrap-break-word text-base font-semibold leading-snug text-foreground underline-offset-4 hover:underline focus-visible:underline sm:text-lg"
                                to={`/trips/${trip.id}`}
                            >
                                {trip.title}
                            </Link>
                        </div>
                        <span
                            className={`shrink-0 rounded px-2.5 py-1 text-xs font-semibold capitalize ${tripStatusStyles[trip.status].badge}`}
                        >
                            {trip.status}
                        </span>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
                        <div className="min-w-0">
                            <dt className="text-sm text-muted-foreground">Driver</dt>
                            <Link
                                className="underline-offset-4 hover:underline"
                                to={`/drivers/${trip.driver_id}`}
                            >
                                <dd className="mt-0.5 truncate text-sm font-semibold text-foreground">
                                    {trip.driver?.name ?? "Unassigned"}
                                </dd>
                            </Link>
                        </div>
                        <div className="min-w-0">
                            <dt className="text-sm text-muted-foreground">Vehicle</dt>
                            <Link
                                className="underline-offset-4 hover:underline"
                                to={`/vehicles/${trip.vehicle_id}`}
                            >
                                <dd className="mt-0.5 truncate text-sm font-semibold text-foreground">
                                    {trip.vehicle
                                        ? `${trip.vehicle.brand} ${trip.vehicle.model} [${trip.vehicle.license_plate}]`
                                        : "Unassigned"}
                                </dd>
                            </Link>
                        </div>
                        <div className="min-w-0">
                            <dt className="text-sm text-muted-foreground">Distance</dt>
                            <dd className="mt-0.5 truncate text-sm font-semibold text-foreground">
                                {formatNullableValue(trip.distance)}
                                {trip.distance !== null ? " km" : ""}
                            </dd>
                        </div>
                        <div className="min-w-0">
                            <dt className="text-sm text-muted-foreground">Price</dt>
                            <dd className="mt-0.5 truncate text-sm font-semibold text-foreground">
                                {formatCurrency(trip.price)}
                            </dd>
                        </div>
                    </dl>

                    <div className="mt-auto flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="m-0 text-sm text-muted-foreground">
                            Created {trip.created_at ? formatDateOnly(trip.created_at) : "—"}
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                            {(canStart || canClose || canCancel) && (
                                <div className="flex flex-wrap gap-2">
                                    {canStart && (
                                        <Button
                                            size="sm"
                                            type="button"
                                            onClick={() => onStart(trip.id)}
                                        >
                                            Start
                                        </Button>
                                    )}
                                    {canClose && (
                                        <Button
                                            size="sm"
                                            type="button"
                                            onClick={() => onClose(trip.id)}
                                        >
                                            Close
                                        </Button>
                                    )}
                                    {canCancel && (
                                        <Button
                                            size="sm"
                                            type="button"
                                            variant="outline"
                                            onClick={() => onCancel(trip.id)}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                    onClick={onDetailsClick}
                                >
                                    Details
                                </Button>
                                <Button
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(`/trips/${trip.id}/edit`)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    className="disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"
                                    size="sm"
                                    type="button"
                                    variant="destructive"
                                    disabled={isActiveTrip}
                                    title={isActiveTrip ? "Active trips cannot be deleted." : "Delete trip"}
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                title="Delete trip?"
                message={`Trip "${trip.title}" will be permanently deleted.`}
                confirmText="Delete trip"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteConfirmOpen(false)}
            />
        </>
    );
};
