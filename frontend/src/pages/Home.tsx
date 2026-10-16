import { getStats } from "@/api/stats";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBreakdownCard } from "@/components/shared/StatusBreakdownCard";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Spinner } from "@/components/Spinner/Spinner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Route, Users } from "lucide-react";

export const Home = () => {
    const {
        data: stats,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["stats"],
        queryFn: getStats,
    });

    if (isLoading) return <Spinner text="Loading fleet overview..." />;
    if (error) return <ErrorMessage messages={error.message} fallbackMessage="Could not load fleet statistics." />;
    if (!stats) return <p className="empty-state">No fleet statistics available.</p>;

    const activeTrips = stats.trips.planned + stats.trips.pending;

    const tripStatuses = [
        { label: "Planned", value: stats.trips.planned, tone: "slate" },
        { label: "Pending", value: stats.trips.pending, tone: "amber" },
        { label: "Closed", value: stats.trips.closed, tone: "emerald" },
        { label: "Cancelled", value: stats.trips.cancelled, tone: "rose" },
    ] as const;

    const driverStatuses = [
        { label: "Available", value: stats.drivers.available, tone: "emerald" },
        { label: "On trip", value: stats.drivers.on_trip, tone: "blue" },
        { label: "Unavailable", value: stats.drivers.unavailable, tone: "slate" },
    ] as const;

    return (
        <main className="mx-auto grid min-w-0 w-full max-w-5xl gap-5 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:gap-8 lg:py-8">
            <Card>
                <CardHeader className="gap-1.5">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Operations</p>
                    <CardTitle className="text-2xl tracking-tight sm:text-3xl">Fleet overview</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Current vehicles, drivers and trip activity
                    </CardDescription>
                </CardHeader>
            </Card>

            <section
                className="grid min-w-0 auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
                aria-label="Key fleet statistics"
            >
                <StatCard
                    title="Vehicles"
                    value={stats.vehicles.total}
                    description="View fleet"
                    to="/vehicles"
                />
                <StatCard
                    title="Available drivers"
                    value={stats.drivers.available}
                    description="Ready for assignment"
                    to="/drivers?status=available"
                />
                <StatCard
                    title="Drivers on trip"
                    value={stats.drivers.on_trip}
                    description="Currently active"
                    to="/drivers?status=on_trip"
                />
                <StatCard
                    title="Active trips"
                    value={activeTrips}
                    description="Planned and pending"
                    to="/trips?status[]=planned&status[]=pending"
                />
            </section>

            <section
                className="grid min-w-0 gap-4 xl:grid-cols-2"
                aria-label="Detailed fleet statistics"
            >
                <StatusBreakdownCard
                    title="Trip activity"
                    eyebrow="Trips overview"
                    total={stats.trips.total}
                    totalLabel="total trips"
                    statuses={[...tripStatuses]}
                    to="/trips"
                    linkLabel="View trips"
                    distributionLabel="Trip status distribution"
                    icon={Route}
                    accent="blue"
                />
                <StatusBreakdownCard
                    title="Driver availability"
                    eyebrow="Team status"
                    total={stats.drivers.total}
                    totalLabel="total drivers"
                    statuses={[...driverStatuses]}
                    to="/drivers"
                    linkLabel="View drivers"
                    distributionLabel="Driver status distribution"
                    icon={Users}
                    accent="emerald"
                />
            </section>
        </main>
    );
};
