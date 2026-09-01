import { Home } from "@/pages/Home";
import { DriversList } from "@/pages/DriversList";
import VehiclesList from "@/pages/VehiclesList";
import { DriverCard } from "@/pages/DriverCard";
import { MainLayout } from "@/layouts/MainLayout";
import { NotFound } from "@/layouts/NotFound";

import { Route, Routes } from "react-router";
import TripsList from "@/pages/TripsList";
import { DriverEdit } from "@/pages/DriverEdit";
import { DriverCreate } from "@/pages/DriverCreate";
import { VehicleCard } from "@/pages/VehicleCard";
import { VehicleEdit } from "@/pages/VehicleEdit";
import VehicleCreate from "@/pages/VehicleCreate";
import TripEdit from "@/pages/TripEdit";

export const App = () => {
    return (
        <>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="drivers" element={<DriversList />} />
                    <Route path="drivers/:driverId" element={<DriverCard />} />
                    <Route path="drivers/:id/edit" element={<DriverEdit />} />
                    <Route path="drivers/create" element={<DriverCreate />} />

                    <Route path="vehicles" element={<VehiclesList />} />
                    <Route
                        path="vehicles/:vehicleId"
                        element={<VehicleCard />}
                    />
                    <Route path="vehicles/:id/edit" element={<VehicleEdit />} />
                    <Route path="vehicles/create" element={<VehicleCreate />} />

                    <Route path="trips" element={<TripsList />} />
                    <Route path="trips/:tripsId/edit" element={<TripEdit />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </>
    );
};
