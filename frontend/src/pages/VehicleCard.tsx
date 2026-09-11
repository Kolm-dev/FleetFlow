import { deleteVehicle, getVehicle } from "@/api/vehicles";
import { Spinner } from "@/components/Spinner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export const VehicleCard = () => {
    const { vehicleId } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const [deletedVehicleLabel, setDeletedVehicleLabel] = useState("");
    const { mutate, isSuccess, isPending } = useMutation({
        mutationFn: (id: number) => deleteVehicle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["vehicles"],
            });
        },
    });

    const { isLoading, data: vehicle } = useQuery({
        enabled: !!vehicleId,
        queryKey: ["vehicles", vehicleId],
        queryFn: () => getVehicle(parseInt(vehicleId as string)),
    });

    useEffect(() => {
        if (!isSuccess) return;

        const intervalId = window.setInterval(() => {
            setRedirectCountdown((currentCountdown) => {
                const nextCountdown = Number(
                    (currentCountdown - 0.1).toFixed(1),
                );

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

    if (isSuccess) {
        return (
            <div className="success-message">
                <p>{deletedVehicleLabel} was successfully deleted!</p>
                <p>
                    Redirecting to vehicles list in{" "}
                    {redirectCountdown.toFixed(1)}s
                </p>
            </div>
        );
    }

    if (isLoading) return <Spinner />;

    if (!vehicle) return <p>Vehicle not found</p>;

    return (
        <div>
            <div>
                <h1>
                    {vehicle.brand} {vehicle.model}
                </h1>
                <p>License plate: {vehicle.license_plate}</p>
            </div>

            <div>
                <h2>Vehicle details</h2>
                <p>
                    <span>Brand: </span>
                    <span>{vehicle.brand}</span>
                </p>
                <p>
                    <span>Model: </span>
                    <span>{vehicle.model}</span>
                </p>
                <p>
                    <span>Year: </span>
                    <span>{vehicle.year ?? "Not specified"}</span>
                </p>
                <p>
                    <span>License plate: </span>
                    <span>{vehicle.license_plate}</span>
                </p>
            </div>

            <div>
                <h2>Assigned driver</h2>
                {vehicle.driver ? (
                    <div>
                        <p>
                            <span>Name: </span>
                            <span>{vehicle.driver.name}</span>
                        </p>
                        <p>
                            <span>Status: </span>
                            <span>{vehicle.driver.status}</span>
                        </p>
                    </div>
                ) : (
                    <p>No assigned driver</p>
                )}
            </div>

            <div>
                <h2>Actions</h2>
                <button
                    disabled={isPending}
                    hidden={isSuccess}
                    onClick={() => {
                        setDeletedVehicleLabel(
                            `${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}`,
                        );
                        mutate(parseInt(vehicleId as string));
                    }}
                >
                    {isPending ? "DELETING..." : "DELETE"}
                </button>
                <button
                    hidden={isSuccess}
                    onClick={() => navigate(`/vehicles/${vehicleId}/edit`)}
                >
                    Edit
                </button>
            </div>
        </div>
    );
};
