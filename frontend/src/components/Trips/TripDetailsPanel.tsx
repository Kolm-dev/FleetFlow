import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { driverStatusStyles } from "@/components/Drivers/driverStatusStyles";
import { tripStatusStyles } from "@/components/Trips/tripStatusStyles";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTime, formatNullableValue } from "@/libs/utils";
import type { Trip } from "@/types/tripsTypes";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowUpRight, CarFront, Mail, MapPin, Phone, UserRound, X } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

export type TripDetailsType = {
    onClose: () => void;
    trip: Trip;
};

type DetailItemProps = {
    label: string;
    children: ReactNode;
};

const DetailItem = ({ label, children }: DetailItemProps) => (
    <div className="min-w-0">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 wrap-break-word text-sm font-semibold text-foreground">{children}</dd>
    </div>
);

const TripDetailsPanel = ({ onClose, trip }: TripDetailsType) => {
    const clientPhones = trip.client?.phones ?? [];

    return (
        <Dialog.Root
            open
            onOpenChange={open => {
                if (!open) onClose();
            }}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
                <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-2xl outline-none sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)]">
                    <header className="flex shrink-0 items-start justify-between gap-4 border-b px-4 py-4 sm:px-6 sm:py-5">
                        <div className="min-w-0">
                            <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Trip #{trip.id}
                            </p>
                            <Dialog.Title className="wrap-break-word text-xl font-semibold tracking-tight sm:text-2xl">
                                {trip.title}
                            </Dialog.Title>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span
                                className={`rounded px-2.5 py-1 text-xs font-semibold capitalize ${tripStatusStyles[trip.status].badge}`}
                            >
                                {trip.status}
                            </span>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label="Close trip details"
                                onClick={onClose}
                            >
                                <X aria-hidden="true" />
                            </Button>
                        </div>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Card className="gap-0 py-0 sm:col-span-2">
                                <CardHeader className="px-4 pt-4 pb-0">
                                    <CardTitle className="text-sm">Trip overview</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 p-4 pt-3 sm:grid-cols-3">
                                    <DetailItem label="Distance">
                                        {trip.distance === null ? "—" : `${formatNullableValue(trip.distance)} km`}
                                    </DetailItem>
                                    <DetailItem label="Price">{formatCurrency(trip.price, "—")}</DetailItem>
                                    <DetailItem label="Created">
                                        {formatDateTime(trip.created_at, { fallback: "—" })}
                                    </DetailItem>
                                </CardContent>
                            </Card>

                            <Card className="gap-0 py-0">
                                <CardHeader className="grid-cols-[auto_1fr] items-center gap-2 px-4 pt-4 pb-0">
                                    <UserRound
                                        className="size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <CardTitle className="text-sm">Driver</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-3">
                                    {trip.driver ? (
                                        <dl className="grid gap-3">
                                            <DetailItem label="Name">
                                                <Link
                                                    className="underline-offset-4 hover:underline"
                                                    to={`/drivers/${trip.driver.id}`}
                                                >
                                                    {trip.driver.name}
                                                </Link>
                                            </DetailItem>
                                            <DetailItem label="Phone">
                                                <a
                                                    className="underline-offset-4 hover:underline"
                                                    href={`tel:${trip.driver.phone_number}`}
                                                >
                                                    {trip.driver.phone_number}
                                                </a>
                                            </DetailItem>
                                            <div className="flex items-center justify-between gap-3">
                                                <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                                                <dd
                                                    className={`m-0 rounded-full px-2.5 py-1 text-xs font-medium ${driverStatusStyles[trip.driver.status].badge}`}
                                                >
                                                    {driverStatusStyles[trip.driver.status].label}
                                                </dd>
                                            </div>
                                        </dl>
                                    ) : (
                                        <p className="m-0 text-sm text-muted-foreground">No driver assigned.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="gap-0 py-0">
                                <CardHeader className="grid-cols-[auto_1fr] items-center gap-2 px-4 pt-4 pb-0">
                                    <CarFront
                                        className="size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <CardTitle className="text-sm">Vehicle</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-3">
                                    {trip.vehicle ? (
                                        <dl className="grid grid-cols-2 gap-3">
                                            <DetailItem label="Vehicle">
                                                {trip.vehicle.brand} {trip.vehicle.model}
                                            </DetailItem>
                                            <DetailItem label="License plate">{trip.vehicle.license_plate}</DetailItem>
                                            {trip.vehicle.year !== null && (
                                                <DetailItem label="Year">{trip.vehicle.year}</DetailItem>
                                            )}
                                        </dl>
                                    ) : (
                                        <p className="m-0 text-sm text-muted-foreground">No vehicle assigned.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="gap-0 py-0 sm:col-span-2">
                                <CardHeader className="grid-cols-[auto_1fr] items-center gap-2 px-4 pt-4 pb-0">
                                    <UserRound
                                        className="size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <CardTitle className="text-sm">Client</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-3">
                                    {trip.client ? (
                                        <dl className="grid gap-3 sm:grid-cols-2">
                                            <DetailItem label="Name">
                                                <Link
                                                    className="underline-offset-4 hover:underline"
                                                    to={`/clients/${trip.client.id}`}
                                                >
                                                    {trip.client.name}
                                                </Link>
                                            </DetailItem>
                                            {trip.client.email && (
                                                <DetailItem label="Email">
                                                    <a
                                                        className="inline-flex min-w-0 items-center gap-1.5 underline-offset-4 hover:underline"
                                                        href={`mailto:${trip.client.email}`}
                                                    >
                                                        <Mail
                                                            className="size-3.5 shrink-0"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="truncate">{trip.client.email}</span>
                                                    </a>
                                                </DetailItem>
                                            )}
                                            {clientPhones.map((phone, index) => {
                                                const phoneNumber = phone.phone_number ?? phone.phone;

                                                if (!phoneNumber) return null;

                                                return (
                                                    <DetailItem
                                                        key={`${phoneNumber}-${phone.label ?? index}`}
                                                        label={phone.label || "Phone"}
                                                    >
                                                        <a
                                                            className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                                                            href={`tel:${phoneNumber}`}
                                                        >
                                                            <Phone
                                                                className="size-3.5 shrink-0"
                                                                aria-hidden="true"
                                                            />
                                                            {phoneNumber}
                                                        </a>
                                                    </DetailItem>
                                                );
                                            })}
                                            {trip.client.address && (
                                                <DetailItem label="Address">
                                                    <span className="inline-flex items-start gap-1.5">
                                                        <MapPin
                                                            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                                                            aria-hidden="true"
                                                        />
                                                        {trip.client.address}
                                                    </span>
                                                </DetailItem>
                                            )}
                                        </dl>
                                    ) : (
                                        <p className="m-0 text-sm text-muted-foreground">No client assigned.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <footer className="flex shrink-0 flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end sm:px-6">
                        <Button
                            className="w-full sm:w-auto"
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        <Link
                            className={cn(buttonVariants(), "w-full no-underline sm:w-auto")}
                            to={`/trips/${trip.id}`}
                            onClick={onClose}
                        >
                            View full details
                            <ArrowUpRight aria-hidden="true" />
                        </Link>
                    </footer>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default TripDetailsPanel;
