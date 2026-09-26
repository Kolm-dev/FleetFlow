import { Home } from "@/pages/Home";
import { DriversList } from "@/pages/Drivers/DriversList";
import VehiclesList from "@/pages/Vehicles/VehiclesList";
import { DriverCard } from "@/pages/Drivers/DriverCard";
import { MainLayout } from "@/layouts/MainLayout";
import { NotFound } from "@/layouts/NotFound";

import { Route, Routes } from "react-router";
import TripsList from "@/pages/Trips/TripsList";
import { DriverEdit } from "@/pages/Drivers/DriverEdit";
import { DriverCreate } from "@/pages/Drivers/DriverCreate";
import { VehicleCard } from "@/pages/Vehicles/VehicleCard";
import { VehicleEdit } from "@/pages/Vehicles/VehicleEdit";
import VehicleCreate from "@/pages/Vehicles/VehicleCreate";
import TripEdit from "@/pages/Trips/TripEdit";
import { TripCreate } from "@/pages/Trips/TripCreate";
import Authorization from "@/pages/Authorization";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import PublicOnlyRoute from "@/components/Auth/PublicOnlyRoute";
import { Register } from "@/components/Auth/Register";
import { PricingSettings } from "@/pages/PricingSettings";

export const App = () => {
    return (
        <>
            <Routes>
                <Route element={<PublicOnlyRoute />}>
                    <Route path="authorization" element={<Authorization />} />
                    <Route path="registration" element={<Register />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route index element={<Home />} />

                        <Route path="drivers" element={<DriversList />} />
                        <Route
                            path="drivers/:driverId"
                            element={<DriverCard />}
                        />
                        <Route
                            path="drivers/:id/edit"
                            element={<DriverEdit />}
                        />
                        <Route
                            path="drivers/create"
                            element={<DriverCreate />}
                        />

                        <Route path="vehicles" element={<VehiclesList />} />
                        <Route
                            path="vehicles/:vehicleId"
                            element={<VehicleCard />}
                        />
                        <Route
                            path="vehicles/:id/edit"
                            element={<VehicleEdit />}
                        />
                        <Route
                            path="vehicles/create"
                            element={<VehicleCreate />}
                        />

                        <Route path="trips" element={<TripsList />} />
                        <Route
                            path="trips/:tripsId/edit"
                            element={<TripEdit />}
                        />
                        <Route path="trips/create" element={<TripCreate />} />

                        <Route
                            path="pricing-settings"
                            element={<PricingSettings />}
                        />

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Route>
            </Routes>
        </>
    );
};
