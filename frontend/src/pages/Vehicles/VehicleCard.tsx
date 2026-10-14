import { getDrivers } from "@/api/drivers";
import { deleteVehicle, getVehicle } from "@/api/vehicles";
import { updateVehicle } from "@/api/vehicles";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Spinner } from "@/components/Spinner/Spinner";
import { VehicleServicesSection } from "@/components/Vehicles/VehicleServicesSection";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { getBackendErrorMessage } from "@/libs/errors";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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

    if (!vehicle) return ErrorMessage({ messages: ["Vehicle not found."] });

    return (
        <div className="vehicle-details-page">
            <header className="page-header vehicle-details-header">
                <div>
                    <p className="vehicle-details-header__label">Vehicle</p>
                    <h1>
                        {vehicle.brand} {vehicle.model}
                    </h1>
                    <p className="vehicle-details-header__plate">{vehicle.license_plate}</p>
                </div>

                <div className="entity-actions vehicle-details-header__actions">
                    <button
                        className="entity-action entity-action--vehicle entity-action--edit"
                        type="button"
                        hidden={isSuccess}
                        onClick={() => navigate(`/vehicles/${vehicleId}/edit`)}
                    >
                        Edit vehicle
                    </button>
                    <button
                        className="entity-action entity-action--vehicle entity-action--delete"
                        type="button"
                        disabled={isPending}
                        hidden={isSuccess}
                        onClick={() => setIsDeleteConfirmOpen(true)}
                    >
                        {isPending ? "Deleting..." : "Delete vehicle"}
                    </button>
                </div>
            </header>

            <section className="vehicle-overview">
                <div className="vehicle-overview__section">
                    <h2>Vehicle details</h2>
                    <dl className="vehicle-overview__details">
                        <div>
                            <dt>Brand</dt>
                            <dd>{vehicle.brand}</dd>
                        </div>
                        <div>
                            <dt>Model</dt>
                            <dd>{vehicle.model}</dd>
                        </div>
                        <div>
                            <dt>Year</dt>
                            <dd>{vehicle.year ?? "Not specified"}</dd>
                        </div>
                        <div>
                            <dt>License plate</dt>
                            <dd>{vehicle.license_plate}</dd>
                        </div>
                        <div>
                            <dt>Fuel</dt>
                            <dd>{vehicle.fuel_type ?? "Not specified"}</dd>
                        </div>
                        <div>
                            <dt>Fuel consumption</dt>
                            <dd>
                                {vehicle.fuel_consumption ? `${vehicle.fuel_consumption} L/100km` : "Not specified"}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="vehicle-overview__section vehicle-overview__driver">
                    <h2>Assigned driver</h2>
                    {vehicle.driver ? (
                        <dl className="vehicle-overview__details">
                            <div>
                                <dt>Name</dt>
                                <dd>
                                    <Link to={`/drivers/${vehicle.driver.id}`}>{vehicle.driver.name}</Link>
                                </dd>
                            </div>
                            <div>
                                <dt>Status</dt>
                                <dd>{vehicle.driver.status === "on_trip" ? "On trip" : vehicle.driver.status}</dd>
                            </div>
                        </dl>
                    ) : (
                        <p className="vehicle-overview__empty">
                            No driver selected. <br />
                            You can assign a driver using the form below.
                        </p>
                    )}
                    {hasAvailableDrivers && (
                        <form
                            className="vehicle-driver-assignment"
                            onSubmit={event => {
                                event.preventDefault();

                                if (selectedDriverId !== undefined && selectedDriverId !== null) {
                                    assignDriverMutation.mutate(selectedDriverId);
                                }
                            }}
                        >
                            <label>
                                Assign available driver
                                <select
                                    value={selectedDriverId ?? ""}
                                    onChange={event => {
                                        const value = event.currentTarget.value;
                                        setDriverIdToAssign(value === "" ? undefined : Number(value));
                                    }}
                                >
                                    <option value="">Select driver</option>
                                    {driversForSelect.map(driver => (
                                        <option
                                            key={driver.id}
                                            value={driver.id}
                                        >
                                            {driver.name} - {driver.status === "on_trip" ? "on trip" : driver.status}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                className="entity-action entity-action--update"
                                type="submit"
                                disabled={
                                    assignDriverMutation.isPending ||
                                    selectedDriverId === undefined ||
                                    selectedDriverId === vehicle.driver_id
                                }
                            >
                                {assignDriverMutation.isPending ? "Assigning..." : "Assign driver"}
                            </button>
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
                    )}
                </div>
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
        </div>
    );
};
