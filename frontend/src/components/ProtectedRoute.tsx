import { Spinner } from "@/components/Spinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Navigate, Outlet } from "react-router";

export const ProtectedRoute = () => {
    const { isLoading, isError, data: user } = useCurrentUser();
    if (isLoading) return <Spinner />;
    if (isError || !user) return <Navigate to="/authorization" replace />;

    return <Outlet />;
};
