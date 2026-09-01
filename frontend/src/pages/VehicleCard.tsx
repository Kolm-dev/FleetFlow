import { deleteVehicle, getVehicle } from "@/api/vehicles";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

export const VehicleCard = () => {
    const { vehicleId } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { mutate, isSuccess, isPending } = useMutation({
        mutationFn: (id: number) => deleteVehicle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["vehicles", vehicleId],
            });

            setTimeout(() => navigate("/vehicles"), 1500);
        },
    });

    const { isLoading, data: vehicle } = useQuery({
        enabled: !!vehicleId,
        queryKey: ["vehicles", vehicleId],
        queryFn: () => getVehicle(parseInt(vehicleId as string)),
    });

    if (isLoading) return <p>Loading...</p>;

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
                    onClick={() => mutate(parseInt(vehicleId as string))}
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

            {isSuccess && (
                <p>
                    {vehicle.brand} {vehicle.model} - {vehicle.license_plate}{" "}
                    was successfully deleted!
                </p>
            )}
        </div>
    );
};
