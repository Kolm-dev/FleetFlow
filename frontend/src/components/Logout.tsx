import { logout } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";

const Logout = () => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const navigate = useNavigate();
    const { mutate: logoutMutate } = useMutation({
        mutationFn: logout,
        onSuccess: () => navigate("/authorization"),
    });
    const handleLogoutButton = () => {
        logoutMutate();
    };
    return (
        <>
            <button
                className="logout-button"
                type="button"
                onClick={() => setIsConfirmOpen(true)}
            >
                Logout
            </button>

            {isConfirmOpen && (
                <div className="logout-modal" role="dialog" aria-modal="true">
                    <div className="logout-modal__content">
                        <h2>Confirm logout</h2>
                        <p>Are you sure you want to sign out?</p>

                        <div className="logout-modal__actions">
                            <button
                                onClick={handleLogoutButton}
                                className="logout-button"
                                type="button"
                            >
                                Logout
                            </button>
                            <button
                                className="logout-modal__cancel"
                                type="button"
                                onClick={() => setIsConfirmOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Logout;
