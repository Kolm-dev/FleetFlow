import { deleteDriver, getDriver } from "@/api/drivers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

export const DriverCard = () => {
    const { driverId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mutate, isError, error, isPending, isSuccess } = useMutation({
        mutationFn: (id: number) => deleteDriver(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["drivers"],
            });
            navigate("/drivers");
        },
    });

    const { isLoading, data: driver } = useQuery({
        enabled: !!driverId,
        queryKey: [driverId, "driver"],
        queryFn: () => getDriver(parseInt(driverId as string)),
    });
    return (
        <div>
            {isError && <div>{error.message}</div>}

            {isLoading && <p>Loading...</p>}

            {!isLoading && !driver && <p>Driver not found</p>}

            {driver && (
                <>
                    <div>
                        <h1>{driver.name}</h1>
                        <p>Phone: {driver.phone_number}</p>
                        <p>Status: {driver.status}</p>
                    </div>

                    <div>
                        <h2>Driver details</h2>
                        <p>
                            <span>ID: </span>
                            <span>{driver.id}</span>
                        </p>
                        <p>
                            <span>Name: </span>
                            <span>{driver.name}</span>
                        </p>
                        <p>
                            <span>Phone number: </span>
                            <span>{driver.phone_number}</span>
                        </p>
                        <p>
                            <span>Status: </span>
                            <span>{driver.status}</span>
                        </p>
                        <p>
                            <span>Photo URL: </span>
                            <span>{driver.photo ?? "Not specified"}</span>
                        </p>
                        {driver.photo && (
                            <div>
                                <img src={driver.photo} alt={driver.name} />
                            </div>
                        )}
                    </div>

                    <div>
                        <h2>Assigned vehicles - {driver.vehicles.length}</h2>
                        {driver.vehicles.length > 0 ? (
                            <div>
                                {driver.vehicles.map((vehicle) => (
                                    <div key={vehicle.id}>
                                        <p>
                                            <span>
                                                {vehicle.brand} {vehicle.model}
                                            </span>
                                        </p>
                                        <p>
                                            <span>License plate: </span>
                                            <span>{vehicle.license_plate}</span>
                                        </p>
                                        <p>
                                            <span>Year: </span>
                                            <span>
                                                {vehicle.year ??
                                                    "Not specified"}
                                            </span>
                                        </p>
                                        <hr />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No assigned vehicles</p>
                        )}
                    </div>

                    <div>
                        <h2>Actions</h2>
                        <button
                            disabled={isPending}
                            hidden={isSuccess}
                            onClick={() => mutate(parseInt(driverId as string))}
                        >
                            {isPending ? "DELETING..." : "DELETE"}
                        </button>
                        <button
                            hidden={isSuccess}
                            onClick={() =>
                                navigate(`/drivers/${driverId}/edit`)
                            }
                        >
                            Edit
                        </button>
                    </div>
                </>
            )}

            {isSuccess && (
                <p>
                    {driver?.name} - {driver?.phone_number} was successfully
                    deleted!
                </p>
            )}
        </div>
    );
};
