import { deleteVehicle, getVehicle } from "@/api/vehicles";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Spinner } from "@/components/Spinner/Spinner";
import { VehicleServicesSection } from "@/components/Vehicles/VehicleServicesSection";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

export const VehicleCard = () => {
    const { vehicleId } = useParams();
    const numericVehicleId = Number(vehicleId);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const [deletedVehicleLabel, setDeletedVehicleLabel] = useState("");
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
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
    const vehicle = data?.vehicle;

    useEffect(() => {
        if (!isSuccess) return;

        const intervalId = window.setInterval(() => {
            setRedirectCountdown(currentCountdown => {
                const nextCountdown = Number((currentCountdown - 0.1).toFixed(1));

                return Math.max(nextCountdown, 0);
            });
        }, 100);

        return () => window.clearInterval(intervalId);
    }, [isSuccess]);

    useEffect(() => {
        if (isSuccess && redirectCountdown <= 0) {
            navigate("/vehicles");
        }
    }, [isSuccess, navigate, redirectCountdown]);

    const handleConfirmDelete = () => {
        if (!vehicleId || !vehicle) return;

        setDeletedVehicleLabel(`${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}`);
        setIsDeleteConfirmOpen(false);
        mutate(parseInt(vehicleId));
    };

    if (isSuccess) {
        return (
            <div className="success-message">
                <p>{deletedVehicleLabel} was successfully deleted!</p>
                <p>Redirecting to vehicles list in {redirectCountdown.toFixed(1)}s</p>
            </div>
        );
    }

    if (isLoading) return <Spinner />;

    if (!vehicle) return <p>Vehicle not found</p>;

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
                        <p className="vehicle-overview__empty">No assigned driver</p>
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
