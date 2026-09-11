import { deleteDriver, getDriver } from "@/api/drivers";
import { Spinner } from "@/components/Spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export const DriverCard = () => {
    const { driverId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const { mutate, isError, error, isPending, isSuccess } = useMutation({
        mutationFn: (id: number) => deleteDriver(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["drivers"],
            });
        },
    });

    const { isLoading, data: driver } = useQuery({
        enabled: !!driverId,
        queryKey: [driverId, "driver"],
        queryFn: () => getDriver(parseInt(driverId as string)),
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
            navigate("/drivers");
        }
    }, [isSuccess, navigate, redirectCountdown]);

    if (isSuccess) {
        return (
            <div className="success-message">
                <p>
                    {driver?.name} - {driver?.phone_number} was successfully
                    deleted!
                </p>
                <p>
                    Redirecting to drivers list in{" "}
                    {redirectCountdown.toFixed(1)}s
                </p>
            </div>
        );
    }

    return (
        <div>
            {isError && <div>{error.message}</div>}

            {isLoading && <Spinner />}

            {!isLoading && !driver && (
                <p className="error-message">Driver not found</p>
            )}

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
                            {isPending ? (
                                <Spinner text="DELETING..." />
                            ) : (
                                "DELETE"
                            )}
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
        </div>
    );
};
