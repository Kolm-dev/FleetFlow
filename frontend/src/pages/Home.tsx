import { getStats } from "@/api/stats";
import { Spinner } from "@/components/Spinner/Spinner";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

export const Home = () => {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ["stats"],
        queryFn: getStats,
    });

    if (isLoading) return <Spinner text="Loading fleet overview..." />;
    if (error) return <p className="error-message">{error.message}</p>;
    if (!stats) return <p className="empty-state">No fleet statistics available.</p>;

    const activeTrips = stats.trips.planned + stats.trips.pending;

    return (
        <div className="home-dashboard">
            <header className="home-dashboard__header">
                <p>Operations</p>
                <h2>Fleet overview</h2>
                <span>Current vehicles, drivers and trip activity</span>
            </header>

            <section className="home-metrics" aria-label="Key fleet statistics">
                <Link to="/vehicles">
                    <span>Vehicles</span>
                    <strong>{stats.vehicles.total}</strong>
                    <small>View fleet</small>
                </Link>
                <Link to="/drivers?status=available">
                    <span>Available drivers</span>
                    <strong>{stats.drivers.available}</strong>
                    <small>Ready for assignment</small>
                </Link>
                <Link to="/drivers?status=on_trip">
                    <span>Drivers on trip</span>
                    <strong>{stats.drivers.on_trip}</strong>
                    <small>Currently active</small>
                </Link>
                <Link to="/trips?status[]=planned&status[]=pending">
                    <span>Active trips</span>
                    <strong>{activeTrips}</strong>
                    <small>Planned and pending</small>
                </Link>
            </section>

            <section className="home-breakdowns" aria-label="Detailed fleet statistics">
                <section className="home-breakdown">
                    <div className="home-breakdown__header">
                        <div>
                            <h2>Trip activity</h2>
                            <p>{stats.trips.total} trips total</p>
                        </div>
                        <Link to="/trips">View trips</Link>
                    </div>
                    <dl>
                        <div>
                            <dt>Planned</dt>
                            <dd>{stats.trips.planned}</dd>
                        </div>
                        <div>
                            <dt>Pending</dt>
                            <dd>{stats.trips.pending}</dd>
                        </div>
                        <div>
                            <dt>Closed</dt>
                            <dd>{stats.trips.closed}</dd>
                        </div>
                        <div>
                            <dt>Cancelled</dt>
                            <dd>{stats.trips.cancelled}</dd>
                        </div>
                    </dl>
                </section>

                <section className="home-breakdown">
                    <div className="home-breakdown__header">
                        <div>
                            <h2>Driver availability</h2>
                            <p>{stats.drivers.total} drivers total</p>
                        </div>
                        <Link to="/drivers">View drivers</Link>
                    </div>
                    <dl>
                        <div>
                            <dt>Available</dt>
                            <dd>{stats.drivers.available}</dd>
                        </div>
                        <div>
                            <dt>On trip</dt>
                            <dd>{stats.drivers.on_trip}</dd>
                        </div>
                        <div>
                            <dt>Unavailable</dt>
                            <dd>{stats.drivers.unavailable}</dd>
                        </div>
                    </dl>
                </section>
            </section>
        </div>
    );
};
