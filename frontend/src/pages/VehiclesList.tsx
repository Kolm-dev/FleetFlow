import { getVehicles } from "@/api/vehicles";
import { useQuery } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router";

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
            <div className="page-header">
                <div>
                    <h1>Vehicles</h1>
                    <p>Total found: {data.total}</p>
                </div>
                <NavLink className="create-link" to="/vehicles/create">
                    + Create vehicle
                </NavLink>
            </div>

            <div className="vehicles-list">
                {vehicles.length > 0 ? (
                    vehicles.map((vehicle, index) => (
                        <article className="vehicle-card" key={vehicle.id}>
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

                            <button
                                className="vehicle-card__button"
                                type="button"
                                onClick={() =>
                                    navigate(`/vehicles/${vehicle.id}`)
                                }
                            >
                                Show vehicle
                            </button>
                        </article>
                    ))
                ) : (
                    <p className="empty-state">No vehicles found</p>
                )}
            </div>
        </div>
    );
};

export default VehiclesList;
