import { logout } from "@/api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";

type LogoutProps = {
    onConfirmOpenChange?: (isOpen: boolean) => void;
};

const Logout = ({ onConfirmOpenChange }: LogoutProps) => {
    const queryClient = useQueryClient();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const navigate = useNavigate();
    const { mutate: logoutMutate } = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.setQueryData(["currentUser"], null);
            navigate("/authorization", { replace: true });
        },
    });
    const handleLogoutButton = () => {
        logoutMutate();
    };

    const openConfirm = () => {
        setIsConfirmOpen(true);
        onConfirmOpenChange?.(true);
    };

    const closeConfirm = () => {
        setIsConfirmOpen(false);
        onConfirmOpenChange?.(false);
    };

    return (
        <>
            <button
                className="logout-button"
                type="button"
                onClick={openConfirm}
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
                                onClick={closeConfirm}
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
