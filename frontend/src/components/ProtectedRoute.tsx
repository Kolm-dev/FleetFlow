import { Spinner } from "@/components/Spinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Navigate, Outlet } from "react-router";

export const ProtectedRoute = () => {
    const { isLoading, isError, data: user } = useCurrentUser();
    if (isLoading)
        return (
            <div className="center-x-y">
                <Spinner />
            </div>
        );
    if (isError || !user) return <Navigate to="/authorization" replace />;

    return <Outlet />;
};
