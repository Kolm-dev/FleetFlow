import type { Stats } from "@/types/statsTypes";

export type SetupStep = {
    title: string;
    description: string;
    to: string;
    linkLabel: string;
    isDone: boolean;
    isLocked: boolean;
    lockedReason?: string;
};

export const getSetupSteps = (stats: Stats): SetupStep[] => {
    const hasDrivers = stats.drivers.total > 0;
    const hasVehicles = stats.vehicles.total > 0;
    const hasClients = stats.setup.clients_total > 0;
    const hasReadyDrivers = stats.setup.drivers_ready > 0;

    return [
        {
            title: "Add a driver",
            description: "Drivers are required for vehicles and trips.",
            to: "/drivers/create",
            linkLabel: "Create driver",
            isDone: hasDrivers,
            isLocked: false,
        },
        {
            title: "Review pricing",
            description: "Default values are used until you save your own trip and fuel prices.",
            to: "/pricing-settings",
            linkLabel: "Open pricing",
            isDone: stats.setup.pricing_configured,
            isLocked: false,
        },
        {
            title: "Add a vehicle",
            description: "Each vehicle is assigned to a driver.",
            to: "/vehicles/create",
            linkLabel: "Create vehicle",
            isDone: hasVehicles,
            isLocked: !hasDrivers,
            lockedReason: "Add a driver first.",
        },
        {
            title: "Add a client",
            description: "Every trip is created for a client.",
            to: "/clients/create",
            linkLabel: "Create client",
            isDone: hasClients,
            isLocked: false,
        },
        {
            title: "Create a trip",
            description: "Needs an available driver with a vehicle and a client.",
            to: "/trips/create",
            linkLabel: "Create trip",
            isDone: stats.trips.total > 0,
            isLocked: !hasReadyDrivers || !hasClients,
            lockedReason: !hasClients
                ? "Add a client first."
                : "Add an available driver with a vehicle first.",
        },
    ];
};
