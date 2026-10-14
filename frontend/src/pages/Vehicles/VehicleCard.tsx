import { getDrivers } from "@/api/drivers";
import { deleteVehicle, getVehicle } from "@/api/vehicles";
import { updateVehicle } from "@/api/vehicles";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Spinner } from "@/components/Spinner/Spinner";
import { VehicleServicesSection } from "@/components/Vehicles/VehicleServicesSection";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBackendErrorMessage } from "@/libs/errors";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Fuel, Gauge, Hash, Pencil, Trash2, Truck, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

export const VehicleCard = () => {
    const { vehicleId } = useParams();
    const numericVehicleId = Number(vehicleId);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [deletedVehicleLabel, setDeletedVehicleLabel] = useState("");
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [driverIdToAssign, setDriverIdToAssign] = useState<number | undefined>();
    const { mutate, isSuccess, isPending } = useMutation({
        mutationFn: (id: number) => deleteVehicle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["vehicles"],
            });
        },
    });

    const { isLoading, data } = useQuery({
        enabled: Number.isInteger(numericVehicleId),
        queryKey: ["vehicles", numericVehicleId],
        queryFn: () => getVehicle(numericVehicleId),
    });
    const { isLoading: isDriversLoading, data: driversResponse } = useQuery({
        queryKey: ["drivers", { status: "available" }],
        queryFn: () => getDrivers({ status: "available" }),
    });
    const vehicle = data?.vehicle;
    const availableDrivers = driversResponse?.drivers ?? [];
    const hasAvailableDrivers = availableDrivers.length > 0;
    const assignedDriver = vehicle?.driver;
    const driversForSelect =
        assignedDriver && !availableDrivers.some(driver => driver.id === assignedDriver.id)
            ? [assignedDriver, ...availableDrivers]
            : availableDrivers;
    const selectedDriverId = driverIdToAssign ?? vehicle?.driver_id;

    const assignDriverMutation = useMutation({
        mutationFn: (driverId: number) => updateVehicle({ driver_id: driverId }, numericVehicleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            queryClient.invalidateQueries({ queryKey: ["vehicles", numericVehicleId] });
            queryClient.invalidateQueries({ queryKey: ["drivers"] });
        },
    });

    const handleConfirmDelete = () => {
        if (!vehicleId || !vehicle) return;

        setDeletedVehicleLabel(`${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}`);
        setIsDeleteConfirmOpen(false);
        mutate(parseInt(vehicleId));
    };

    if (isSuccess) {
        return (
            <SuccessMessage
                tag="vehicle"
                successText={`${deletedVehicleLabel} was successfully deleted. Redirecting to the vehicles list in 3 seconds.`}
                time={3000}
                onComplete={() => navigate("/vehicles")}
            />
        );
    }

    if (isLoading || isDriversLoading) return <Spinner />;

    if (!vehicle) return <ErrorMessage messages="Vehicle not found." />;

    const vehicleDetails = [
        { label: "Brand", value: vehicle.brand, icon: Truck },
        { label: "Model", value: vehicle.model, icon: Truck },
        { label: "Year", value: vehicle.year ?? "Not specified", icon: CalendarDays },
        { label: "Fuel type", value: vehicle.fuel_type ?? "Not specified", icon: Fuel },
        {
            label: "Fuel consumption",
            value: vehicle.fuel_consumption ? `${vehicle.fuel_consumption} L/100 km` : "Not specified",
            icon: Gauge,
        },
    ];
    return (
        <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:gap-8 sm:px-6">
            <header className="flex min-w-0 flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate("/vehicles")}>
                        <ArrowLeft aria-hidden="true" />
                        All vehicles
                    </Button>
                    <div className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
                            <Truck className="size-6 sm:size-7" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <div className="min-w-0">
                                <p className="mb-1 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Vehicle details
                                </p>
                                <h1 className="wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl">
                                    {vehicle.brand} {vehicle.model}
                                </h1>
                                <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1 font-mono text-sm font-medium tracking-wide text-muted-foreground">
                                    <Hash className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span className="break-all">{vehicle.license_plate}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button variant="outline" onClick={() => navigate(`/vehicles/${vehicleId}/edit`)}>
                        <Pencil aria-hidden="true" />
                        Edit vehicle
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => setIsDeleteConfirmOpen(true)}
                    >
                        <Trash2 aria-hidden="true" />
                        {isPending ? "Deleting..." : "Delete vehicle"}
                    </Button>
                </div>
            </header>

            <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Vehicle information</CardTitle>
                        <CardDescription>Specifications and operating details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                            {vehicleDetails.map(({ label, value, icon: Icon }) => (
                                <div key={label} className="flex min-w-0 items-start gap-3 rounded-lg border bg-muted/20 p-3.5">
                                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                    <div className="min-w-0">
                                        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                                        <dd className="mt-1 wrap-break-word text-sm font-medium text-foreground">
                                            {value}
                                        </dd>
                                    </div>
                                </div>
                            ))}
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UserRound className="size-5" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-lg">Assigned driver</CardTitle>
                                <CardDescription>Current vehicle assignment</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {vehicle.driver ? (
                            <div className="rounded-lg border bg-muted/20 p-3.5">
                                <p className="text-xs font-medium text-muted-foreground">Driver</p>
                                <Link
                                    className="mt-1 inline-block max-w-full wrap-break-word text-base font-semibold underline-offset-4 hover:text-primary hover:underline"
                                    to={`/drivers/${vehicle.driver.id}`}
                                >
                                    {vehicle.driver.name}
                                </Link>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Status: {vehicle.driver.status === "on_trip" ? "On trip" : vehicle.driver.status}
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                No driver is assigned to this vehicle yet.
                            </div>
                        )}

                        {hasAvailableDrivers ? (
                            <form
                                className="grid gap-3"
                                onSubmit={event => {
                                    event.preventDefault();

                                    if (selectedDriverId !== undefined && selectedDriverId !== null) {
                                        assignDriverMutation.mutate(selectedDriverId);
                                    }
                                }}
                            >
                                <label className="grid gap-2 text-sm font-medium">
                                    Assign available driver
                                    <select
                                        className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                        value={selectedDriverId ?? ""}
                                        onChange={event => {
                                            const value = event.currentTarget.value;
                                            setDriverIdToAssign(value === "" ? undefined : Number(value));
                                        }}
                                    >
                                        <option value="">Select driver</option>
                                        {driversForSelect.map(driver => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.name} - {driver.status === "on_trip" ? "on trip" : driver.status}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <Button
                                    type="submit"
                                    disabled={
                                        assignDriverMutation.isPending ||
                                        selectedDriverId === undefined ||
                                        selectedDriverId === vehicle.driver_id
                                    }
                                >
                                    {assignDriverMutation.isPending ? "Assigning..." : "Assign driver"}
                                </Button>
                                {assignDriverMutation.isError && (
                                    <ErrorMessage
                                        messages={getBackendErrorMessage(
                                            assignDriverMutation.error,
                                            "Could not assign driver."
                                        )}
                                    />
                                )}
                                {assignDriverMutation.isSuccess && (
                                    <SuccessMessage
                                        tag="driver"
                                        successText="Driver assigned successfully."
                                        time={3000}
                                    />
                                )}
                            </form>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No available drivers to assign right now.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </section>

            <VehicleServicesSection
                vehicleId={numericVehicleId}
                statistics={data.service_statistics}
            />

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                title="Delete vehicle?"
                message={`Vehicle "${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}" will be permanently deleted.`}
                confirmText="Delete vehicle"
                isConfirming={isPending}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteConfirmOpen(false)}
            />
        </main>
    );
};
