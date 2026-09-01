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
    };
};
