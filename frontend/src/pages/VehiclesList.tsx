import { getVehicles } from "@/api/vehicles";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

const VehiclesList = () => {
    const navigate = useNavigate();
    const { data, isPending, isError, error } = useQuery({
        queryKey: ["vehicles"],
        queryFn: () => getVehicles(),
    });

    if (isPending) return <div>Loading vehicles...</div>;
    if (isError) {
        return <div>Failed to load vehicles: {error.message}</div>;
    }

    const vehicles = data.vehicles;

    return (
        <div>
            <div>
                <h1>Vehicles</h1>
                <h4>Total found: {data.total}</h4>
            </div>

            <div>
                {vehicles.length > 0 ? (
                    vehicles.map((vehicle, index) => (
                        <div key={vehicle.id}>
                            <p>
                                <span>{index + 1}. </span>
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
                                <span>{vehicle.year ?? "Not specified"}</span>
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(`/vehicles/${vehicle.id}`)
                                }
                            >
                                Show vehicle
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No vehicles found</p>
                )}
            </div>
        </div>
    );
};

export default VehiclesList;
