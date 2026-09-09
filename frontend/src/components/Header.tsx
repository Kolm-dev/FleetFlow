import Navbar from "@/components/Navbar";
import Logout from "@/components/Logout";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const Header = () => {
    const { data: user } = useCurrentUser();

    return (
        <header className="header">
            <Navbar />

            <div className="header__actions">
                <p className="header__user">{user?.name}</p>
                <Logout />
            </div>
        </header>
    );
};
