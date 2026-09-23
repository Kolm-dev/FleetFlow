export type Stats = {
    drivers: {
        total: number;
        available: number;
        on_trip: number;
        unavailable: number;
    };
    vehicles: {
        total: number;
    };
    trips: {
        total: number;
        planned: number;
        pending: number;
        closed: number;
        cancelled: number;
    };
};


export type DriverStatistics = {
    closed_trips_count: number;
    total_earnings: number;
    total_distance: number;
};
