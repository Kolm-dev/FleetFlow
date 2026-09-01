import { getDrivers } from "@/api/drivers";
import type { DriverStatus } from "@/types/driversTypes";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";

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
            <div className="drivers-status-actions">
                <button onClick={() => changeStatus()}>All</button>
                <button onClick={() => changeStatus("available")}>Available</button>
                <button onClick={() => changeStatus("on_trip")}>On trip</button>
                <button onClick={() => changeStatus("unavailable")}>
                    Unavailable
                </button>
            </div>
            {drivers.map((driver) => (
                <div
                    onClick={() => navigate(`/drivers/${driver.id}`)}
                    key={driver.id}
                >
                    <p>
                        {driver.name} - {driver.phone_number} - {driver.status}
                    </p>
                    {driver.photo && (
                        <img style={{ width: "150px" }} src={driver.photo} />
                    )}
                </div>
            ))}
        </div>
    );
};
