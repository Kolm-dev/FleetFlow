import Navbar from "@/components/Navbar";
import Logout from "@/components/Logout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";

export const Header = () => {
    const { data: user } = useCurrentUser();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const closeMenuTimeoutRef = useRef<number | null>(null);

    const openUserMenu = () => {
        if (closeMenuTimeoutRef.current !== null) {
            window.clearTimeout(closeMenuTimeoutRef.current);
        }

        setIsUserMenuOpen(true);
    };

    const closeUserMenu = () => {
        if (isLogoutConfirmOpen) return;

        closeMenuTimeoutRef.current = window.setTimeout(() => {
            setIsUserMenuOpen(false);
        }, 200);
    };

    useEffect(() => {
        if (!isUserMenuOpen || isLogoutConfirmOpen) return;

        const handleDocumentMouseLeave = () => {
            setIsUserMenuOpen(false);
        };

        document.addEventListener("mouseleave", handleDocumentMouseLeave);

        return () => {
            document.removeEventListener(
                "mouseleave",
                handleDocumentMouseLeave,
            );
        };
    }, [isLogoutConfirmOpen, isUserMenuOpen]);

    useEffect(() => {
        return () => {
            if (closeMenuTimeoutRef.current !== null) {
                window.clearTimeout(closeMenuTimeoutRef.current);
            }
        };
    }, []);

    return (
        <header className="header">
            <Navbar />

            <div
                className="header__actions"
                onMouseEnter={openUserMenu}
                onMouseLeave={closeUserMenu}
            >
                <button
                    className="header__user"
                    type="button"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="menu"
                    onClick={() =>
                        setIsUserMenuOpen((currentValue) => !currentValue)
                    }
                >
                    {user?.name}
                </button>

                {isUserMenuOpen && (
                    <div
                        className="header__user-menu"
                        onMouseEnter={openUserMenu}
                        onMouseLeave={closeUserMenu}
                        role="menu"
                    >
                        <NavLink
                            className="settings-link"
                            onClick={() => setIsUserMenuOpen(false)}
                            role="menuitem"
                            to="/pricing-settings"
                        >
                            Pricing
                        </NavLink>
                        <Logout
                            onConfirmOpenChange={setIsLogoutConfirmOpen}
                        />
                    </div>
                )}
            </div>
        </header>
    );
};
