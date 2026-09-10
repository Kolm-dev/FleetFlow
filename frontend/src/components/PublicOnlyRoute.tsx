import { Spinner } from "@/components/Spinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Navigate, Outlet } from "react-router";

const PublicOnlyRoute = () => {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading)
        return (
            <div className=".center-x-y">
                <Spinner />
            </div>
        );

    if (user) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default PublicOnlyRoute;
