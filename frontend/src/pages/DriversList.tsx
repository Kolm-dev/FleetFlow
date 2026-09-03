import { getDrivers } from "@/api/drivers";
import type { DriverStatus } from "@/types/driversTypes";
import { useQuery } from "@tanstack/react-query";
import { NavLink, useNavigate, useSearchParams } from "react-router";

const DRIVER_PHOTO_PLACEHOLDER = "/icons/non-photo.svg";

const handlerStatus = (status: DriverStatus) => {
    if (status == "on_trip") {
        return "on trip";
    }
    return status;
};

export const DriversList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const status = searchParams.get("status") as DriverStatus;
    const changeStatus = (status?: DriverStatus) => {
        if (!status) {
            setSearchParams({});
            return;
        }

        setSearchParams({ status });
    };
    const {
        isError,
        isLoading,
        error,
        data: response,
    } = useQuery({
        queryKey: ["drivers", status],
        queryFn: () => (status ? getDrivers({ status }) : getDrivers()),
    });

    if (isLoading) return <p>Loading...</p>;
    if (isError) {
        return <div>{error.message}</div>;
    }

    const drivers = response?.drivers ?? [];

    return (
        <div className="drivers-status-container">
            <div className="page-header">
                <div>
                    <h1>Drivers</h1>
                    <p>Total drivers: {response?.total ?? drivers.length}</p>
                </div>
                <NavLink className="create-link" to="/drivers/create">
                    + Create driver
                </NavLink>
            </div>
            <div className="drivers-status-actions">
                <button onClick={() => changeStatus()}>All</button>
                <button onClick={() => changeStatus("available")}>
                    Available
                </button>
                <button onClick={() => changeStatus("on_trip")}>On trip</button>
                <button onClick={() => changeStatus("unavailable")}>
                    Unavailable
                </button>
            </div>
            <div className="drivers-list">
                {drivers.length > 0 ? (
                    drivers.map((driver, index) => (
                        <article className="driver-card" key={driver.id}>
                            <img
                                className="driver-card__photo"
                                src={driver.photo ?? DRIVER_PHOTO_PLACEHOLDER}
                                alt={driver.photo ? driver.name : ""}
                            />

                            <div className="driver-card__content">
                                <div className="driver-card__header">
                                    <span className="driver-card__number">
                                        #{index + 1}
                                    </span>
                                    <h2>{driver.name}</h2>
                                </div>

                                <dl className="driver-card__details">
                                    <div>
                                        <dt>Phone</dt>
                                        <dd>{driver.phone_number}</dd>
                                    </div>
                                    <div>
                                        <dt>Status</dt>
                                        <dd>{handlerStatus(driver.status)}</dd>
                                    </div>
                                </dl>

                                <button
                                    className="driver-card__button"
                                    type="button"
                                    onClick={() =>
                                        navigate(`/drivers/${driver.id}`)
                                    }
                                >
                                    Show driver
                                </button>
                            </div>
                        </article>
                    ))
                ) : (
                    <p className="empty-state">No drivers found</p>
                )}
            </div>
        </div>
    );
};
