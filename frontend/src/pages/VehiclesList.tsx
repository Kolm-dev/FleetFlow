import { getVehicles } from "@/api/vehicles";
import { Spinner } from "@/components/Spinner";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router";

const VehiclesList = () => {
    const { data, isPending, isError, error } = useQuery({
        queryKey: ["vehicles"],
        queryFn: () => getVehicles(),
    });

    if (isPending) return <Spinner text="Loading vehicles..." />;
    if (isError) {
        return <div>Failed to load vehicles: {error.message}</div>;
    }

    const vehicles = data.vehicles;

    return (
        <div>
            <header className="page-header entity-list-header">
                <div>
                    <h2>Vehicles</h2>
                    <p>Total found: {data.total}</p>
                </div>
                <NavLink className="create-link entity-action--create" to="/vehicles/create">
                    Create vehicle
                </NavLink>
            </header>

            <div className="vehicles-list">
                {vehicles.length > 0 ? (
                    vehicles.map((vehicle, index) => (
                        <NavLink
                            className="vehicle-card"
                            key={vehicle.id}
                            to={`/vehicles/${vehicle.id}`}
                        >
                            <div className="vehicle-card__header">
                                <span className="vehicle-card__number">
                                    #{index + 1}
                                </span>
                                <h2>
                                    {vehicle.brand} {vehicle.model}
                                </h2>
                            </div>

                            <dl className="vehicle-card__details">
                                <div>
                                    <dt>License plate</dt>
                                    <dd>{vehicle.license_plate}</dd>
                                </div>
                                <div>
                                    <dt>Year</dt>
                                    <dd>{vehicle.year ?? "Not specified"}</dd>
                                </div>
                            </dl>
                        </NavLink>
                    ))
                ) : (
                    <p className="empty-state">No vehicles found</p>
                )}
            </div>
        </div>
    );
};

export default VehiclesList;
