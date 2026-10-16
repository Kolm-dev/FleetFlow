import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Outlet, useLocation } from "react-router";

export const MainLayout = () => {
    const { pathname } = useLocation();
    const isVehicleDetailsPage = /^\/vehicles\/\d+\/?$/.test(pathname);

    return (
        <>
            <Header />
            <main className={`container mx-auto w-full max-w-5xl ${isVehicleDetailsPage ? "max-sm:w-full max-sm:px-0 max-sm:py-0" : ""}`}>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};
